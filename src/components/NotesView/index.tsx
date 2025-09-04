import { useStore } from "store";
import {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NotesViewToolbar } from "./NotesViewToolbar";
import { GalleryView } from "./GalleryView";
import { ListView } from "./ListView";
import { useApp, useObsidianConfig, usePlugin } from "hooks";
import { TFile, TFolder } from "obsidian";
import { ALLOWDED_FILE_EXTENSION_SET } from "utils";
import { List } from "react-virtualized";

export function NotesView() {
  const {
    files,
    notesViewType,
    forceNotesViewUpdate,
    currentActiveFolderPath,
    setCurrentNoteIndex,
    currentNoteIndex,
    currentSelectedNoteIndex,
  } = useStore((state) => ({
    files: state.notes,
    notesViewType: state.notesViewType,
    forceNotesViewUpdate: state.forceNotesViewUpdate,
    currentActiveFolderPath: state.currentActiveFolderPath,
    setCurrentNoteIndex: state.setCurrentNoteIndex,
    currentNoteIndex: state.currentNoteIndex,
    currentSelectedNoteIndex: state.currentSelectedNoteIndex,
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
    currentActiveFolderAbstractFile?.name === attachementFolderName;

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

  const listRef = useRef<List>(null);

  useEffect(() => {
    if (currentNoteIndex === null) return;

    const currentKeyboardSelectedNote = document.querySelector(
      `[note-position="${currentNoteIndex}"]`
    );

    if (!currentKeyboardSelectedNote) return;

    const currentKeyboardSelectedNoteFilePath =
      currentKeyboardSelectedNote.getAttribute("data-path")!;
    openFile(currentKeyboardSelectedNoteFilePath);
  }, [currentNoteIndex]);

  const openFile = useCallback((path: string) => {
    if (!app) return;
    const fileToOpen = app.vault.getAbstractFileByPath(path);
    if (!fileToOpen) return;
    const leaf = app.workspace.getLeaf();

    app.workspace.setActiveLeaf(leaf, {
      focus: false,
    });

    leaf.openFile(fileToOpen as TFile, { active: false });
  }, []);

  const openCurrentKeyboardSelectedNote = useCallback((noteIndex: number) => {
    const currentKeyboardSelectedNote = document.querySelector(
      `[note-position="${currentNoteIndex}"]`
    );

    console.log("[AYY] before detection");
    if (!currentKeyboardSelectedNote) return;
    console.log("[AYY] after detection");

    const currentKeyboardSelectedNoteFilePath =
      currentKeyboardSelectedNote.getAttribute("data-path")!;
    openFile(currentKeyboardSelectedNoteFilePath);
  }, []);

  const navigateNotes: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (
      currentNoteIndex === null ||
      (event.key !== "ArrowDown" && event.key !== "ArrowUp")
    ) {
      return;
    }

    if (event.key === "ArrowDown" && currentNoteIndex < notes.length - 1) {
      const nextNoteIndex = currentNoteIndex + 1;
      setCurrentNoteIndex(nextNoteIndex);
      listRef.current?.scrollToRow(nextNoteIndex);
    } else if (event.key === "ArrowUp" && currentNoteIndex > 0) {
      const previousNoteIndex = currentNoteIndex - 1;
      setCurrentNoteIndex(previousNoteIndex);
      listRef.current?.scrollToRow(previousNoteIndex);
    }
  };

  return (
    <div
      className="onb-flex onb-flex-col onb-bg-[color:--onb-note-view-background-color] onb-h-full onb-w-full  onb-flex-grow"
      tabIndex={0}
      onKeyDown={navigateNotes}
      onBlur={() => {
        if (!currentSelectedNoteIndex) return;
        setCurrentNoteIndex(currentSelectedNoteIndex);
      }}
    >
      <NotesViewToolbar />

      <div className="onb-w-full onb-h-full onb-py-2 onb-pl-2 onb-gap-2 custom-scrollbar">
        {notes.length > 0 && notesViewType === "LIST" && (
          <ListView notes={notes} listRef={listRef} />
        )}

        {notes.length > 0 && notesViewType === "GRID" && (
          <GalleryView notes={notes} />
        )}

        {notes.length === 0 && (
          <div className="onb-w-full onb-h-full onb-flex onb-items-center  onb-justify-center onb-text-[color:var(--onb-no-note-text-color)]">
            No Notes
          </div>
        )}
      </div>
    </div>
  );
}
