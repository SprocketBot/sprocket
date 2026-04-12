#!/usr/bin/env node
/**
 * Read infra/ci/stack-map.yaml and emit GitHub Actions outputs (matrix JSON, counts).
 * No secrets. Consumed by .github/workflows/_reusable-pulumi-deploy.yml (#682).
 *
 * Usage:
 *   node scripts/ci/read-stack-map.mjs emit --plan <plan> [--target <dev|staging|prod>] [--platform-stack NAME] [--prepend-staging-promote]
 *
 * Plans:
 *   prod_cd              — batch: all previews then all ups (production deploy_order)
 *   staging_up           — up only, staging deploy_order
 *   staging_promote_then_up — optional first row: staging_promote (caller runs promote script), then staging_up
 *   dev_layers_interleaved — preview+up per stack for non-platform entries in dev
 *   dev_platform_interleaved — preview+up for platform row(s) in dev deploy_order
 *   dev_cd_full          — dev CD: layer preview/up pairs then platform preview/up (platform stack from --platform-stack)
 *   dev_preview_all      — preview only, full dev deploy_order (PR stack-map integration test)
 */
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const MAP_PATH = resolve(REPO_ROOT, 'infra/ci/stack-map.yaml');

function parseArgs(argv) {
  const out = { plan: null, target: null, platformStack: null, prependStagingPromote: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === 'emit') continue;
    if (a === '--plan') {
      out.plan = argv[++i];
      continue;
    }
    if (a === '--target') {
      out.target = argv[++i];
      continue;
    }
    if (a === '--platform-stack') {
      out.platformStack = argv[++i];
      continue;
    }
    if (a === '--prepend-staging-promote') {
      out.prependStagingPromote = true;
      continue;
    }
    console.error(`Unknown argument: ${a}`);
    process.exit(1);
  }
  return out;
}

function loadOrder(target) {
  if (!existsSync(MAP_PATH)) {
    console.error(`read-stack-map: missing ${MAP_PATH}`);
    process.exit(1);
  }
  const doc = YAML.parse(readFileSync(MAP_PATH, 'utf8'));
  const envSection = doc?.environments?.[target];
  const order = envSection?.deploy_order;
  if (!Array.isArray(order) || order.length === 0) {
    console.error(`read-stack-map: environments.${target}.deploy_order missing or empty`);
    process.exit(1);
  }
  return order.map((row) => {
    if (!row || typeof row.project !== 'string' || typeof row.stack !== 'string') {
      throw new Error(`Invalid deploy_order entry: ${JSON.stringify(row)}`);
    }
    return { project: row.project, stack: row.stack };
  });
}

function writeOut(line) {
  const outPath = process.env.GITHUB_OUTPUT;
  if (outPath) {
    appendFileSync(outPath, `${line}\n`, 'utf8');
  } else {
    process.stdout.write(`${line}\n`);
  }
}

function emitMatrix(rows) {
  const json = JSON.stringify(rows);
  writeOut(`matrix_json<<__MATRIX_EOF__\n${json}\n__MATRIX_EOF__`);
  writeOut(`matrix_len=${rows.length}`);
}

const args = parseArgs(process.argv);
const { plan, target: targetArg, platformStack: platformStackArg, prependStagingPromote } = args;

if (!plan) {
  console.error(
    'usage: node scripts/ci/read-stack-map.mjs emit --plan <prod_cd|staging_up|dev_layers_interleaved|dev_platform_interleaved|dev_cd_full|dev_preview_all> [--target dev|staging|prod] [--platform-stack NAME]',
  );
  process.exit(1);
}

/** @type {{ project: string, stack: string }[]} */
let order;
/** @type {{ stack_project: string, stack_name: string, command: string }[]} */
let matrix = [];

if (plan === 'prod_cd') {
  order = loadOrder('prod');
  for (const s of order) {
    matrix.push({ stack_project: s.project, stack_name: s.stack, command: 'preview' });
  }
  for (const s of order) {
    matrix.push({ stack_project: s.project, stack_name: s.stack, command: 'up' });
  }
} else if (plan === 'staging_up') {
  if (prependStagingPromote) {
    matrix.push({
      stack_project: '_staging_promote_',
      stack_name: '_staging_promote_',
      command: 'staging_promote',
    });
  }
  order = loadOrder('staging');
  for (const s of order) {
    matrix.push({ stack_project: s.project, stack_name: s.stack, command: 'up' });
  }
} else if (plan === 'dev_layers_interleaved') {
  order = loadOrder('dev');
  const layers = order.filter((s) => s.project !== 'platform');
  for (const s of layers) {
    matrix.push({ stack_project: s.project, stack_name: s.stack, command: 'preview' });
    matrix.push({ stack_project: s.project, stack_name: s.stack, command: 'up' });
  }
} else if (plan === 'dev_platform_interleaved') {
  order = loadOrder('dev');
  const platforms = order.filter((s) => s.project === 'platform');
  if (platforms.length === 0) {
    console.error('read-stack-map: dev deploy_order has no platform entry');
    process.exit(1);
  }
  const platStackName = platformStackArg || platforms[0].stack;
  for (const s of platforms) {
    matrix.push({ stack_project: s.project, stack_name: platStackName, command: 'preview' });
    matrix.push({ stack_project: s.project, stack_name: platStackName, command: 'up' });
  }
} else if (plan === 'dev_cd_full') {
  if (!platformStackArg) {
    console.error('read-stack-map: dev_cd_full requires --platform-stack');
    process.exit(1);
  }
  order = loadOrder('dev');
  const layers = order.filter((s) => s.project !== 'platform');
  for (const s of layers) {
    matrix.push({ stack_project: s.project, stack_name: s.stack, command: 'preview' });
    matrix.push({ stack_project: s.project, stack_name: s.stack, command: 'up' });
  }
  matrix.push({ stack_project: 'platform', stack_name: platformStackArg, command: 'preview' });
  matrix.push({ stack_project: 'platform', stack_name: platformStackArg, command: 'up' });
} else if (plan === 'dev_preview_all') {
  const t = targetArg || 'dev';
  if (!['dev', 'staging', 'prod'].includes(t)) {
    console.error('read-stack-map: --target must be dev, staging, or prod');
    process.exit(1);
  }
  order = loadOrder(t);
  for (const s of order) {
    matrix.push({ stack_project: s.project, stack_name: s.stack, command: 'preview' });
  }
} else {
  console.error(`read-stack-map: unknown plan: ${plan}`);
  process.exit(1);
}

emitMatrix(matrix);
