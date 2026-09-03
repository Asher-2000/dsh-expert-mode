/**
 * @asherliner/dsh-expert-mode — DSH agent-preset plugin v0.9.2
 *
 * This is an AGENT-PRESET plugin. Unlike service plugins that provide
 * runtime Cordis services, an agent-preset plugin ships persona + subagent
 * configuration that DSH's preset discovery mounts into sessions.
 *
 * apply() copies the bundled preset files from this package into
 * ~/.dsh/.agent-presets/expert-mode/ so DSH can discover and mount them.
 * This makes `dsh plugin add` work out-of-the-box with no manual steps.
 */

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  mkdirSync,
  copyFileSync,
  readdirSync,
  existsSync,
  rmSync,
  statSync,
} from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = join(__dirname, '..')
const PRESET_ID = 'expert-mode'

/**
 * Recursively copy a directory from src to dst.
 */
function copyDir(src, dst) {
  if (!existsSync(dst)) mkdirSync(dst, { recursive: true })
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name)
    const d = join(dst, entry.name)
    if (entry.isDirectory()) {
      copyDir(s, d)
    } else {
      // skip backups / pyc / hidden noise
      if (entry.name.endsWith('.bak') || entry.name.endsWith('.pyc') || entry.name.startsWith('.')) {
        continue
      }
      copyFileSync(s, d)
    }
  }
}

export default {
  name: PRESET_ID,
  inject: [],
  apply(ctx, config = {}) {
    // Target: ~/.dsh/.agent-presets/expert-mode/
    const targetDir =
      config.targetDir ||
      join(process.env.HOME || '~', '.dsh', '.agent-presets', PRESET_ID)

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
    } else {
      // Clean existing preset to ensure a fresh deploy (idempotent reinstall)
      for (const entry of readdirSync(targetDir, { withFileTypes: true })) {
        if (entry.name === '.git') continue // never nuke user's git history
        const p = join(targetDir, entry.name)
        rmSync(p, { recursive: true, force: true })
      }
    }

    // Copy top-level preset files (agent.cordis.yml, preset.yml, cordis.patch.yml)
    for (const f of readdirSync(PKG_ROOT, { withFileTypes: true })) {
      if (f.isDirectory() || f.name.startsWith('.') || f.name.endsWith('.bak') || f.name.endsWith('.md') || f.name.endsWith('.json')) {
        continue
      }
      copyFileSync(join(PKG_ROOT, f.name), join(targetDir, f.name))
    }

    // Copy bundled .expert-mode/ tree
    const bundledDir = join(PKG_ROOT, '.expert-mode')
    if (existsSync(bundledDir)) {
      copyDir(bundledDir, join(targetDir, '.expert-mode'))
    }

    console.log(`[dsh-expert-mode] preset deployed to ${targetDir}`)
  },
}
