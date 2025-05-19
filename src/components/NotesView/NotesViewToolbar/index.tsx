import {
  BaseModal,
  ConfirmDeleteModal,
  NewNoteModal,
} from "components/CustomModals";
import { useApp } from "hooks";
import { memo } from "react";
import { useStore } from "store";
import { Tab } from "../Tab";
import { List } from "components/Icons/List";
import { Grid } from "components/Icons/Grid";
import { Pencil } from "components/Icons/Pencil";
import { Trash } from "components/Icons/Trash";

export const NotesViewToolbar = memo((props: React.ComponentProps<"div">) => {
  const app = useApp();
  const { currentActiveFilePath, currentActiveFolderPath, isFolderFocused } =
    useStore((state) => ({
      currentActiveFilePath: state.currentActiveFilePath,
      currentActiveFolderPath: state.currentActiveFolderPath,
      isFolderFocused: state.isFolderFocused,
    }));

  const handleDelete = () => {
    if (!app || isFolderFocused) return;
    const file = app.vault.getAbstractFileByPath(currentActiveFilePath);
    if (!file) return;

    const confirmation = new BaseModal(app, () => (
      <ConfirmDeleteModal
        modal={confirmation}
        abstractFileName={file.name}
        abstractFilePath={file.path}
      />
    ));

    confirmation.open();
  };

  const handleNewNote = () => {
    if (!app || currentActiveFolderPath === "null") return;
    const newNoteModal = new BaseModal(app, () => (
      <NewNoteModal modal={newNoteModal} folderPath={currentActiveFolderPath} />
    ));
    newNoteModal.open();
  };

  return (
    <div
      className="onb-flex onb-w-full onb-flex-row onb-h-12 onb-border-0 onb-items-center onb-py-2 onb-border-b-[var(--divider-color)] onb-border-b-[1.5px] onb-justify-between onb-border-solid onb-px-2 onb-text-[var(--List-color)]"
      {...props}
    >
      <div className="onb-flex onb-w-fit onb-flex-row onb-gap-1 onb-items-center onb-justify-between">
        <Tab tabId="LIST">
          <List style={{ transform: "scale(1.75)" }} />
        </Tab>
        <Tab tabId="GRID">
          <Grid style={{ transform: "scale(1.75)" }} />
        </Tab>
      </div>
      <div className="onb-flex onb-w-fit onb-flex-row onb-gap-1 onb-items-center onb-justify-between">
        <div
          className="onb-px-3 onb-py-4 onb-text-[#757575] onb-rounded-md hover:onb-bg-[#F2F2F2] onb-h-5 onb-flex onb-items-center onb-justify-center onb-cursor-pointer"
          onClick={handleNewNote}
        >
          <Pencil style={{ transform: "scale(1.75)" }} />
        </div>
        <div
          className={`onb-px-3 onb-py-4 ${
            isFolderFocused
              ? "onb-text-[#BFBFBF] onb-cursor-not-allowed"
              : "onb-text-[#757575] onb-cursor-pointer"
          } onb-rounded-md hover:onb-bg-[#F2F2F2] onb-h-5 onb-flex onb-items-center onb-justify-center`}
          onClick={handleDelete}
        >
          <Trash style={{ transform: "scale(1.75)" }} />
        </div>
      </div>
    </div>
  );
});
