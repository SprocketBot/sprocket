#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const {JSDOM} = require("jsdom");

const usage = `
Usage:
  node scripts/compile-figma-template.js --in path/to/template.svg --out path/to/output.svg

Figma naming convention (layer name/id):
  sprocket__<type>__<varPath>__<optKey>=<optVal>__<optKey>=<optVal>

Examples:
  sprocket__text__game.title__h=right__v=center__case=upper__truncate=as-is
  sprocket__fill__team_primary_color
  sprocket__image__organization.logo_url__rescale=height
`;

function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        const key = argv[i];
        if (!key.startsWith("--")) continue;
        const next = argv[i + 1];
        if (!next || next.startsWith("--")) {
            args[key] = true;
            continue;
        }
        args[key] = next;
        i++;
    }
    return args;
}

function normalizeOptionKey(key) {
    switch (key) {
        case "h":
        case "h-align":
            return "h-align";
        case "v":
        case "v-align":
            return "v-align";
        case "truncate":
        case "truncate-to":
            return "truncate-to";
        case "case":
            return "case";
        case "rescale":
        case "rescaleOn":
            return "rescaleOn";
        default:
            return key;
    }
}

function parseOptionValue(key, value) {
    if (key === "truncate-to") {
        if (value === "as-is") return value;
        const parsed = Number.parseInt(value, 10);
        if (Number.isFinite(parsed)) return parsed;
        return "as-is";
    }
    return value;
}

function buildOptions(type, rawOptions) {
    const options = {};
    for (const [key, value] of Object.entries(rawOptions)) {
        if (value == null) continue;
        options[key] = value;
    }
    if (type === "image") {
        if (!options.rescaleOn) {
            options.rescaleOn = "height";
        }
    }
    return options;
}

function parseSprocketId(id) {
    if (!id || !id.startsWith("sprocket__")) return null;
    const parts = id.split("__").slice(1);
    if (parts.length < 2) return null;
    const [type, varPath, ...optionParts] = parts;
    const rawOptions = {};
    for (const part of optionParts) {
        if (!part) continue;
        const [rawKey, rawValue] = part.split("=");
        if (!rawKey) continue;
        const key = normalizeOptionKey(rawKey);
        rawOptions[key] = rawValue ?? "true";
    }
    const options = buildOptions(type, Object.fromEntries(
        Object.entries(rawOptions).map(([key, value]) => [key, parseOptionValue(key, value)]),
    ));
    return {
        varPath,
        type,
        options,
    };
}

function main() {
    const args = parseArgs(process.argv);
    const inputPath = args["--in"];
    const outputPath = args["--out"];
    if (!inputPath || !outputPath) {
        console.error(usage.trim());
        process.exit(1);
    }
    if (!fs.existsSync(inputPath)) {
        console.error(`Input not found: ${inputPath}`);
        process.exit(1);
    }
    const svgText = fs.readFileSync(inputPath, "utf8");
    const dom = new JSDOM(svgText);
    const svgRoot = dom.window.document.body.children[0];
    if (!svgRoot || svgRoot.nodeName !== "svg") {
        console.error("Expected root <svg> element.");
        process.exit(1);
    }

    const elements = Array.from(svgRoot.querySelectorAll("[id]"));
    let updatedCount = 0;
    for (const el of elements) {
        if (el.hasAttribute("data-sprocket")) continue;
        const id = el.getAttribute("id");
        const parsed = parseSprocketId(id);
        if (!parsed) continue;
        el.setAttribute("data-sprocket", JSON.stringify([parsed]));
        updatedCount++;
    }

    fs.mkdirSync(path.dirname(outputPath), {recursive: true});
    fs.writeFileSync(outputPath, svgRoot.outerHTML);
    console.log(`Compiled ${updatedCount} bindings -> ${outputPath}`);
}

main();
