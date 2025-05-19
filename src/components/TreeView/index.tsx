import { useEffect, useState } from "react";
import { useApp } from "hooks";
import { TFolder, TAbstractFile } from "obsidian";
import { useStore } from "store";
import { TrashFolder } from "./TrashFolder";
import { Filesystem } from "./Filesystem";

export function TreeView() {
  const app = useApp();
  const [root, setRoot] = useState<TAbstractFile | null>(null);

  const forceFilesystemUpdate = useStore(
    (state) => state.forceFilesyetemUpdate
  );

  useEffect(() => {
    const rootFolder = app.vault.getAbstractFileByPath(
      app.vault.getRoot().path
    );

    if (rootFolder) {
      rootFolder.name = app.vault.getName();
    }

    setRoot(rootFolder);
  }, [forceFilesystemUpdate]);

  return (
    <div className="onb-flex onb-flex-col onb-bg-[--onb-filesystem-background-color] onb-overflow-x-hidden onb-h-full onb-w-full onb-pt-2 onb-pl-2">
      <div className="onb-px-2 onb-overflow-y-scroll onb-overflow-x-hidden onb-pb-3 onb-w-full onb-flex-grow custom-scrollbar">
        <div className="onb-flex onb-h-fit onb-flex-col onb-w-full ">
          {root instanceof TFolder && <Filesystem folder={root} />}
        </div>
        <TrashFolder />
      </div>
    </div>
  );
}
