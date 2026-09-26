#!/usr/bin/env node
// Installs the asset check as a local pre-commit hook.
// git does not track .git/hooks, so this is deliberately not a committed file.

import { writeFileSync, existsSync, mkdirSync, chmodSync } from "node:fs";
import { join } from "node:path";

const hooksDir = join(process.cwd(), ".git", "hooks");
const hook = join(hooksDir, "pre-commit");

if (!existsSync(join(process.cwd(), ".git"))) {
  console.error("not a git repo — run git init first");
  process.exit(1);
}
if (existsSync(hook)) {
  console.log("pre-commit hook already exists, leaving it alone");
  process.exit(0);
}

mkdirSync(hooksDir, { recursive: true });
// Git runs pre-commit with cwd = top level of the working tree, so a plain
// relative path is correct. ($0 is the git dir here, not the hook dir.)
writeFileSync(
  hook,
  `#!/bin/sh
exec node scripts/check-assets.mjs
`,
);
try {
  chmodSync(hook, 0o755);
} catch {
  // Windows: git runs hooks through sh, the exec bit is not required.
}
console.log("installed .git/hooks/pre-commit");
