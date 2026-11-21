// Builds the guest pages as classic IIFEs and the local service as an ES module.
// OpenChamber never compiles a package: run `npm run build` before installing.
import { build } from 'esbuild';

const pages = [
  ['status/main.ts', 'status/main.js'],
  ['panel/main.ts', 'panel/main.js'],
  ['dev/preview.ts', 'dev/preview.js'],
];

for (const [entry, outfile] of pages) {
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'chrome120',
    legalComments: 'none',
    logLevel: 'info',
  });
}

await build({
  entryPoints: ['service/main.ts'],
  outfile: 'service/main.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  legalComments: 'none',
  logLevel: 'info',
});
