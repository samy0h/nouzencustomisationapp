import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const uploadsRoot = path.resolve(process.cwd(), 'uploads');

const extensionFromDataUrl = (dataUrl: string) => {
  const mime = dataUrl.match(/^data:([^;]+);base64,/)?.[1];
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/svg+xml') return 'svg';
  return 'png';
};

const writeDataUrl = async (orderNumber: string, fileBaseName: string, dataUrl?: string | null) => {
  if (!dataUrl) return null;
  const base64 = dataUrl.split(',')[1];
  if (!base64) return null;

  const extension = extensionFromDataUrl(dataUrl);
  const fileName = `${fileBaseName}.${extension}`;
  const orderDir = path.join(uploadsRoot, 'orders', orderNumber);
  await mkdir(orderDir, { recursive: true });
  await writeFile(path.join(orderDir, fileName), Buffer.from(base64, 'base64'));
  return `/uploads/orders/${orderNumber}/${fileName}`;
};

export const saveOrderItemFiles = async (
  orderNumber: string,
  itemNumber: number,
  files: {
    mockupFrontDataUrl?: string | null;
    mockupBackDataUrl?: string | null;
    designFrontDataUrl?: string | null;
    designBackDataUrl?: string | null;
    customizationData?: unknown;
  }
) => {
  const base = `${orderNumber}-item-${itemNumber}`;
  const orderDir = path.join(uploadsRoot, 'orders', orderNumber);
  await mkdir(orderDir, { recursive: true });

  const customizationJsonUrl = `/uploads/orders/${orderNumber}/${base}-customization.json`;
  await writeFile(
    path.join(orderDir, `${base}-customization.json`),
    JSON.stringify(files.customizationData ?? {}, null, 2),
    'utf8'
  );

  return {
    mockupFrontUrl: await writeDataUrl(orderNumber, `${base}-front-mockup`, files.mockupFrontDataUrl),
    mockupBackUrl: await writeDataUrl(orderNumber, `${base}-back-mockup`, files.mockupBackDataUrl),
    designFrontUrl: await writeDataUrl(orderNumber, `${base}-front-design`, files.designFrontDataUrl),
    designBackUrl: await writeDataUrl(orderNumber, `${base}-back-design`, files.designBackDataUrl),
    customizationJsonUrl,
  };
};
