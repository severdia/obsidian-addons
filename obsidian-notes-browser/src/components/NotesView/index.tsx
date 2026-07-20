import { useStore } from "store";
import { useMemo } from "react";
import { NotesViewToolbar } from "./NotesViewToolbar";
import { GalleryView } from "./GalleryView";
import { ListView } from "./ListView";

export function NotesView() {
  const { files, notesViewType } = useStore((state) => ({
    files: state.notes,
    notesViewType: state.notesViewType,
  }));

  const notes = useMemo(
    () =>
      files
        .filter((file) => file.extension == "md")
        .sort((a, b) => a.name.localeCompare(b.name)),
    [files]
  );

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
