import { Folder } from "components/Folder";
import { TFolder } from "obsidian";
import { useState, useCallback } from "react";
import { toBoolean, sortFilesAlphabetically } from "utils";
import { useStore } from "store";

interface FilesystemProps {
  folder: TFolder;
  isRoot?: boolean;
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
      {!props.isRoot && (
        <Folder
          folder={folder}
          onClickChevron={() => showSubfolders(folder)}
          isOpen={isOpen}
          onClickFolder={() => {
            console.log("clicked folder : " + folder.path);
            setIsFolderFocused(true);
            setCurrentActiveFolderPath(folder.path);
          }}
        />
      )}

      <div
        className={`onb-transition-all onb-duration-[1000ms] onb-ease-in-out onb-overflow-hidden onb-transform ${
          isOpen
            ? "onb-max-h-[1000px] onb-translate-y-0"
            : "onb-max-h-0 -onb-translate-y-2"
        }`}
      >
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
      </div>
    </li>
  );
}

/*

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
          console.log("clicked folder : " + folder.path);
          setIsFolderFocused(true);
          setCurrentActiveFolderPath(folder.path);
        }}
      />

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="onb-pl-2 onb-list-none onb-m-0">
          {sortFilesAlphabetically(folder.children).map(
            (child) =>
              child instanceof TFolder && (
                <Filesystem folder={child} key={child.path} />
              )
          )}
        </ul>
      </div>
    </li>
  );
}

*/
