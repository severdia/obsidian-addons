import { KeyboardEventHandler, useEffect, useState } from "react";
import { useApp, usePlugin } from "hooks";
import { TFolder, TAbstractFile } from "obsidian";
import { useStore } from "store";
import { TrashFolder } from "./TrashFolder";
import { Filesystem } from "./Filesystem";

export function TreeView() {
  const app = useApp();
  const [root, setRoot] = useState<TAbstractFile | null>(null);
  const { settings } = usePlugin();

  const {
    forceFilesystemUpdate,
    setFlatTree,
    folderIndicesTracker,
    currentActiveFolderPath,
    setCurrentActiveFolderPath,
    flatTree,
  } = useStore((state) => ({
    forceFilesystemUpdate: state.forceFilesyetemUpdate,
    setFlatTree: state.setFlatTree,
    folderIndicesTracker: state.folderIndicesTracker,
    currentActiveFolderPath: state.currentActiveFolderPath,
    setCurrentActiveFolderPath: state.setCurrentActiveFolderPath,
    flatTree: state.flatTree,
  }));

  useEffect(() => {
    const rootFolder = app.vault.getAbstractFileByPath(
      app.vault.getRoot().path
    );

    if (rootFolder) {
      rootFolder.name = app.vault.getName();
      setFlatTree(rootFolder as TFolder);
    }

    setRoot(rootFolder);
  }, [forceFilesystemUpdate]);

  const handleKeyboardNavigation: KeyboardEventHandler<HTMLDivElement> = (
    e
  ) => {
    const currentFolderIndex = parseInt(
      folderIndicesTracker.get(currentActiveFolderPath) as string
    );

    if (isNaN(currentFolderIndex)) return;

    if (e.key === "ArrowUp") {
      const previousIndex = currentFolderIndex - 1;

      if (previousIndex >= 0) {
        const previousFolderPath = folderIndicesTracker.get(`${previousIndex}`);
        if (previousFolderPath) {
          setCurrentActiveFolderPath(previousFolderPath);
        }
      }
    }

    if (e.key === "ArrowDown") {
      const nextIndex = currentFolderIndex + 1;

      if (nextIndex < flatTree.length) {
        const nextFolderPath = folderIndicesTracker.get(`${nextIndex}`);
        if (nextFolderPath) {
          setCurrentActiveFolderPath(nextFolderPath);
        }
      }
    }
  };

  return (
    <div
      className="onb-flex onb-flex-col onb-bg-[--onb-filesystem-background-color] onb-overflow-x-hidden onb-h-full onb-w-full onb-pt-2 onb-pl-2"
      tabIndex={-1}
      id="onb-filesystem"
      onKeyDown={handleKeyboardNavigation}
    >
      <div className="onb-px-2 onb-overflow-y-scroll onb-overflow-x-hidden onb-pb-3 onb-w-full onb-flex-grow custom-scrollbar">
        <div className="onb-flex onb-h-fit onb-flex-col onb-w-full " >
          {root instanceof TFolder && (
            <Filesystem folder={root} isRoot={settings.hideVaultFolder} />
          )}
        </div>
        <TrashFolder />
      </div>
    </div>
  );
}
