/*
  Merge LCOV files and print combined coverage summary.
  Usage: node scripts/merge-lcov.js <lcov1> <lcov2> [...]
*/
const fs = require('node:fs')
const path = require('node:path')

function parseLcov(lcovText) {
  const totals = {
    linesFound: 0,
    linesHit: 0,
    branchesFound: 0,
    branchesHit: 0,
    functionsFound: 0,
    functionsHit: 0,
  }

  // Sum per-file LF/LH, BRF/BRH, FNF/FNH
  const lfRegex = /^LF:(\d+)/gm
  const lhRegex = /^LH:(\d+)/gm
  const brfRegex = /^BRF:(\d+)/gm
  const brhRegex = /^BRH:(\d+)/gm
  const fnfRegex = /^FNF:(\d+)/gm
  const fnhRegex = /^FNH:(\d+)/gm

  for (const [regex, key] of [
    [lfRegex, 'linesFound'],
    [lhRegex, 'linesHit'],
    [brfRegex, 'branchesFound'],
    [brhRegex, 'branchesHit'],
    [fnfRegex, 'functionsFound'],
    [fnhRegex, 'functionsHit'],
  ]) {
    let m
    while ((m = regex.exec(lcovText)) !== null) {
      totals[key] += Number(m[1] || 0)
    }
  }

  return totals
}

function pct(hit, found) {
  if (!found) return 100
  return (hit / found) * 100
}

function main() {
  const files = process.argv.slice(2)
  if (files.length === 0) {
    console.error('Usage: node scripts/merge-lcov.js <lcov1> <lcov2> [...]')
    process.exit(2)
  }

  const combined = {
    linesFound: 0,
    linesHit: 0,
    branchesFound: 0,
    branchesHit: 0,
    functionsFound: 0,
    functionsHit: 0,
  }

  for (const f of files) {
    const content = fs.readFileSync(path.resolve(f), 'utf8')
    const p = parseLcov(content)
    for (const k of Object.keys(combined)) {
      combined[k] += p[k]
    }
  }

  const lines = pct(combined.linesHit, combined.linesFound)
  const branches = pct(combined.branchesHit, combined.branchesFound)
  const functions = pct(combined.functionsHit, combined.functionsFound)

  const fmt = (n) => `${n.toFixed(2)}%`
  console.log('Combined coverage:')
  console.log(`  Lines:     ${fmt(lines)} (${combined.linesHit}/${combined.linesFound})`)
  console.log(`  Branches:  ${fmt(branches)} (${combined.branchesHit}/${combined.branchesFound})`)
  console.log(`  Functions: ${fmt(functions)} (${combined.functionsHit}/${combined.functionsFound})`)

  // Enforce 80% minimum across lines and branches globally
  const ok = lines >= 80 && branches >= 80
  process.exitCode = ok ? 0 : 1
}
try { main() } catch (err) { console.error(err); process.exit(1) }


