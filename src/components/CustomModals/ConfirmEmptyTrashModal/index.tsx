import { TRASH_ROOT } from "components/TreeView/TrashFolder/constant";
import { useApp } from "hooks";
import { Modal, normalizePath, Notice, TFolder } from "obsidian";
import { useEffect } from "react";
import { useStore } from "store";

interface CustomModalProps {
  modal: Modal;
}

export function ConfirmEmptyTrashModal({ modal }: Readonly<CustomModalProps>) {
  const app = useApp();
  const { setForceFilesystemUpdate, setNotes } = useStore((state) => ({
    setForceFilesystemUpdate: state.setForceFilesystemUpdate,
    setNotes: state.setNotes,
  }));

  useEffect(() => {
    modal.setTitle("Empty Trash");
  }, []);

  const emptyTrashFolder = async () => {
    try {
      const isTrashFolderExist = await app.vault.adapter.exists(
        normalizePath(TRASH_ROOT)
      );

      if (isTrashFolderExist) {
        await app.vault.adapter.rmdir(normalizePath(TRASH_ROOT), true);
        setForceFilesystemUpdate();
        setNotes([]);
      }
    } catch (e) {
      new Notice(e);
    }
    modal.close();
  };

  const cancel = () => modal.close();

  return (
    <>
      <p>Are you sure you want to empty the trash folder ?</p>
      <div className="modal-button-container">
        <button className="mod-warning" onClick={emptyTrashFolder}>
          Empty
        </button>
        <button className="mod-cancel" onClick={cancel}>
          Cancel
        </button>
      </div>
    </>
  );
}
