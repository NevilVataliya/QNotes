// Lightweight dev-only logger to keep production console clean

export function debugLog(...args) {
  if (import.meta?.env?.DEV) {
    console.debug(...args)
  }
}
