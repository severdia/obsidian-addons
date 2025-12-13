import {
  BaseModal,
  ConfirmDeleteModal,
  RenameModal,
} from "components/CustomModals";
import { useApp, useDragHandlers, useObsidianConfig, usePlugin } from "hooks";
import { Menu, normalizePath, Notice, TFile } from "obsidian";
import { memo, useCallback, useEffect, useState } from "react";
import { useStore } from "store";
import { extractImageLink, getLastModified } from "utils";
import { NoteListView } from "./NoteListView";
import { NoteGridView } from "./NoteGridView";
import { TRASH_ROOT } from "components/TreeView/TrashFolder/constant";
import * as nodePath from "path";
import { useRef } from "react";

interface CustomTFile extends TFile {
  deleted?: boolean;
  content?: string;
  isAttachment?: boolean;
}

interface NoteProps {
  file: CustomTFile;
  isFirst?: boolean;
  notePosition: number;
}

export const Note = memo(({ file, isFirst, notePosition }: NoteProps) => {
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const CLICK_DELAY = 200; // used to prevent interference between click and doubleClick

  const isNodeAvailable = typeof nodePath?.basename === "function";
  const currentActiveFilePath = useStore(
    (state) => state.currentActiveFilePath
  );
  const {
    forceNotesViewUpdate,
    notesViewType,
    setIsFolderFocused,
    isFolderFocused,
    setCurrentNoteIndex,
    setCurrentSelectedNoteIndex,
    setForceNotesViewUpdate,
  } = useStore((state) => ({
    forceNotesViewUpdate: state.forceNotesViewUpdate,
    notesViewType: state.notesViewType,
    setIsFolderFocused: state.setIsFolderFocused,
    isFolderFocused: state.isFolderFocused,
    setCurrentNoteIndex: state.setCurrentNoteIndex,
    setCurrentSelectedNoteIndex: state.setCurrentSelectedNoteIndex,
    setForceNotesViewUpdate: state.setForceNotesViewUpdate,
  }));

  const { settings } = usePlugin();
  const app = useApp();
  const [imageLink, setImageLink] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("loading");
  const { onDragStart } = useDragHandlers(file);
  const isSelected = currentActiveFilePath == file.path;

  const isAttachmentFolder = file.isAttachment;

  const backgroundListColorClass = (() => {
    if (!isSelected) return "onb-bg-[--onb-note-background-normal]";
    if (isFolderFocused) {
      return "onb-bg-[--onb-note-background-active] onb-rounded-md onb-z-10";
    }

    return "onb-bg-[--onb-selected-note-bg-color] onb-rounded-md onb-z-10";
  })();

  const backgroundGridColorClass = isSelected
    ? "onb-bg-[--onb-note-background-active] onb-rounded-md onb-z-10"
    : "onb-bg-[--onb-note-background-normal]";

  const seperatorClasses = isSelected
    ? ""
    : "onb-bg-[--onb-divider-background] -onb-mt-[--onb-divider-height]";

  useEffect(() => {
    if (isAttachmentFolder) return;
    const updateContent = (content: string) => {
      setDescription(content.slice(0, Math.min(content.length, 400)));
      const imageLink = extractImageLink(content);

      if (imageLink) {
        let decodedImageURL = imageLink;

        try {
          decodedImageURL = decodeURIComponent(imageLink);
        } catch (e) {}

        const firstImageLinkpathDest = app.metadataCache.getFirstLinkpathDest(
          decodedImageURL,
          file.path
        );

        if (firstImageLinkpathDest) {
          const resourceImagePath = app.vault.getResourcePath(
            firstImageLinkpathDest
          );

          setImageLink(resourceImagePath);
          return;
        }
      }

      setImageLink(imageLink);
    };

    const getContent = async () => {
      if (file.deleted) {
        const content = file.content ?? "";
        updateContent(content);
        return;
      }

      const content = await app.vault.cachedRead(file);
      const mainContent = content.replace(/^([ \t]*)---[\s\S]*?---\n?/m, "$1");

      updateContent(mainContent);
    };

    getContent();
  }, [file, forceNotesViewUpdate]);

  useEffect(() => {
    if (isSelected) {
      setCurrentNoteIndex(notePosition);
      setCurrentSelectedNoteIndex(notePosition);
    }
  }, [currentActiveFilePath]);

  useEffect(() => {
    const hasSameParentFolder =
      app.vault.getFileByPath(currentActiveFilePath)?.parent?.path ===
      file.parent?.path;

    if (isFirst && !hasSameParentFolder) {
      openFile();
    }
  }, []);

  const openFile = useCallback(
    (inSeparatedWindow: boolean = false) => {
      if (!app) return;
      const fileToOpen = app.vault.getAbstractFileByPath(file.path);
      if (!(fileToOpen instanceof TFile)) return;

      // Check if file is already open
      const existingLeaves = app.workspace.getLeavesOfType("markdown");
      const existingLeaf = existingLeaves.find((leaf) => {
        const viewState = leaf.getViewState();
        return viewState.state?.file === fileToOpen.path;
      });

      if (existingLeaf && !inSeparatedWindow) {
        // File is already open - focus it
        app.workspace.setActiveLeaf(existingLeaf, { focus: true });
      } else {
        // File not open, or we want a new window - open in new leaf
        const leaf = app.workspace.getLeaf(
          inSeparatedWindow ? "window" : false
        );

        // Set active leaf first if not opening in window
        if (!inSeparatedWindow) {
          app.workspace.setActiveLeaf(leaf, { focus: false });
        }

        leaf.openFile(fileToOpen, {
          active: !inSeparatedWindow, // Active for tab, not for window
          eState: { focus: !inSeparatedWindow }, // Focus for tab, not for window
        });
      }
    },
    [app, file.path]
  );

  const onClickOpenFile = useCallback(() => {
    if (clickTimeoutRef.current) return; // Prevent double invocation

    clickTimeoutRef.current = setTimeout(() => {
      openFile();
      isFolderFocused !== false && setIsFolderFocused(false);
      clickTimeoutRef.current = null;
    }, CLICK_DELAY);
  }, [openFile, isFolderFocused, setIsFolderFocused]);

  const onDoubleClickOpenFile = useCallback(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    openFile(true);
  }, [openFile]);

  const handleDelete = useCallback(() => {
    if (!app) return;
    const confirmation = new BaseModal(app, () => (
      <ConfirmDeleteModal
        modal={confirmation}
        abstractFileName={file.name}
        abstractFilePath={file.path}
      />
    ));

    confirmation.open();
  }, []);

  const handleRename = useCallback(() => {
    if (!app) return;
    const renameFileModal = new BaseModal(app, () => (
      <RenameModal modal={renameFileModal} file={file} />
    ));

    renameFileModal.open();
  }, []);

  const handleDuplicate = useCallback(async () => {
    if (!app) return;
    try {
      const duplicateNoteName = `${file.basename}(copy).${file.extension}`;
      const duplicatedNotePath = `${file.parent!.path}/${duplicateNoteName}`;
      await app.vault.copy(file as TFile, duplicatedNotePath);
    } catch (e) {
      new Notice(e);
    }
  }, []);

  const restoreFromTrash = useCallback(async () => {
    const restorePath = normalizePath(file.path.replace(`${TRASH_ROOT}/`, ""));

    if (await app.vault.adapter.exists(restorePath)) {
      return false;
    }

    const dirname = isNodeAvailable
      ? nodePath.dirname
      : (path: string) => path.match(/^(.+)\/.+/)?.at(1) || ".";
    const restoreParentDir = dirname(restorePath);

    if (!(await app.vault.adapter.exists(restoreParentDir))) {
      await app.vault.adapter.mkdir(restoreParentDir);
    }

    await app.vault.adapter.rename(file.path, restorePath);

    return true;
  }, []);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!app) return;
    const fileMenu = new Menu();

    //@ts-ignore addSections is a private method, not exposed by Obsidian API, so we need to ignore type checking
    fileMenu.addSections([
      "open",
      "action",
      "title",
      "action-primary",
      "info",
      "view",
      "system",
      "",
      "danger",
    ]);

    if (file.path.startsWith(".trash")) {
      fileMenu.addItem((menuItem) => {
        menuItem.setTitle("Restore Note");
        menuItem.setIcon("undo-2");
        menuItem.onClick(restoreFromTrash);
      });

      app.workspace.trigger("file-menu", fileMenu, file, "file-explorer");

      fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
      return;
    }
    const fileToTrigger = app.vault.getAbstractFileByPath(file.path);

    app.workspace.trigger(
      "file-menu",
      fileMenu,
      fileToTrigger,
      "file-context-menu"
    );

    if (!fileToTrigger) return;

    const isNotePinned = localStorage.getItem(`pinned.${file.path}`);

    if (isNotePinned) {
      fileMenu.addItem((menuItem) => {
        menuItem.setTitle("Unpin");
        menuItem.setIcon("pin");
        menuItem.setSection("action");
        menuItem.onClick(handleUnPin);
      });
    } else {
      fileMenu.addItem((menuItem) => {
        menuItem.setTitle("Pin");
        menuItem.setIcon("pin");
        menuItem.setSection("action");
        menuItem.onClick(handlePin);
      });
    }

    fileMenu.addItem((menuItem) => {
      menuItem.setTitle("Duplicate note");
      menuItem.setIcon("copy");
      menuItem.setSection("action");
      menuItem.onClick(handleDuplicate);
    });

    fileMenu.addItem((menuItem) => {
      menuItem.setTitle("Rename");
      menuItem.setIcon("pencil");
      menuItem.setSection("action");
      menuItem.onClick(handleRename);
    });

    fileMenu.addItem((menuItem) => {
      menuItem.setTitle("Delete");
      menuItem.setIcon("trash");
      menuItem.onClick(handleDelete);
      menuItem.setSection("action");
    });

    fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
  };

  const handlePin = useCallback(() => {
    localStorage.setItem(`pinned.${file.path}`, `${true}`);
    setForceNotesViewUpdate();
  }, []);

  const handleUnPin = useCallback(() => {
    localStorage.removeItem(`pinned.${file.path}`);
    setForceNotesViewUpdate();
  }, []);

  return (
    <>
      {notesViewType === "LIST" && (
        <div
          className={`onb-size-full onb-flex onb-flex-col onb-h-[64px] onb-justify-between ${backgroundListColorClass}`}
        >
          <div className="onb-w-full onb-px-[--onb-divider-padding-x] onb-h-fit">
            <div
              className={`onb-w-full ${seperatorClasses} onb-h-[--onb-divider-height]`}
            />
          </div>

          <NoteListView
            className={`onb-p-3 ${backgroundListColorClass} onb-overflow-hidden onb-h-full onb-select-none onb-flex onb-flex-row onb-items-center`}
            note-position={notePosition}
            onClick={onClickOpenFile}
            onDoubleClick={onDoubleClickOpenFile}
            draggable={!settings.isDraggingFilesAndFoldersdisabled}
            onDragStart={onDragStart}
            data-path={file.path}
            onContextMenu={handleContextMenu}
            title={file.basename}
            description={isAttachmentFolder ? "" : description}
            imageLink={
              isAttachmentFolder ? app.vault.getResourcePath(file) : imageLink
            }
            lastModificationTimeOrDate={getLastModified(file)}
            isSelected={isSelected}
            extension={file.extension}
          />
        </div>
      )}

      {notesViewType === "GRID" && (
        <NoteGridView
          className={`onb-p-3 ${backgroundGridColorClass} onb-w-full onb-max-w-[--onb-note-grid-width] onb-h-[--onb-note-grid-height] onb-select-none onb-rounded onb-flex onb-flex-col onb-items-center onb-gap-3`}
          onClick={onClickOpenFile}
          note-position={notePosition}
          onDoubleClick={onDoubleClickOpenFile}
          draggable={!settings.isDraggingFilesAndFoldersdisabled}
          onDragStart={onDragStart}
          data-path={file.path}
          onContextMenu={handleContextMenu}
          title={file.basename}
          description={isAttachmentFolder ? "" : description}
          imageLink={
            isAttachmentFolder ? app.vault.getResourcePath(file) : imageLink
          }
          lastModificationTimeOrDate={getLastModified(file)}
          extension={file.extension}
        />
      )}
    </>
  );
});
