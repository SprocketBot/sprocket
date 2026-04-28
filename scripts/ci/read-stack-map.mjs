#!/usr/bin/env node
/**
 * Read infra/ci/stack-map.yaml and emit GitHub Actions outputs (plan JSON, counts, project list).
 * No secrets. Consumed by .github/workflows/_reusable-pulumi-deploy.yml (#682).
 *
 * Usage:
 *   node scripts/ci/read-stack-map.mjs emit --plan <plan> [--target <dev|staging|prod>] [--platform-stack NAME] [--prepend-staging-promote] [--git-sha SHA]
 *
 * Plans:
 *   prod_cd                 — batch: all previews then all ups (production deploy_order)
 *   staging_up              — up only, staging deploy_order
 *   staging_promote_then_up — optional first row: staging_promote (caller runs promote script), then staging_up
 *   dev_layers_interleaved  — preview+up per stack for non-platform entries in dev
 *   dev_platform_interleaved — preview+up for platform row(s) in dev deploy_order
 *   dev_cd_full             — dev CD: layer preview/up pairs then platform preview/up (platform stack from --platform-stack)
 *   dev_preview_all         — preview only, full dev deploy_order (PR stack-map integration test)
 *
 * When --git-sha is provided for deploy-style plans, the emitted order is scoped to the changed
 * files in that commit. App-only changes deploy platform only; lower-layer infra changes pull in
 * the affected layer plus platform; shared infra / workflow changes keep the full order.
 */
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const MAP_PATH = resolve(REPO_ROOT, 'infra/ci/stack-map.yaml');

const SHARED_PATH_PREFIXES = [
  'infra/global/',
  'scripts/infra/',
  '.github/reusable_workflows/pulumi_up/',
];

const SHARED_PATHS = new Set([
  '.github/workflows/_reusable-pulumi-deploy.yml',
  '.github/workflows/cd-deploy-dev.yml',
  '.github/workflows/cd-deploy-prod.yml',
  '.github/workflows/cd-promote-dev-to-staging.yml',
  '.github/workflows/ci-stack-map-pulumi-preview.yml',
  '.github/workflows/infra-pulumi.yml',
  'infra/ci/stack-map.yaml',
  'package.json',
  '.nvmrc',
  'scripts/ci/read-stack-map.mjs',
]);

