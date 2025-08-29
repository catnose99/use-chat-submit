## Develop

This repository includes a simple demo built with Vite. During development, run the demo server and the library's tsup watcher in parallel.

- Install dependencies: `pnpm install`
- Start dev server (demo): `pnpm dev`
- Build demo for production: `pnpm run demo:build` (outputs to `dist-demo/`)
- Preview demo production build: `pnpm run demo:preview`

The demo directly imports `../src` from within the `demo/` directory. The code published to the package is built with `pnpm run build` and output to `dist/`.

## Publish
TODO:
