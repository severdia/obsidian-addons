import { useApp } from "hooks";
import { normalizePath } from "obsidian";
import { useState, useEffect, memo } from "react";
import { useStore } from "store";
import { TRASH_ROOT } from "./constant";
import { Trash } from "components/Icons/Trash";

export const TrashFolder = memo(() => {
  const app = useApp();
  const setNotes = useStore((state) => state.setNotes);
  const [filesCount, setFilesCount] = useState("..");
  const { currentActiveFolderPath, setCurrentActiveFolderPath } = useStore(
    (state) => ({
      currentActiveFolderPath: state.currentActiveFolderPath,
      setCurrentActiveFolderPath: state.setCurrentActiveFolderPath,
    })
  );

  const isActive = currentActiveFolderPath === TRASH_ROOT;
  const activeBackgroundColor = isActive
    ? "onb-bg-[--onb-folder-background-active] !onb-text-white"
    : "";

  const iconClasses = isActive
    ? "onb-text-white"
    : "onb-text-[color:--onb-folder-icon-color]";

  const countClasses = isActive
    ? "onb-text-white"
    : "onb-text-[color:--onb-folder-text-color]";

  const listDeletedFilesRecursively = async (
    folderPath: string
  ): Promise<any[]> => {
    try {
      const folderContent = await app.vault.adapter.list(folderPath);
      const { files, folders } = folderContent;

      let deletedFiles: any[] = [];

      for (const filePath of files) {
        if (filePath.endsWith(".md")) {
          try {
            const normalizeFilePath = normalizePath(filePath);
            const stat = await app.vault.adapter.stat(normalizeFilePath);
            const content = await app.vault.adapter.read(
              normalizePath(normalizeFilePath)
            );
            const name = filePath.replace(`${folderPath}/`, "");
            deletedFiles.push({
              deleted: true,
              content: content,
              stat: stat,
              basename: name,
              extension: "md",
              name: name,
              path: filePath,
            });
          } catch (e) {}
        }
      }

      for (const subFolderPath of folders) {
        const subFolderFiles = await listDeletedFilesRecursively(subFolderPath);
        deletedFiles = deletedFiles.concat(subFolderFiles);
      }

      return deletedFiles;
    } catch (error) {
      console.error("Error listing deleted files recursively:", error);
      return [];
    }
  };

  useEffect(() => {
    const getFileCount = async () => {
      const deletedFiles = await listDeletedFilesRecursively(TRASH_ROOT);
      setFilesCount(deletedFiles.length.toString());
    };
    getFileCount();
  }, []);

  const showDeletedNotes = async () => {
    setCurrentActiveFolderPath(TRASH_ROOT, { isTrashFolder: true });
    const deletedFiles = await listDeletedFilesRecursively(TRASH_ROOT);
    setNotes(deletedFiles);
  };

  return (
    <div
      className={`onb-truncate onb-pl-8 onb-h-8 onb-pb-2 onb-select-none ${activeBackgroundColor} onb-pr-2 onb-py-1 onb-flex onb-rounded-sm onb-items-center`}
      onClick={showDeletedNotes}
    >
      <div className="onb-flex onb-h-fit onb-flex-grow onb-truncate onb-gap-1.5 onb-flex-row onb-flex-nowrap onb-items-center">
        <div className="onb-w-4 onb-flex onb-items-center onb-justify-center">
          <Trash
            className={`onb-size-fit ${iconClasses} onb-min-w-fit onb-min-h-fit onb-overflow-visible`}
            style={{ transform: "scale(1.25)" }}
          />
        </div>

        <div className="onb-truncate onb-text-[length:--onb-folder-text-size]">
          Recently Deleted
        </div>
      </div>
      <div
        className={`onb-size-fit ${countClasses}  onb-text-[length:--onb-folder-text-size] min-h-fit onb-min-w-fit`}
      >
        <span>{filesCount}</span>
      </div>
    </div>
  );
});
