// src/services/useSandboxStorage.ts
import * as FileSystem from 'expo-file-system';

export const useSandboxStorage = () => {
  const vaultDirectory = `${FileSystem.documentDirectory}vault/`;

  const ensureVaultDirectory = async () => {
    const dirInfo = await FileSystem.getInfoAsync(vaultDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(vaultDirectory, { intermediates: true });
    }
  };

  const saveFile = async (sourceUri: string, filename: string): Promise<string> => {
    await ensureVaultDirectory();
    const destination = `${vaultDirectory}${filename}`;
    await FileSystem.copyAsync({ from: sourceUri, to: destination });
    return destination;
  };

  const readFile = async (filename: string): Promise<string> => {
    const filePath = `${vaultDirectory}${filename}`;
    return await FileSystem.readAsStringAsync(filePath);
  };

  const deleteFile = async (filename: string): Promise<void> => {
    const filePath = `${vaultDirectory}${filename}`;
    await FileSystem.deleteAsync(filePath);
  };

  const listFiles = async (): Promise<string[]> => {
    await ensureVaultDirectory();
    const files = await FileSystem.readDirectoryAsync(vaultDirectory);
    return files;
  };

  const getFileSize = async (filename: string): Promise<number> => {
    const filePath = `${vaultDirectory}${filename}`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo.size || 0;
  };

  return {
    saveFile,
    readFile,
    deleteFile,
    listFiles,
    getFileSize,
    vaultDirectory
  };
};