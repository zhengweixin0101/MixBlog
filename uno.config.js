import { defineConfig } from 'unocss'
import presetWind3 from '@unocss/preset-wind3'
import presetAttributify from '@unocss/preset-attributify'

export default defineConfig({
  dark: 'class',
  presets: [
    presetWind3(),
    presetAttributify(),
  ],
})