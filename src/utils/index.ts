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
  // Matches Obsidian-style local images: ![[file.png]]
  const localImageRegex = /!\[\[(.*?\.(?:png|jpg|jpeg|gif|bmp|svg|webp))\]\]/i;

  // Matches Markdown images: ![alt](url.png)
  // Also matches images wrapped in a link: [![alt](url.png)](link)
  const remoteImageRegex =
    /!\[.*?\]\(([^)\s]+\.(?:png|jpg|jpeg|gif|bmp|svg|webp)(?:\?[^\s)]*)?)\)/i;

  // Special case: image wrapped inside link [![alt](image.png)](link)
  const wrappedImageRegex =
    /\[!\[.*?\]\((.*?\.(?:png|jpg|jpeg|gif|bmp|svg|webp)(?:\?[^\s)]*)?)\)\]/i;

  const wrappedMatch = wrappedImageRegex.exec(text);
  if (wrappedMatch) return wrappedMatch[1];

  const localMatch = localImageRegex.exec(text);
  const remoteMatch = remoteImageRegex.exec(text);

  if (!localMatch && !remoteMatch) return null;

  if (
    (!localMatch && remoteMatch) ||
    (localMatch && remoteMatch && localMatch.index > remoteMatch.index)
  ) {
    return remoteMatch[1];
  }

  if (
    (localMatch && !remoteMatch) ||
    (localMatch && remoteMatch && localMatch.index < remoteMatch.index)
  ) {
    return localMatch[1];
  }

  return null;
};
