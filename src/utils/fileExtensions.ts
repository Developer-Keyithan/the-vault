// src/utils/fileExtensions.ts
export const VAULT_EXTENSIONS = {
  IMAGE: '.vximg',
  VIDEO: '.vxvid',
  AUDIO: '.vxsound',
  DOCUMENT: '.vxdoc',
  ARCHIVE: '.vxpack',
  NOTE: '.vxnote',
  PASSWORD: '.vxpass'
};

export const isVaultFile = (filename: string): boolean => {
  return Object.values(VAULT_EXTENSIONS).some(ext => 
    filename.toLowerCase().endsWith(ext)
  );
};

export const getFileTypeFromExtension = (filename: string): string => {
  if (filename.endsWith(VAULT_EXTENSIONS.IMAGE)) return 'photo';
  if (filename.endsWith(VAULT_EXTENSIONS.VIDEO)) return 'video';
  if (filename.endsWith(VAULT_EXTENSIONS.AUDIO)) return 'audio';
  if (filename.endsWith(VAULT_EXTENSIONS.DOCUMENT)) return 'document';
  if (filename.endsWith(VAULT_EXTENSIONS.ARCHIVE)) return 'zip';
  if (filename.endsWith(VAULT_EXTENSIONS.NOTE)) return 'note';
  if (filename.endsWith(VAULT_EXTENSIONS.PASSWORD)) return 'password';
  return 'unknown';
};