function parseArgs(argv) {
  const out = {
    plan: null,
    target: null,
    platformStack: null,
    prependStagingPromote: false,
    gitSha: null,
  };
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
    if (a === '--git-sha') {
      out.gitSha = argv[++i];
      continue;
    }
    console.error(`Unknown argument: ${a}`);
    process.exit(1);
  }
  return out;
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseStackMap() {
  if (!existsSync(MAP_PATH)) {
    console.error(`read-stack-map: missing ${MAP_PATH}`);
    process.exit(1);
  }

  const environments = {};
  const lines = readFileSync(MAP_PATH, 'utf8').split(/\r?\n/);
  let section = null;
  let currentEnv = null;
  let inDeployOrder = false;
  let pendingEntry = null;

  const commitPendingEntry = () => {
    if (!currentEnv || !pendingEntry) {
      return;
    }
    if (typeof pendingEntry.project !== 'string' || typeof pendingEntry.stack !== 'string') {
      throw new Error(`Invalid deploy_order entry: ${JSON.stringify(pendingEntry)}`);
    }
    environments[currentEnv].deploy_order.push({
      project: unquote(pendingEntry.project.trim()),
      stack: unquote(pendingEntry.stack.trim()),
    });
    pendingEntry = null;
  };

  for (const rawLine of lines) {
    const commentIndex = rawLine.indexOf('#');
    const line = (commentIndex === -1 ? rawLine : rawLine.slice(0, commentIndex)).replace(/\s+$/, '');
    if (line.trim() === '') {
      continue;
    }

    if (line === 'environments:') {
      section = 'environments';
      currentEnv = null;
      inDeployOrder = false;
      pendingEntry = null;
      continue;
    }

    if (!line.startsWith(' ')) {
      if (section === 'environments') {
        commitPendingEntry();
      }
      section = null;
      currentEnv = null;
      inDeployOrder = false;
      pendingEntry = null;
      continue;
    }

    if (section !== 'environments') {
      continue;
    }

    const envMatch = line.match(/^  ([A-Za-z0-9_-]+):\s*$/);
    if (envMatch) {
      commitPendingEntry();
      currentEnv = envMatch[1];
      environments[currentEnv] = { deploy_order: [] };
      inDeployOrder = false;
      continue;
    }

    if (!currentEnv) {
      continue;
    }

    if (/^    deploy_order:\s*$/.test(line)) {
      commitPendingEntry();
      inDeployOrder = true;
      continue;
    }

    if (!inDeployOrder) {
      continue;
    }

    const inlineEntry = line.match(
      /^      - \{\s*project:\s*([^,}]+)\s*,\s*stack:\s*([^,}]+)\s*\}\s*$/,
    );
    if (inlineEntry) {
      commitPendingEntry();
      environments[currentEnv].deploy_order.push({
        project: unquote(inlineEntry[1].trim()),
        stack: unquote(inlineEntry[2].trim()),
      });
      continue;
    }

    const blockProject = line.match(/^      - project:\s*(.+?)\s*$/);
    if (blockProject) {
      commitPendingEntry();
      pendingEntry = { project: blockProject[1], stack: null };
      continue;
    }

    const blockStack = line.match(/^        stack:\s*(.+?)\s*$/);
    if (blockStack && pendingEntry) {
      pendingEntry.stack = blockStack[1];
      commitPendingEntry();
    }
  }

  if (section === 'environments') {
    commitPendingEntry();
  }

  return environments;
}

function loadOrder(target) {
  const doc = parseStackMap();
  const envSection = doc[target];
  const order = envSection?.deploy_order;
  if (!Array.isArray(order) || order.length === 0) {
    console.error(`read-stack-map: environments.${target}.deploy_order missing or empty`);
    process.exit(1);
  }
  return order.map((row) => ({ project: row.project, stack: row.stack }));
}

function readChangedPaths(gitSha) {
  if (!gitSha) {
    return [];
  }

  try {
    const output = execFileSync(
      'git',
      ['diff-tree', '--no-commit-id', '--name-only', '-r', '--root', gitSha],
      { cwd: REPO_ROOT, encoding: 'utf8' },
    );
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    console.error(`read-stack-map: failed to diff changed files for ${gitSha}`);
    console.error(String(error instanceof Error ? error.message : error));
    process.exit(1);
  }
}

