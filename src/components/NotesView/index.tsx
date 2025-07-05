import { useStore } from "store";
import { useMemo } from "react";
import { NotesViewToolbar } from "./NotesViewToolbar";
import { GalleryView } from "./GalleryView";
import { ListView } from "./ListView";
import { usePlugin } from "hooks";
import { TFile } from "obsidian";
import { ALLOWDED_FILE_EXTENSION_SET } from "utils";

export function NotesView() {
  const { files, notesViewType, forceNotesViewUpdate } = useStore((state) => ({
    files: state.notes,
    notesViewType: state.notesViewType,
    forceNotesViewUpdate: state.forceNotesViewUpdate,
  }));

  const { settings } = usePlugin();
  const { sortBy, sortOrder } = settings;
  const sortNotes = (fileA: TFile, fileB: TFile): number => {
    const order = sortOrder === "descending" ? -1 : 1;

    switch (sortBy) {
      case "default":
      case "title":
        return order * fileA.name.localeCompare(fileB.name);

      case "date-edited":
        return order * (fileA.stat.mtime - fileB.stat.mtime);

      case "date-created":
        return order * (fileA.stat.ctime - fileB.stat.ctime);

      default:
        return order * fileA.name.localeCompare(fileB.name);
    }
  };

  const notes = useMemo(() => {
    return files
      .filter((file) => ALLOWDED_FILE_EXTENSION_SET.has(file.extension))
      .sort(sortNotes);
  }, [files, forceNotesViewUpdate]);

  return (
    <div className="onb-flex onb-flex-col onb-bg-white onb-h-full onb-w-full  onb-flex-grow">
      <NotesViewToolbar />

      <div className="onb-w-full onb-h-full onb-py-2 onb-pl-2 onb-gap-2 custom-scrollbar">
        {notes.length > 0 && notesViewType === "LIST" && (
          <ListView notes={notes} />
        )}

        {notes.length > 0 && notesViewType === "GRID" && (
          <GalleryView notes={notes} />
        )}

        {notes.length === 0 && (
          <div className="onb-w-full onb-h-full onb-flex onb-items-center  onb-justify-center onb-text-gray-400">
            No Notes
          </div>
        )}
      </div>
    </div>
  );
}
