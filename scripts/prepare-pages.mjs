import { copyFile, writeFile } from 'node:fs/promises'

const indexUrl = new URL('../dist/index.html', import.meta.url)

await copyFile(indexUrl, new URL('../dist/404.html', import.meta.url))
await writeFile(new URL('../dist/.nojekyll', import.meta.url), '')

console.log('GitHub Pages fallback files created in dist/')
