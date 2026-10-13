import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  let targetSpecifier = specifier;
  if (specifier === 'next/server') {
    targetSpecifier = 'next/server.js';
  } else if (specifier.startsWith('@/')) {
    targetSpecifier = pathToFileURL(path.resolve('./src', specifier.slice(2))).href;
  }
  try {
    return await nextResolve(targetSpecifier, context);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'ERR_UNSUPPORTED_DIR_IMPORT') {
      for (const ext of ['.ts', '.tsx', '/index.ts']) {
        try {
          return await nextResolve(targetSpecifier + ext, context);
        } catch {}
      }
    }
    throw err;
  }
}
