// The animated card as a real GIF file. Chromium usually refuses image/gif on
// the browser clipboard, so this normally travels to the local service, which
// puts the file on the OS clipboard (a file drop keeps the animation).
import type { HostClient } from '@openchamber/sdk';
import { uploadImage, type CopyImageResult } from './clipboard';
import { renderGif, type GifInput } from './gif';
import { t } from './i18n';

/** Draw and copy the animated card as a real GIF file. */
export const copyGif = async (host: HostClient, input: GifInput): Promise<CopyImageResult> => {
  let blob: Blob;
  try {
    blob = await renderGif(input);
  } catch {
    return { ok: false, message: t('copyGifError') };
  }
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/gif': blob })]);
      return { ok: true, via: 'clipboard' };
    }
  } catch {
    // Chromium usually refuses image/gif on the clipboard; fall through.
  }
  return uploadImage(host, blob, 'gif');
};
