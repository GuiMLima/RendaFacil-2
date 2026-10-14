import { computed, readonly, ref, shallowRef } from 'vue'

// Chromium-only event, not part of the standard DOM typings.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// The browser fires `beforeinstallprompt` once, early in the page's life, so the
// listeners live at module level: this file has to stay in the entry bundle
// (it is imported by HomeView, which the router loads eagerly).
const installPrompt = shallowRef<BeforeInstallPromptEvent | null>(null)
const isInstalled = ref(window.matchMedia('(display-mode: standalone)').matches)

window.addEventListener('beforeinstallprompt', (event) => {
  // Hold on to the event so the app can offer its own install button.
  event.preventDefault()
  installPrompt.value = event as BeforeInstallPromptEvent
})

window.addEventListener('appinstalled', () => {
  installPrompt.value = null
  isInstalled.value = true
})

/**
 * In-app install button support. `canInstall` is only ever true on Chromium
 * browsers; Safari and Firefox users install from the browser's own menu.
 */
export function usePwaInstall() {
  async function install() {
    const prompt = installPrompt.value
    if (!prompt) return

    await prompt.prompt()
    await prompt.userChoice
    // A prompt can only be used once.
    installPrompt.value = null
  }

  return {
    canInstall: computed(() => installPrompt.value !== null),
    isInstalled: readonly(isInstalled),
    install,
  }
}
