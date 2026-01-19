import { browser } from '$app/env';
import type { ImageType, ImageTypeItem } from '$src/types';
import { FileManager } from '$src/utils/FileManager';
import { handleApiResponse } from './common.api';

export async function getTemplate(id: string): Promise<ImageType> {
  // if (!browser) return ;
  return handleApiResponse<ImageType>(await fetch(`/api/imageTypes/${encodeURI(id)}`));
}

export async function getImageTypes(): Promise<ImageTypeItem[]> {
  if (!browser) return [];
  return handleApiResponse<ImageTypeItem[]>(await fetch(`/api/imageTypes`));
}

export async function getImagesOfType(type: string): Promise<string[]> {
  if (!browser) return [];
  return handleApiResponse<string[]>(await fetch(`api/images/${type}`));
}

export async function uploadTemplate(
  svg: SVGElement,
  reportType: string,
  reportName: string,
): Promise<boolean> {
  const svgStr = svg.outerHTML;
  const res = await handleApiResponse<string>(
    await fetch(`/api/images/${reportType}/${reportName}`, { method: 'POST' }),
  );
  return FileManager.uploadFile(res, new Blob([svgStr], { type: 'image/svg+xml' }));
}

export async function downloadImage(reportType: string, filename: string): Promise<string> {
  if (!browser) return '';
  const res = await handleApiResponse<any>(await fetch(`/api/images/${reportType}/${filename}`));
  return (await FileManager.downloadFile(res.getURL, res.size)).text();
}
