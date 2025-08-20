import {
  ConfirmDeleteModal,
  NewFolderModal,
  NewNoteModal,
  RenameModal,
} from "components/CustomModals";
import { BaseModal } from "components/CustomModals/BaseModal";
import { ReplaceNoteModal } from "components/CustomModals/ReplaceNoteModal";
import { Chevron } from "components/Icons/Chevron";
import { FolderOutline } from "components/Icons/FolderOutline";
import { useApp, useDragHandlers, useObsidianConfig, usePlugin } from "hooks";
import { TFolder, Notice, Menu, normalizePath } from "obsidian";
import { useState, DragEventHandler, memo, useEffect, useRef } from "react";
import Dropzone from "react-dropzone";
import { useStore } from "store";
import {
  isContainFolders,
  getNumberOfNotes,
  getNumberOfNotesRecursively,
} from "utils";

interface FolderProps {
  isOpen: boolean;
  onClickChevron: (options?: { manualOpenState: boolean }) => void;
  onClickFolder: () => void;
  folder: TFolder;
  isAttachment?: boolean;
}

export const Folder = memo((props: Readonly<FolderProps>) => {
  const [isDropping, setIsDropping] = useState(false);
  const dropTimeOut = useRef<NodeJS.Timeout | null>(null);
  const dragCounter = useRef(0);

  const containsFolders = isContainFolders(props.folder);
  const app = useApp();
  const { settings } = usePlugin();
  const { onDragStart } = useDragHandlers(props.folder);
  const attachementFolderName = (
    useObsidianConfig().attachmentFolderPath as string
  ).replace("./", "");

  const isAttachmentFolder = props.folder.name === attachementFolderName;

  const {
    currentActiveFolderPath,
    setCurrentActiveFolderPath,
    setCurrentActiveFilePath,
    notes,
  } = useStore((state) => ({
    currentActiveFolderPath: state.currentActiveFolderPath,
    setCurrentActiveFolderPath: state.setCurrentActiveFolderPath,
    setCurrentActiveFilePath: state.setCurrentActiveFilePath,
    notes: state.notes,
  }));

  const isFolderFocused = useStore((state) => state.isFolderFocused);
  const isActive = currentActiveFolderPath === props.folder.path;

  const activeBackgroundColor = isActive
    ? isFolderFocused
      ? "onb-bg-[--onb-folder-background-active] !onb-text-[color:--onb-folder-unfocused-text-color]"
      : "onb-bg-[--onb-folder-focused-background] onb-text-[color:--onb-folder-focused-text-color]"
    : "";

  const folderCountClasses = isActive
    ? isFolderFocused
      ? "onb-text-[color:--onb-folder-unfocused-text-color]"
      : "onb-text-[color:--onb-folder-focused-text-color]"
    : "onb-text-[color:--onb-folder-text-color]";

  const folderStyleClasses = isActive
    ? isFolderFocused
      ? "onb-text-[color:--onb-folder-unfocused-text-color]"
      : "onb-text-[color:--onb-folder-icon-color]"
    : "onb-text-[color:--onb-folder-icon-color]";

  const handleOnDropFiles = (droppabaleFiles: File[]) => {
    console.log(droppabaleFiles);
    droppabaleFiles.map((file) => {
      file.arrayBuffer().then((content) => {
        app.vault.adapter.writeBinary(
          `${props.folder.path}/${file.name}`,
          content
        );
      });
    });
  };

  const restoreFileOrFolder = async (path: string) => {
    const slashSpliter = path.split("/");
    const filename = slashSpliter.last();
    await app.vault.adapter.rename(path, `${props.folder.path}/${filename}`);
    useStore.getState().setForceNotesViewUpdate();
  };

  const onDrop: DragEventHandler<HTMLDivElement> = (dropEvent) => {
    setIsDropping(false);
    if (!app) return;
    const data = dropEvent.dataTransfer.getData("application/json");
    dropEvent.dataTransfer.clearData();

    if (data === "") return;
    const { type, path } = JSON.parse(data);
    const abstractFilePath = app.vault.getAbstractFileByPath(path);
    let sourceFolderPath = "";

    if (
      abstractFilePath &&
      abstractFilePath.parent &&
      abstractFilePath.parent.path
    ) {
      sourceFolderPath = abstractFilePath.parent.path;
    }

    if (!abstractFilePath) {
      if (currentActiveFolderPath === ".trash") {
        restoreFileOrFolder(path);
      }
      return;
    }

    switch (type) {
      case "file":
        app.vault
          .rename(
            abstractFilePath,
            `${props.folder.path}/${abstractFilePath.name}`
          )
          .then(() => {
            setCurrentActiveFolderPath(sourceFolderPath);

            if (notes.length > 0) {
              setCurrentActiveFilePath(notes[0].path);
              const leaf = app.workspace.getLeaf(false);
              app.workspace.setActiveLeaf(leaf, {
                focus: true,
              });
              leaf.openFile(notes[0], { eState: { focus: true } });
            } else {
              setCurrentActiveFilePath("");
            }
          })
          .catch(async (e) => {
            const isFileAlreadyExist = await app.vault.adapter.exists(
              normalizePath(`${props.folder.path}/${abstractFilePath.name}`)
            );

            if (isFileAlreadyExist) {
              const confirmation = new BaseModal(app, () => (
                <ReplaceNoteModal
                  modal={confirmation}
                  file={abstractFilePath}
                  folder={props.folder}
                />
              ));

              confirmation.open();
              return;
            }

            new Notice(`${e}`);
          });
        return;

      case "folder":
        if (!props.folder.path.startsWith(abstractFilePath.path)) {
          app.vault
            .rename(
              abstractFilePath,
              `${props.folder.path}/${abstractFilePath.name}`
            )
            .catch((e) => new Notice(`${e}`));
          return;
        }
        new Notice("You can't move a parent folder under its children");
        return;
    }
  };

  const handleDelete = () => {
    if (!app) return;
    const confirmation = new BaseModal(app, () => (
      <ConfirmDeleteModal
        modal={confirmation}
        abstractFileName={props.folder.name}
        abstractFilePath={props.folder.path}
      />
    ));
    confirmation.open();
  };

  const handleRename = () => {
    if (!app) return;
    const renameFileModal = new BaseModal(app, () => (
      <RenameModal modal={renameFileModal} file={props.folder} />
    ));

    renameFileModal.open();
  };

  const handleNewNote = () => {
    if (!app) return;
    const newNoteModal = new BaseModal(app, () => (
      <NewNoteModal modal={newNoteModal} folderPath={props.folder.path} />
    ));
    newNoteModal.open();
  };

  const handleNewFolder = () => {
    if (!app) return;
    const newFolderModal = new BaseModal(app, () => (
      <NewFolderModal modal={newFolderModal} file={props.folder} />
    ));
    newFolderModal.open();
  };

  const handleFolderContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!app) return;
    const fileToTrigger = app.vault.getAbstractFileByPath(props.folder.path);
    if (!fileToTrigger) return;

    const folderMenu = new Menu();

    //@ts-ignore addSections is a private method, not exposed by Obsidian API, so we need to ignore type checking
    folderMenu.addSections([
      "title",
      "open",
      "action-primary",
      "action",
      "info",
      "view",
      "system",
      "",
      "danger",
    ]);

    folderMenu.addItem((menuItem) => {
      menuItem.setTitle("New note");
      menuItem.setIcon("edit");
      menuItem.setSection("action-primary");
      menuItem.onClick(handleNewNote);
    });

    folderMenu.addItem((menuItem) => {
      menuItem.setTitle("New folder");
      menuItem.setSection("action-primary");
      menuItem.setIcon("folder");
      menuItem.onClick(handleNewFolder);
    });

    folderMenu.addItem((menuItem) => {
      menuItem.setTitle("Rename");
      menuItem.setSection("danger");
      menuItem.setIcon("pencil");
      menuItem.onClick(handleRename);
    });

    folderMenu.addItem((menuItem) => {
      menuItem.setTitle("Delete");
      menuItem.setIcon("trash");
      menuItem.onClick(handleDelete);
      menuItem.setSection("danger");
      //@ts-ignore
      menuItem.setWarning(!0);
    });

    app.workspace.trigger(
      "file-menu",
      folderMenu,
      props.folder,
      "file-explorer-context-menu"
    );

    folderMenu.showAtPosition({ x: e.pageX, y: e.pageY });
  };

  const clearDropTimeout = () => {
    if (dropTimeOut.current) {
      clearTimeout(dropTimeOut.current);
      dropTimeOut.current = null;
    }
  };

  const enableDroppingEffect = () => {
    clearDropTimeout();
    setIsDropping(true);
    if (props.isOpen) return;
    dropTimeOut.current = setTimeout(() => {
      console.log("drag enter " + props.folder?.name);
      props.onClickChevron({manualOpenState: true});
    }, 3000);
  };

  const disableDroppingEffect = () => {
    clearDropTimeout();
    setIsDropping(false);
  };

  const handleDragEnter: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      enableDroppingEffect();
    }
  };

  const handleDragLeave: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      disableDroppingEffect();
    }
  };

  // cleanup timeout on unmount
  useEffect(() => {
    return () => clearDropTimeout();
  }, []);

  if (isAttachmentFolder && settings.hideAttachmentFolder) {
    return null;
  }

  return (
    <Dropzone
      onDropAccepted={disableDroppingEffect}
      onDropRejected={disableDroppingEffect}
      onDrop={(event) => {
        handleOnDropFiles(event);
        disableDroppingEffect();
      }}
      noClick={true}
      noDrag={settings.isDraggingFilesAndFoldersdisabled}
    >
      {({ getRootProps, getInputProps }) => (
        <div
          className={`onb-w-full ${activeBackgroundColor} onb-flex onb-rounded-sm onb-items-center onb-justify-between onb-pr-2 ${
            !isActive && isDropping
              ? "onb-bg-[--onb-folder-background-hover]"
              : ""
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={onDrop}
          data-path={props.folder.path}
          draggable={!settings.isDraggingFilesAndFoldersdisabled}
          onDragStart={onDragStart}
          onContextMenu={handleFolderContextMenu}
        >
          <div
            {...getRootProps()}
            className={`onb-w-full onb-flex onb-h-8 onb-rounded-sm onb-items-center onb-justify-between ${
              !isActive && isDropping
                ? "onb-bg-[--onb-folder-background-hover]"
                : ""
            }`}
          >
            <input {...getInputProps()} />
            <span
              className={`onb-flex onb-items-center onb-py-1 ${
                containsFolders ? "" : "onb-ml-6"
              }`}
            >
              {props.folder.children && containsFolders && (
                <div
                  className="onb-size-6 onb-min-w-6 onb-flex onb-items-center onb-justify-center onb-min-h-6"
                  onClick={() => {
                    props.onClickChevron();
                  }}
                >
                  {props.folder.children && (
                    <Chevron
                      direction={!props.isOpen ? "forward" : "down"}
                      className={
                        isActive
                          ? isFolderFocused
                            ? "onb-text-[color:--onb-folder-unfocused-text-color]"
                            : "onb-text-[color:--onb-folder-focused-text-color]"
                          : "onb-text-[color:--onb-folder-text-deactive]"
                      }
                    />
                  )}
                </div>
              )}
            </span>

            <div
              className="onb-flex-grow onb-py-1 onb-truncate onb-flex onb-rounded-sm onb-items-center"
              onClick={props.onClickFolder}
            >
              <div className="onb-flex onb-flex-grow onb-truncate onb-gap-1.5 onb-flex-row onb-flex-nowrap onb-items-center">
                <FolderOutline
                  className={`onb-size-fit ${folderStyleClasses} onb-min-w-fit onb-min-h-fit`}
                />
                <div className="onb-truncate onb-text-[length:--onb-folder-text-size]">
                  {props.folder.name}
                </div>
              </div>
              <div
                className={`onb-size-fit ${folderCountClasses} onb-text-[length:--onb-folder-text-size] min-h-fit onb-min-w-fit`}
              >
                {props.folder.children?.length !== 0 && (
                  <span>
                    {isAttachmentFolder
                      ? getNumberOfNotesRecursively(props.folder)
                      : getNumberOfNotes(props.folder.children)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
});
