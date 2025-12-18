import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  content: {
    filesystem: [
      '**/*.{html,js,ts,jsx,tsx,vue,svelte,astro,marko}',
    ],
  },
  presets: [
    presetWind3(),
  ],
})