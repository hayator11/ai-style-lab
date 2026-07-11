export type StoredImage = {
  id: string;
  path: string;
  kind: 'face' | 'fullFront' | 'fullSide' | 'other';
};

export async function saveDiagnosisImage(_file: File, _kind: StoredImage['kind']): Promise<StoredImage> {
  throw new Error('Image storage is not implemented yet.');
}
