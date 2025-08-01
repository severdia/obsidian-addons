import { useObsidianConfig, usePlugin } from "hooks";
import { TAbstractFile, TFile, TFolder } from "obsidian";

export { PluginContext } from "./pluginContext";
export { AppContext } from "./appContext";
export { ObsidianConfigContext } from "./ObsidianConfigContext";

export const ALLOWDED_FILE_EXTENSION_SET = new Set(["md", "base", "canvas"]);

export function isContainFolders(folder: TFolder) {
  const { settings } = usePlugin();
  const attachementFolderName = (
    useObsidianConfig().attachmentFolderPath as string
  ).replace("./", "");

  if (settings.hideAttachmentFolder) {
    return folder.children.some(
      (abstractFile) =>
        abstractFile instanceof TFolder &&
        abstractFile.name !== attachementFolderName
    );
  }

  return folder.children.some(
    (abstractFile) => abstractFile instanceof TFolder
  );
}

export function sortFoldersAlphabetically(
  files?: TAbstractFile[]
): TAbstractFile[] {
  if (!files) return [];
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

export function getNumberOfNotes(files: TAbstractFile[]) {
  return files.filter(
    (file) =>
      file instanceof TFile && ALLOWDED_FILE_EXTENSION_SET.has(file.extension)
  ).length;
}

export function getNumberOfNotesRecursively(folder: TFolder) {
  let count = 0;
  function getAttachmentFileRecursively(folder: TFolder) {
    const children = folder.children;
    if (children.length === 0) return;
    count += children.filter((file) => file instanceof TFile).length;

    children
      .filter((folder) => folder instanceof TFolder)
      .forEach((folder) => getAttachmentFileRecursively(folder));
  }

  getAttachmentFileRecursively(folder);

  return count;
}

export function toBoolean(value: string | null) {
  return value === "true";
}

export function getLastModified(note: TFile) {
  const lastModified = new Date(note.stat.mtime);
  const now = new Date();

  const isToday = lastModified.toDateString() === now.toDateString();

  if (isToday) {
    return lastModified.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else {
    return lastModified.toLocaleDateString();
  }
}

export const extractImageLink = (text: string) => {
  const localImageRegex = /!\[\[(.*?\.(png|jpg|jpeg|gif|bmp|svg|webp))\]\]/i;
  const remoteImageRegex =
    /!\[.*?\]\((https?:\/\/[^\s)]+\.(png|jpg|jpeg|gif|bmp|svg|webp)(\?.*?)?|[^\s)]+\.(png|jpg|jpeg|gif|bmp|svg|webp))\)/i;

  const firstLocalExtractedImage = RegExp(localImageRegex).exec(text);
  const firstRemoteExtractedImage = RegExp(remoteImageRegex).exec(text);

  if (!firstLocalExtractedImage && !firstRemoteExtractedImage) {
    return null;
  }

  if (
    (!firstLocalExtractedImage && firstRemoteExtractedImage) ||
    (firstLocalExtractedImage &&
      firstRemoteExtractedImage &&
      firstLocalExtractedImage.index > firstRemoteExtractedImage.index)
  ) {
    return firstRemoteExtractedImage[1];
  }

  if (
    (firstLocalExtractedImage && !firstRemoteExtractedImage) ||
    (firstLocalExtractedImage &&
      firstRemoteExtractedImage &&
      firstLocalExtractedImage.index < firstRemoteExtractedImage.index)
  ) {
    return firstLocalExtractedImage[1];
  }

  return null;
};