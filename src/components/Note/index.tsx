import {
  BaseModal,
  ConfirmDeleteModal,
  RenameModal,
} from "components/CustomModals";
import { useApp, useDragHandlers, usePlugin } from "hooks";
import { Menu, normalizePath, Notice, TFile } from "obsidian";
import { memo, useCallback, useEffect, useState } from "react";
import { useStore } from "store";
import { extractImageLink, getLastModified } from "utils";
import { NoteListView } from "./NoteListView";
import { NoteGridView } from "./NoteGridView";
import { TRASH_ROOT } from "components/TreeView/TrashFolder/constant";
import * as nodePath from "path";

const isNodeAvailable = typeof nodePath?.basename === "function";

interface CustomTFile extends TFile {
  deleted?: boolean;
  content?: string;
}

interface NoteProps {
  file: CustomTFile;
  isFirst?: boolean;
}

export const Note = memo(({ file, isFirst }: NoteProps) => {
  const currentActiveFilePath = useStore(
    (state) => state.currentActiveFilePath
  );
  const {
    forceNotesViewUpdate,
    notesViewType,
    setIsFolderFocused,
    isFolderFocused,
  } = useStore((state) => ({
    forceNotesViewUpdate: state.forceNotesViewUpdate,
    notesViewType: state.notesViewType,
    setIsFolderFocused: state.setIsFolderFocused,
    isFolderFocused: state.isFolderFocused,
    setCurrentActiveFilePath: state.setCurrentActiveFilePath,
    setCurrentActiveFolderPath: state.setCurrentActiveFolderPath,
  }));

  const { settings } = usePlugin();
  const app = useApp();
  const [imageLink, setImageLink] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("loading");
  const { onDragStart } = useDragHandlers(file);
  const isSelected = currentActiveFilePath == file.path;

  const backgroundListColorClass = (() => {
    if (!isSelected) return "onb-bg-white";

    if (isFolderFocused) {
      return "onb-bg-[--onb-note-background-active] onb-rounded-md onb-z-10";
    }

    return "onb-bg-[#016efe] onb-rounded-md onb-z-10";
  })();

  const backgroundGridColorClass = isSelected
    ? "onb-bg-[--onb-note-background-active] onb-rounded-md onb-z-10"
    : "onb-bg-white";

  const seperatorClasses = isSelected
    ? ""
    : "onb-bg-[--onb-divider-background] -onb-mt-[--onb-divider-height]";

  useEffect(() => {
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
    const hasSameParentFolder =
      app.vault.getFileByPath(currentActiveFilePath)?.parent?.path ===
      file.parent?.path;

    if (isFirst && !hasSameParentFolder) {
      openFile();
    }
  }, []);

  const openFile = useCallback(() => {
    if (!app) return;
    const fileToOpen = app.vault.getAbstractFileByPath(file.path);
    if (!fileToOpen) return;
    const leaf = app.workspace.getLeaf(false);
    app.workspace.setActiveLeaf(leaf, {
      focus: true,
    });

    leaf.openFile(fileToOpen as TFile, { eState: { focus: true } });
  }, []);

  const onClickOpenFile = useCallback(() => {
    openFile();
    isFolderFocused !== false && setIsFolderFocused(false);
  }, []);

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
    if (!app) return;
    const fileMenu = new Menu();

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
    const fileToTrigger = app.vault.getAbstractFileByPath(file.parent!.path);

    if (!fileToTrigger) return;

    fileMenu.addItem((menuItem) => {
      menuItem.setTitle("Duplicate Note");
      menuItem.setIcon("copy");
      menuItem.onClick(handleDuplicate);
    });

    fileMenu.addItem((menuItem) => {
      menuItem.setTitle("Delete");
      menuItem.setIcon("trash");
      menuItem.onClick(handleDelete);
    });

    fileMenu.addItem((menuItem) => {
      menuItem.setTitle("Rename");
      menuItem.setIcon("pencil");
      menuItem.onClick(handleRename);
    });

    app.workspace.trigger(
      "file-menu",
      fileMenu,
      fileToTrigger,
      "file-explorer"
    );

    fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
  };

  return (
    <>
      {notesViewType === "LIST" && (
        <div
          className={`onb-size-full onb-flex onb-flex-col onb-justify-between ${backgroundListColorClass}`}
        >
          <div className="onb-w-full onb-px-[--onb-divider-padding-x] onb-h-fit">
            <div
              className={`onb-w-full ${seperatorClasses} onb-h-[--onb-divider-height]`}
            />
          </div>
          <NoteListView
            className={`onb-p-3 ${backgroundListColorClass} onb-h-full onb-select-none onb-flex onb-flex-row onb-items-center`}
            onClick={onClickOpenFile}
            draggable={!settings.isDraggingFilesAndFoldersdisabled}
            onDragStart={onDragStart}
            data-path={file.path}
            onContextMenu={handleContextMenu}
            title={file.basename}
            description={description}
            imageLink={imageLink}
            lastModificationTimeOrDate={getLastModified(file)}
            isSelected={isSelected}
            extension={file.extension}
          />
        </div>
      )}

      {notesViewType === "GRID" && (
        <NoteGridView
          className={`onb-p-3 ${backgroundGridColorClass} onb-w-full onb-max-w-[--onb-note-grid-width] onb-h-[--onb-note-grid-height] onb-select-none onb-rounded onb-flex onb-flex-col onb-items-center onb-gap-3`}
          onClick={openFile}
          draggable={!settings.isDraggingFilesAndFoldersdisabled}
          onDragStart={onDragStart}
          data-path={file.path}
          onContextMenu={handleContextMenu}
          title={file.basename}
          description={description}
          imageLink={imageLink}
          extension={file.extension}
          lastModificationTimeOrDate={getLastModified(file)}
        />
      )}
    </>
  );
});
