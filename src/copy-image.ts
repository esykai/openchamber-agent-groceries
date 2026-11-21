// The shareable period picture as a PNG: draw it, then hand it to the browser
// clipboard or to the local service.
import type { HostClient } from '@openchamber/sdk';
import { uploadImage, type CopyImageResult } from './clipboard';
import { renderPeriodPoster, type PeriodPosterInput } from './poster';
import { t } from './i18n';

/** Draw and copy the shareable period picture as PNG. */
export const copyPosterImage = async (host: HostClient, input: PeriodPosterInput): Promise<CopyImageResult> => {
  let blob: Blob;
  try {
    blob = await renderPeriodPoster(input);
  } catch {
    return { ok: false, message: t('copyImageError') };
  }
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return { ok: true, via: 'clipboard' };
    }
  } catch {
    // Sandboxed frames usually land here.
  }
  return uploadImage(host, blob, 'png');
};
