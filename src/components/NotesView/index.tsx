import { useStore } from "store";
import { useMemo } from "react";
import { NotesViewToolbar } from "./NotesViewToolbar";
import { GalleryView } from "./GalleryView";
import { ListView } from "./ListView";
import { useApp, useObsidianConfig, usePlugin } from "hooks";
import { TFile, TFolder } from "obsidian";
import { ALLOWDED_FILE_EXTENSION_SET } from "utils";

export function NotesView() {
  const {
    files,
    notesViewType,
    forceNotesViewUpdate,
    currentActiveFolderPath,
  } = useStore((state) => ({
    files: state.notes,
    notesViewType: state.notesViewType,
    forceNotesViewUpdate: state.forceNotesViewUpdate,
    currentActiveFolderPath: state.currentActiveFolderPath,
  }));

  const { settings } = usePlugin();
  const app = useApp();
  const { sortBy, sortOrder } = settings;
  const attachementFolderName = (
    useObsidianConfig().attachmentFolderPath as string
  ).replace("./", "");

  const currentActiveFolderAbstractFile = app.vault.getAbstractFileByPath(
    currentActiveFolderPath
  )!;

  const isAttachmentFolder =
    currentActiveFolderAbstractFile.name === attachementFolderName;

  const sortNotes = (fileA: TFile, fileB: TFile): number => {
    const order = sortOrder === "descending" ? -1 : 1;

    switch (sortBy) {
      case "default":
      case "title":
        return order * fileA.name.localeCompare(fileB.name);

      case "date-edited":
        return order * (fileA.stat.mtime - fileB.stat.mtime);

      case "date-created":
        return order * (fileA.stat.ctime - fileB.stat.ctime);

      default:
        return order * fileA.name.localeCompare(fileB.name);
    }
  };

  const notes = useMemo(() => {
    if (isAttachmentFolder) {
      let attachments: TFile[] = [];
      function getAttachmentFileRecursively(folder: TFolder) {
        const children = folder.children;
        
        if (children.length === 0) return;
        attachments = attachments.concat(
          children.filter((file) => file instanceof TFile)
        );
        children
          .filter((folder) => folder instanceof TFolder)
          .forEach((folder) => getAttachmentFileRecursively(folder));
      }

      getAttachmentFileRecursively(currentActiveFolderAbstractFile as TFolder);

      return attachments
        .filter((file) => {
          (file as any).isAttachment = true;
          return true;
        })
        .sort(sortNotes);
    }

    return files
      .filter((file) => {
        if (isAttachmentFolder) {
          (file as any).isAttachment = true;
          return true;
        }
        return ALLOWDED_FILE_EXTENSION_SET.has(file.extension);
      })
      .sort(sortNotes);
  }, [files, forceNotesViewUpdate]);

  return (
    <div className="onb-flex onb-flex-col onb-bg-white onb-h-full onb-w-full  onb-flex-grow">
      <NotesViewToolbar />

      <div className="onb-w-full onb-h-full onb-py-2 onb-pl-2 onb-gap-2 custom-scrollbar">
        {notes.length > 0 && notesViewType === "LIST" && (
          <ListView notes={notes} />
        )}

        {notes.length > 0 && notesViewType === "GRID" && (
          <GalleryView notes={notes} />
        )}

        {notes.length === 0 && (
          <div className="onb-w-full onb-h-full onb-flex onb-items-center  onb-justify-center onb-text-gray-400">
            No Notes
          </div>
        )}
      </div>
    </div>
  );
}
