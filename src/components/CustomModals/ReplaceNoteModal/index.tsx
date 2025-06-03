import { useApp } from "hooks";
import { Modal, normalizePath, TAbstractFile, TFile, TFolder } from "obsidian";
import { useEffect, useRef } from "react";
import { useStore } from "store";

interface CustomModalProps {
  modal: Modal;
  file: TAbstractFile;
  folder: TFolder;
}

export function ReplaceNoteModal({
  modal,
  file,
  folder,
}: Readonly<CustomModalProps>) {
  const app = useApp();
  const setForceNotesViewUpdate = useStore(
    (state) => state.setForceNotesViewUpdate
  );

  useEffect(() => {
    modal.setTitle("Replace file in destination");
  }, []);

  const replaceFile = async () => {
    const fileInDestinationFolderPath = `${folder.path}/${file.name}`;
    const fileToDelete = app.vault.getAbstractFileByPath(
      fileInDestinationFolderPath
    );
    if (!fileToDelete) return;
    await app.fileManager.trashFile(fileToDelete);
    await app.vault.rename(file, `${folder.path}/${file.name}`);
    setForceNotesViewUpdate(); 
    modal.close();
  };

  const cancel = () => modal.close();

  return (
    <>
      <p>
        A file with similar name already exist in the destination folder. DO you
        want to replace it ?
      </p>
      <div className="modal-button-container">
        <button className="mod-cta" onClick={replaceFile}>
          Replace
        </button>
        <button className="mod-cancel" onClick={cancel}>
          Cancel
        </button>
      </div>
    </>
  );
}