function isSharedPath(path) {
  if (SHARED_PATHS.has(path)) {
    return true;
  }
  return SHARED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function scopeDeployOrder(order, gitSha) {
  if (!gitSha) {
    return order;
  }

  const changedPaths = readChangedPaths(gitSha);
  if (changedPaths.length === 0) {
    return order;
  }

  let touchesShared = false;
  let touchesLayer1 = false;
  let touchesLayer2 = false;
  let touchesPlatform = false;

  for (const path of changedPaths) {
    if (isSharedPath(path)) {
      touchesShared = true;
      break;
    }
    if (path.startsWith('infra/layer_1/')) {
      touchesLayer1 = true;
      continue;
    }
    if (path.startsWith('infra/layer_2/')) {
      touchesLayer2 = true;
      continue;
    }
    if (path.startsWith('infra/platform/')) {
      touchesPlatform = true;
    }
  }

  if (touchesShared) {
    return order;
  }

  const neededProjects = new Set(['platform']);
  if (touchesLayer1) {
    neededProjects.add('layer_1');
  }
  if (touchesLayer2) {
    neededProjects.add('layer_2');
  }
  if (touchesPlatform) {
    neededProjects.add('platform');
  }

  return order.filter((row) => neededProjects.has(row.project));
}

function writeOut(line) {
  const outPath = process.env.GITHUB_OUTPUT;
  if (outPath) {
    appendFileSync(outPath, `${line}\n`, 'utf8');
  } else {
    process.stdout.write(`${line}\n`);
  }
}

function writeJsonOutput(key, value) {
  const json = JSON.stringify(value);
  const token = `__${key.toUpperCase()}_EOF__`;
  writeOut(`${key}<<${token}\n${json}\n${token}`);
}

function emitPlan(rows) {
  const projects = [...new Set(rows.map((row) => row.stack_project).filter((name) => !name.startsWith('_')))];
  writeJsonOutput('plan_json', rows);
  writeJsonOutput('matrix_json', rows);
  writeJsonOutput('projects_json', projects);
  writeOut(`plan_len=${rows.length}`);
  writeOut(`matrix_len=${rows.length}`);
  writeOut(`projects_len=${projects.length}`);
}

const args = parseArgs(process.argv);
const {
  plan,
  target: targetArg,
  platformStack: platformStackArg,
  prependStagingPromote,
  gitSha,
} = args;

if (!plan) {
  console.error(
    'usage: node scripts/ci/read-stack-map.mjs emit --plan <prod_cd|staging_up|dev_layers_interleaved|dev_platform_interleaved|dev_cd_full|dev_preview_all> [--target dev|staging|prod] [--platform-stack NAME] [--prepend-staging-promote] [--git-sha SHA]',
  );
  process.exit(1);
}

/** @type {{ project: string, stack: string }[]} */
let order;
/** @type {{ stack_project: string, stack_name: string, command: string }[]} */
let planRows = [];

if (plan === 'prod_cd') {
  order = scopeDeployOrder(loadOrder('prod'), gitSha);
  for (const s of order) {
    planRows.push({ stack_project: s.project, stack_name: s.stack, command: 'preview' });
  }
  for (const s of order) {
    planRows.push({ stack_project: s.project, stack_name: s.stack, command: 'up' });
  }
} else if (plan === 'staging_up') {
  if (prependStagingPromote) {
    planRows.push({
      stack_project: '_staging_promote_',
      stack_name: '_staging_promote_',
      command: 'staging_promote',
    });
  }
  order = scopeDeployOrder(loadOrder('staging'), gitSha);
  for (const s of order) {
    planRows.push({ stack_project: s.project, stack_name: s.stack, command: 'up' });
  }
} else if (plan === 'dev_layers_interleaved') {
  order = loadOrder('dev');
  const layers = order.filter((s) => s.project !== 'platform');
  for (const s of layers) {
    planRows.push({ stack_project: s.project, stack_name: s.stack, command: 'preview' });
    planRows.push({ stack_project: s.project, stack_name: s.stack, command: 'up' });
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
    planRows.push({ stack_project: s.project, stack_name: platStackName, command: 'preview' });
    planRows.push({ stack_project: s.project, stack_name: platStackName, command: 'up' });
  }
} else if (plan === 'dev_cd_full') {
  if (!platformStackArg) {
    console.error('read-stack-map: dev_cd_full requires --platform-stack');
    process.exit(1);
  }
  order = scopeDeployOrder(loadOrder('dev'), gitSha);
  for (const s of order) {
    const stackName = s.project === 'platform' ? platformStackArg : s.stack;
    if (s.project === 'platform') {
      planRows.push({ stack_project: s.project, stack_name: stackName, command: 'refresh' });
    }
    planRows.push({ stack_project: s.project, stack_name: stackName, command: 'preview' });
    planRows.push({ stack_project: s.project, stack_name: stackName, command: 'up' });
  }
} else if (plan === 'dev_preview_all') {
  const t = targetArg || 'dev';
  if (!['dev', 'staging', 'prod'].includes(t)) {
    console.error('read-stack-map: --target must be dev, staging, or prod');
    process.exit(1);
  }
  order = loadOrder(t);
  for (const s of order) {
    planRows.push({ stack_project: s.project, stack_name: s.stack, command: 'preview' });
  }
} else {
  console.error(`read-stack-map: unknown plan: ${plan}`);
  process.exit(1);
}

emitPlan(planRows);
