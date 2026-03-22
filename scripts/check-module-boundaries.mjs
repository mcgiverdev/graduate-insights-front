#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const modulesRoot = path.join(projectRoot, 'modules')
const baselineFilePath = path.join(projectRoot, 'architecture', 'module-boundaries-baseline.json')
const updateBaseline = process.argv.includes('--update-baseline')

const allowedCrossModuleTargets = new Set(['shared'])
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue'])

if (!fs.existsSync(modulesRoot)) {
  console.error('Modules directory not found:', modulesRoot)
  process.exit(1)
}

function walkFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walkFiles(fullPath, files)
      continue
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/')
}

function getImportMatches(content) {
  const matches = []
  const patterns = [
    /(?:import|export)\s+[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g,
    /import\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const fullMatch = match[0]
      const importPath = match[1]
      const quoteIndex = fullMatch.lastIndexOf(importPath)
      const absoluteIndex = match.index + Math.max(0, quoteIndex)
      matches.push({ importPath, absoluteIndex })
    }
  }

  return matches
}

function lineForIndex(content, index) {
  return content.slice(0, index).split(/\r?\n/).length
}

function resolveModulePath(importPath) {
  const prefixes = ['@/modules/', '~/modules/', 'modules/']

  for (const prefix of prefixes) {
    if (importPath.startsWith(prefix)) {
      return importPath.slice(prefix.length)
    }
  }

  return null
}

function collectViolations() {
  const files = walkFiles(modulesRoot)
  const violations = []

  for (const filePath of files) {
    const relativeToModules = toPosixPath(path.relative(modulesRoot, filePath))
    const sourceModule = relativeToModules.split('/')[0]

    const content = fs.readFileSync(filePath, 'utf8')
    const imports = getImportMatches(content)

    for (const item of imports) {
      const resolved = resolveModulePath(item.importPath)
      if (!resolved) {
        continue
      }

      const parts = resolved.split('/')
      const targetModule = parts[0]
      const targetRemainder = parts.slice(1)
      const isCrossModule = targetModule !== sourceModule
      const isAllowedTarget = allowedCrossModuleTargets.has(targetModule)
      const isDeepImport = targetRemainder.length > 0

      if (isCrossModule && !isAllowedTarget && isDeepImport) {
        violations.push({
          file: `modules/${relativeToModules}`,
          line: lineForIndex(content, item.absoluteIndex),
          sourceModule,
          targetModule,
          importPath: item.importPath,
          ruleId: 'no-cross-module-deep-imports',
        })
      }
    }
  }

  violations.sort((a, b) => {
    const left = `${a.file}:${a.line}:${a.importPath}`
    const right = `${b.file}:${b.line}:${b.importPath}`
    return left.localeCompare(right)
  })

  return violations
}

function violationKey(violation) {
  return `${violation.file}|${violation.importPath}|${violation.sourceModule}|${violation.targetModule}`
}

function readBaseline() {
  if (!fs.existsSync(baselineFilePath)) {
    return null
  }

  const raw = fs.readFileSync(baselineFilePath, 'utf8')
  return JSON.parse(raw)
}

function writeBaseline(violations) {
  const payload = {
    generatedAt: new Date().toISOString(),
    ruleId: 'no-cross-module-deep-imports',
    violations,
  }

  fs.mkdirSync(path.dirname(baselineFilePath), { recursive: true })
  fs.writeFileSync(baselineFilePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

const currentViolations = collectViolations()

if (updateBaseline) {
  writeBaseline(currentViolations)
  console.log(`Baseline updated with ${currentViolations.length} violation(s).`)
  process.exit(0)
}

const baseline = readBaseline()
if (!baseline) {
  console.error('Baseline file not found:', baselineFilePath)
  console.error('Run: npm run arch:boundaries:update-baseline')
  process.exit(1)
}

const baselineKeys = new Set((baseline.violations ?? []).map(violationKey))
const currentKeys = new Set(currentViolations.map(violationKey))

const newViolations = currentViolations.filter(item => !baselineKeys.has(violationKey(item)))
const resolvedCount = [...baselineKeys].filter(key => !currentKeys.has(key)).length

if (newViolations.length > 0) {
  console.error(`Found ${newViolations.length} new module boundary violation(s).`)

  for (const violation of newViolations) {
    console.error(
      `- ${violation.file}:${violation.line} (${violation.sourceModule} -> ${violation.targetModule}) ${violation.importPath}`,
    )
  }

  process.exit(1)
}

console.log(`No new module boundary violations. Existing baseline: ${baselineKeys.size}.`)
if (resolvedCount > 0) {
  console.log(`Resolved since baseline: ${resolvedCount}. You can refresh baseline when ready.`)
}
