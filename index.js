/**
 * @deepseek-ai/dsh-expert-mode — DSH agent-preset plugin.
 *
 * IMPORTANT: this package is an AGENT-PRESET plugin, not a Cordis service
 * plugin. The actual preset (agent.cordis.yml + preset.yml) is mounted by
 * DSH's agent-presets discovery mechanism — install it by copying the preset
 * files into ~/.dsh/.agent-presets/expert-mode/ (see README, "方式 B").
 *
 * This entry file exists ONLY so the Cordis bundle loader can resolve the
 * package when someone runs `dsh plugin add github:Asher-2000/dsh-expert-mode`.
 * It intentionally does nothing: without it, the bundle import fails and dsh
 * crashes at startup. The preset itself is never activated through this path.
 */
export default {
  name: 'dsh-expert-mode',
  inject: [],
  apply() {},
}