// The transport shared by every clipboard feature: the browser clipboard first,
// then the extension's local service in chunks (the host caps one request body
// at 64 kB). Kept apart from the renderers so the status section does not carry
// the GIF encoder.
import { HostRequestError, type HostClient } from '@openchamber/sdk';
import { t } from './i18n';

export type CopyImageResult = { ok: true; via: 'clipboard' | 'service' } | { ok: false; message: string };

const CHUNK = 40_000;
const MAX_CHUNKS = 1200;

const toBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const result = String(reader.result ?? '');
    const comma = result.indexOf(',');
    resolve(comma === -1 ? '' : result.slice(comma + 1));
  };
  reader.onerror = () => reject(reader.error ?? new Error('read failed'));
  reader.readAsDataURL(blob);
});

const uploadId = (): string => {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const describeHost = (error: unknown): string => {
  if (error instanceof HostRequestError) {
    if (error.code === 'NO_SERVICE') return t('copyNoService');
    if (error.code === 'DISABLED') return t('copyDisabled');
    if (error.code === 'HOST_TIMEOUT' || error.code === 'SERVICE_FAILED') return t('copyTimeout');
  }
  return t('copyGeneric');
};

const serviceError = (body: string): { code: string; detail: string } => {
  try {
    const value = JSON.parse(body) as Record<string, unknown>;
    return {
      code: typeof value.error === 'string' ? value.error : '',
      detail: typeof value.detail === 'string' ? value.detail : '',
    };
  } catch {
    return { code: '', detail: '' };
  }
};

export const uploadImage = async (host: HostClient, blob: Blob, kind: 'png' | 'gif'): Promise<CopyImageResult> => {
  try {
    const data = await toBase64(blob);
    if (!data) return { ok: false, message: t('copyPrepare') };

    const id = uploadId();
    const begin = await host.serviceRequest({
      method: 'POST',
      path: '/clipboard/begin',
      body: JSON.stringify({ id, kind }),
    });
    if (begin.status === 404) {
      return { ok: false, message: t('copyOldService') };
    }
    if (begin.status === 429) {
      return { ok: false, message: t('copyBusy') };
    }
    if (begin.status !== 200) {
      return { ok: false, message: t('copyServiceRejected') };
    }

    const chunks = Math.ceil(data.length / CHUNK);
    if (chunks > MAX_CHUNKS) return { ok: false, message: t('copyTooLarge') };
    for (let index = 0; index < chunks; index += 1) {
      const sent = await host.serviceRequest({
        method: 'POST',
        path: '/clipboard/chunk',
        body: JSON.stringify({ id, index, data: data.slice(index * CHUNK, (index + 1) * CHUNK) }),
      });
      if (sent.status !== 200) {
        return { ok: false, message: t('copyImageFileError') };
      }
    }

    const finish = await host.serviceRequest({
      method: 'POST',
      path: '/clipboard/finish',
      body: JSON.stringify({ id, kind }),
    });
    if (finish.status === 200) return { ok: true, via: 'service' };

    const { code, detail } = serviceError(finish.body);
    if (code === 'clipboard-failed') {
      if (detail === 'clipboard-busy') return { ok: false, message: t('copyClipboardOccupied') };
      if (detail === 'no-powershell') return { ok: false, message: t('copyNoPowerShell') };
      return { ok: false, message: t('copySystem') };
    }
    if (code === 'upload-missing' || code === 'upload-gap') {
      return { ok: false, message: t('copyLost') };
    }
    if (code === 'not-an-image' || code === 'not-a-png') {
      return {
        ok: false,
        message: kind === 'gif'
          ? t('copyOldService')
          : t('copyRecognize'),
      };
    }
    return { ok: false, message: t('copyCouldNot') };
  } catch (error) {
    return { ok: false, message: describeHost(error) };
  }
};
