import { useObsidianConfig, usePlugin } from "hooks";
import { TAbstractFile, TFile, TFolder } from "obsidian";

export { PluginContext } from "./PluginContext";
export { AppContext } from "./AppContext";
export { ObsidianConfigContext } from "./ObsidianConfigContext";

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

export function sortFilesAlphabetically(
  files?: TAbstractFile[]
): TAbstractFile[] {
  if (!files) return [];
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

export function getNumberOfNotes(files: TAbstractFile[]) {
  return files.filter((file) => file instanceof TFile && file.extension == "md")
    .length;
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
