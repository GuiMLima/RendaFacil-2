import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Home-screen icons can't be transparent, so they get a solid backdrop.
// Keep in sync with `background_color` in vite.config.ts.
const resizeOptions = { fit: 'contain', background: '#0b1220' } as const

// Run `npm run generate-pwa-assets` after changing public/favicon.svg.
export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions },
    apple: { ...minimal2023Preset.apple, resizeOptions },
  },
  images: ['public/favicon.svg'],
})
