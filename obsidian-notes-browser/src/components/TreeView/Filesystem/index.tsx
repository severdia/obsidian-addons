import { Folder } from "components/Folder";
import { TFolder } from "obsidian";
import { useState, useCallback } from "react";
import { toBoolean, sortFilesAlphabetically } from "utils";
import { useStore } from "store";

interface FilesystemProps {
  folder: TFolder;
}

export function Filesystem(props: Readonly<FilesystemProps>) {
  const { folder } = props;
  const setIsFolderFocused = useStore((state) => state.setIsFolderFocused);
  const setCurrentActiveFolderPath = useStore(
    (state) => state.setCurrentActiveFolderPath
  );
  const [isOpen, setIsOpen] = useState<boolean>(
    toBoolean(localStorage.getItem(folder.path))
  );

  const showSubfolders = useCallback(
    (folder: TFolder) => {
      localStorage.setItem(folder.path, `${!isOpen}`);
      setIsOpen(!isOpen);
    },
    [isOpen]
  );

  return (
    <li key={folder.path} className="onb-list-none onb-w-full custom-scrollbar">
      <Folder
        folder={folder}
        onClickChevron={() => showSubfolders(folder)}
        isOpen={isOpen}
        onClickFolder={() => {
          console.log("clicked folder");
          setIsFolderFocused(true);
          setCurrentActiveFolderPath(folder.path);
        }}
      />

      {isOpen && (
        <ul className="onb-pl-2 onb-list-none onb-m-0">
          {sortFilesAlphabetically(folder.children).map(
            (child) =>
              child instanceof TFolder && (
                <Filesystem folder={child} key={child.path} />
              )
          )}
        </ul>
      )}
    </li>
  );
}
