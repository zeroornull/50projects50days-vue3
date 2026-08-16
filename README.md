# 50projects-vue3

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

## GitHub Pages

The repository includes a GitHub Actions workflow at
`.github/workflows/deploy-pages.yml`. It runs on every push to `master`, builds
the site, and publishes the `dist/` directory through GitHub Pages.

1. Open **Settings → Pages** in the GitHub repository.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Push to `master` (or run the workflow manually from the **Actions** tab).

For this repository, the published site will be available at:

<https://zeroornull.github.io/50projects50days-vue3/>

The Vite base path is derived from `GITHUB_REPOSITORY` in CI, while local
development keeps the root path (`/`). The Vue Router history uses the same
base path, and the build creates `404.html` so direct links to routes such as
`/day37` continue to work on GitHub Pages.

If the site is later served from a custom domain, set `VITE_BASE_PATH=/` in the
workflow (or in the build environment) so assets are emitted relative to the
domain root.
