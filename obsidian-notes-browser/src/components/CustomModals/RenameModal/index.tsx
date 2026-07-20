import { useApp } from "hooks";
import { Modal, TAbstractFile, TFile, TFolder } from "obsidian";
import { useEffect, useRef } from "react";
import { useStore } from "store";

interface CustomModalProps {
  modal: Modal;
  file: TAbstractFile;
}

export function RenameModal({ modal, file }: Readonly<CustomModalProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const app = useApp();
  const setForceNotesViewUpdate = useStore(
    (state) => state.setForceNotesViewUpdate
  );

  useEffect(() => {
    modal.setTitle("Rename file");
    inputRef.current?.focus();
  }, []);

  const renameFile = () => {
    if (!inputRef.current) {
      modal.close();
      return;
    }

    if (file instanceof TFile) {
      app.fileManager.renameFile(
        file,
        `${file.parent?.path}/${inputRef.current.value}.${file.extension}`
      );
    } else if (file instanceof TFolder) {
      app.fileManager.renameFile(
        file,
        `${file.parent?.path}/${inputRef.current.value}`
      );
    }

    setForceNotesViewUpdate();
    modal.close();
  };

  const cancel = () => modal.close();

  return (
    <>
      <input
        ref={inputRef}
        className="onb-w-full onb-p-2 onb-border-solid onb-border onb-rounded-md onb-border-gray-400"
        placeholder="name .."
      />
      <div className="modal-button-container">
        <button className="mod-cta" onClick={renameFile}>
          Save
        </button>
        <button className="mod-cancel" onClick={cancel}>
          Cancel
        </button>
      </div>
    </>
  );
}
