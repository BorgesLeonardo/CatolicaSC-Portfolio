#!/usr/bin/env node
// Normalize LCOV paths so SonarCloud can resolve files in monorepo on Windows
// - Convert backslashes to forward slashes
// - Prefix paths with "backend/" when they start with "src/"
// Usage: node scripts/normalize-lcov.js coverage/lcov.info

import fs from 'fs';
import path from 'path';

const inputPath = process.argv[2] || 'coverage/lcov.info';
// Optional: --prefix=backend|frontend (default: backend)
const prefixArg = process.argv.find((a) => a.startsWith('--prefix='));
const projectPrefix = prefixArg ? prefixArg.split('=')[1] : 'backend';
const absPath = path.resolve(process.cwd(), inputPath);

if (!fs.existsSync(absPath)) {
  console.error(`[normalize-lcov] File not found: ${absPath}`);
  process.exit(0); // Non-fatal: skip silently in environments without coverage
}

const original = fs.readFileSync(absPath, 'utf8');

const normalized = original
  // Normalize "SF:" source file lines
  .replace(/^SF:(.+)$/gm, (_m, p1) => {
    // Convert backslashes to forward slashes
    let normalizedPath = p1.replace(/\\/g, '/');
    // Remove leading ./ if any
    normalizedPath = normalizedPath.replace(/^\.\//, '');
    // Prefix with chosen project dir if starts with src/
    if (normalizedPath.startsWith('src/')) {
      normalizedPath = `${projectPrefix}/${normalizedPath}`;
    }
    return `SF:${normalizedPath}`;
  });

if (normalized !== original) {
  fs.writeFileSync(absPath, normalized, 'utf8');
  console.log(`[normalize-lcov] Updated paths in ${inputPath}`);
} else {
  console.log('[normalize-lcov] No changes needed');
}


