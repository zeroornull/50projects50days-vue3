/// <reference types="vite/client" />

// Fallback declaration for editors using the standard TypeScript service.
// Vue Official (Volar) provides richer type inference for SFCs when enabled.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}
