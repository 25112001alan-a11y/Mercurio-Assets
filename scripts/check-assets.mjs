#!/usr/bin/env node
// Fails when an asset would silently 404 on jsDelivr.
// Limits verified against jsDelivr docs + jsdelivr/jsdelivr README:
//   20 MB per file (hard, /gh/ repos) | 50 MB per repo (soft) | Git LFS not served
// A past-limit file does not degrade, it errors. That's why this is a gate.

import { readdirSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { join, relative, extname } from "node:path";

const MB = 1024 * 1024;
const FILE_LIMIT = 20 * MB;
const REPO_WARN = 50 * MB;
const BIG_WARN = 5 * MB;
const SKIP_DIRS = new Set([".git", "node_modules", "scripts"]);
const LFS_PREFIX = "version https://git-lfs";

const errors = [];
const warnings = [];
let total = 0;
let count = 0;

function isLfsPointer(file) {
  const fd = openSync(file, "r");
  try {
    const buf = Buffer.alloc(LFS_PREFIX.length + 1);
    const read = readSync(fd, buf, 0, buf.length, 0);
    return buf.subarray(0, read).toString("utf8").startsWith(LFS_PREFIX);
  } finally {
    closeSync(fd);
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name));
      continue;
    }
    const file = join(dir, entry.name);
    const rel = relative(process.cwd(), file).replaceAll("\\", "/");
    const { size } = statSync(file);
    total += size;
    count++;

    if (size > FILE_LIMIT) {
      errors.push(`${rel} is ${(size / MB).toFixed(1)} MB — over the 20 MB jsDelivr limit, this URL will fail`);
    } else if (size > BIG_WARN) {
      warnings.push(`${rel} is ${(size / MB).toFixed(1)} MB — probably unoptimized, try webp/avif`);
    }

    if (size < 200 && isLfsPointer(file)) {
      errors.push(`${rel} is a Git LFS pointer — jsDelivr does not serve LFS content`);
    }
  }
}

walk(process.cwd());

for (const w of warnings) console.warn(`warn  ${w}`);
if (total > REPO_WARN) {
  console.warn(`warn  repo is ${(total / MB).toFixed(1)} MB — over the 50 MB soft limit`);
}
console.log(`checked ${count} file(s), ${(total / MB).toFixed(2)} MB total`);

if (errors.length) {
  for (const e of errors) console.error(`FAIL  ${e}`);
  process.exit(1);
}
