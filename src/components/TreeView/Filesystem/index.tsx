import { Folder } from "components/Folder";
import { TFolder } from "obsidian";
import { useState, useCallback, useRef, useEffect } from "react";
import { toBoolean, sortFoldersAlphabetically } from "utils";
import { useStore } from "store";

interface FilesystemProps {
  folder: TFolder;
  isRoot?: boolean;
}

export function Filesystem(props: Readonly<FilesystemProps>) {
  const { folder } = props;
  const setIsFolderFocused = useStore((state) => state.setIsFolderFocused);
  const { setCurrentActiveFolderPath } = useStore((state) => ({
    setCurrentActiveFolderPath: state.setCurrentActiveFolderPath,
  }));

  const [isOpen, setIsOpen] = useState<boolean>(
    toBoolean(localStorage.getItem(folder.path))
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const onClickChevron = useCallback(
    (options: { manualOpenState: boolean }) => {
      let newIsOpen: boolean;

      if (options) {
        newIsOpen = options.manualOpenState;
      } else {
        newIsOpen = !isOpen;
      }

      localStorage.setItem(folder.path, `${newIsOpen}`);
      setIsOpen(newIsOpen);
    },
    [isOpen]
  );

  return (
    <li key={folder.path} className="onb-list-none onb-w-full custom-scrollbar">
      {!props.isRoot && (
        <Folder
          folder={folder}
          onClickChevron={onClickChevron}
          isOpen={isOpen}
          onClickFolder={() => {
            setIsFolderFocused(true);
            setCurrentActiveFolderPath(folder.path);
          }}
        />
      )}

      <div
        ref={contentRef}
        className={`onb-transition-[height] onb-duration-500 onb-ease-in-out onb-overflow-hidden onb-h-fit`}
        style={{
          height: isOpen ? "fit-content" : "0px",
        }}
      >
        <ul
          className="onb-pl-2 onb-list-none onb-m-0 onb-transition-all onb-duration-500 onb-ease-in-out onb-overflow-hidden"
          style={{
            transform: isOpen ? "translateY(0)" : "translateY(-100%)",
          }}
        >
          {sortFoldersAlphabetically(folder.children).map(
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
