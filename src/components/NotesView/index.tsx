import { useStore } from "store";
import {
  HTMLProps,
  KeyboardEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { NotesViewToolbar } from "./NotesViewToolbar";
import { GalleryView } from "./GalleryView";
import { ListView } from "./ListView";
import { useApp, useObsidianConfig, usePlugin } from "hooks";
import { TFile, TFolder } from "obsidian";
import { ALLOWDED_FILE_EXTENSION_SET } from "utils";
import { List } from "react-virtualized";
import { Pin } from "components/Icons/Pin";
import { Note } from "components/Note";

interface NotesContainerProps extends HTMLProps<HTMLDivElement> {
  children?: ReactNode[];
}
const NotesContainer = ({
  children,
  className,
  ...props
}: NotesContainerProps) => {
  return (
    <div
      {...props}
      className={`onb-w-full onb-h-fit onb-py-2 onb-pl-2 onb-gap-1.5 onb-max-w-full custom-scrollbar ${className}`}
    >
      {children}
    </div>
  );
};

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
    function getAllNotes() {
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

        getAttachmentFileRecursively(
          currentActiveFolderAbstractFile as TFolder
        );

        return attachments.map((file) => {
          (file as any).isAttachment = true;
          return file;
        });
      }

      return files.filter((file) => {
        if (isAttachmentFolder) {
          (file as any).isAttachment = true;
          return true;
        }
        return ALLOWDED_FILE_EXTENSION_SET.has(file.extension);
      });
    }

    const allNotes = getAllNotes();

    const pinned: TFile[] = [];
    const unpinned: TFile[] = [];

    allNotes.forEach((note) => {
      if (localStorage.getItem(`pinned.${note.path}`)) {
        //@ts-ignore
        note.index = -1; // this index is used for keyboard navigation
        pinned.push(note);
      } else {
        //@ts-ignore
        note.index = unpinned.length;
        unpinned.push(note);
      }
    });

    return {
      pinned: pinned.sort(sortNotes),
      unpinned: unpinned.sort(sortNotes),
      length: pinned.length + unpinned.length,
    };
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

  const openFile = useCallback(
    (path: string) => {
      if (!app) return;

      const fileToOpen = app.vault.getAbstractFileByPath(path);
      if (!(fileToOpen instanceof TFile)) return;

      // Check if file is already open
      const existingLeaves = app.workspace.getLeavesOfType("markdown");
      const existingLeaf = existingLeaves.find((leaf) => {
        const viewState = leaf.getViewState();
        return viewState.state?.file === fileToOpen.path;
      });

      if (existingLeaf) {
        // File already open - focus it
        app.workspace.setActiveLeaf(existingLeaf, { focus: true });
      } else {
        // File not open - open in new leaf
        const leaf = app.workspace.getLeaf();

        app.workspace.setActiveLeaf(leaf, {
          focus: false,
        });

        leaf.openFile(fileToOpen, {
          active: true, // Changed to true to focus the new tab
        });
      }
    },
    [app]
  );

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
      className="onb-flex onb-flex-col onb-bg-[color:--onb-note-view-background-color] onb-h-full onb-w-full"
      tabIndex={0}
      onKeyDown={navigateNotes}
      onBlur={() => {
        if (!currentSelectedNoteIndex) return;
        setCurrentNoteIndex(currentSelectedNoteIndex);
      }}
    >
      <NotesViewToolbar />

      {notes.pinned.length !== 0 && (
        <>
          <div className="onb-flex !onb-text-[color:--pinned-notes-title-color] onb-flex-row onb-items-center onb-gap-3 onb-border-b onb-border-0 onb-border-solid onb-border-gray-300 onb-p-2">
            <div className="onb-font-bold">Pinned</div>
          </div>
          <NotesContainer>
            {notes.length > 0 && notesViewType === "LIST" && (
              <div id="testId" className="onb-flex onb-flex-col onb-pr-2">
                {notes.pinned.map((note) => (
                  <div className="w-full onb-h-fit first:[--onb-divider-height:0px]">
                    <Note file={note} key={note.path} notePosition={-1} />
                  </div>
                ))}
              </div>
            )}

            {notes.length > 0 && notesViewType === "GRID" && (
              <GalleryView notes={notes.pinned} />
            )}

            {notes.length === 0 && (
              <div className="onb-w-full onb-h-full onb-flex onb-items-center  onb-justify-center onb-text-[color:var(--onb-no-note-text-color)]">
                No Notes
              </div>
            )}
          </NotesContainer>
        </>
      )}

      {notes.pinned.length !== 0 && (
        <div className="onb-text-[color:--pinned-notes-title-color] onb-px-2 onb-py-3 onb-font-bold">
          Notes
        </div>
      )}

      <NotesContainer className="onb-h-full">
        {notes.length > 0 && notesViewType === "LIST" && (
          <ListView notes={notes.unpinned} listRef={listRef} />
        )}

        {notes.length > 0 && notesViewType === "GRID" && (
          <GalleryView notes={notes.unpinned} />
        )}

        {notes.length === 0 && (
          <div className="onb-w-full onb-h-full onb-flex onb-items-center  onb-justify-center onb-text-[color:var(--onb-no-note-text-color)]">
            No Notes
          </div>
        )}
      </NotesContainer>
    </div>
  );
}
