// Browser entry — bundled by build-avatar-gallery.mjs (esbuild, platform=browser) and
// inlined into gallery/avatars.html. Exposes the SAME generator core the CLI uses, so
// the gallery renders every style live in the browser from any seed, fully offline.
import { STYLES, FAMILIES, PREVIEW_SEEDS, REFERENCE, generate } from './avatars-core.mjs';

// Metadata only (functions can't cross into the page's data layer).
const meta = STYLES.map(({ id, name, provider, family, license, animated, offline, output, blurb, home }) => ({
  id, name, provider, family, license, animated, offline, output, blurb, home,
}));

window.AVATARS = {
  styles: meta,
  families: FAMILIES,
  previewSeeds: PREVIEW_SEEDS,
  reference: REFERENCE,
  // generate(id, seed, size) -> { output, markup, dataUri, style, seed, size }
  generate,
};
window.dispatchEvent(new Event('avatars-ready'));
