import { memo } from "react";
import { NoteCommonProps } from "./types";
import { useStore } from "store";

export const NoteListView = memo(
  ({
    description,
    imageLink,
    title,
    isSelected,
    lastModificationTimeOrDate,
    ...divProps
  }: NoteCommonProps) => {
    const isFolderFocused = useStore((state) => state.isFolderFocused);
    const titleClasses =
      isSelected && !isFolderFocused ? "onb-text-white" : "onb-text-black";
    const descriptionClasses =
      isSelected && !isFolderFocused
        ? "onb-text-white"
        : "onb-text-[color:--onb-note-text-description-color]";
    const timeClasses =
      isSelected && !isFolderFocused
        ? "onb-text-white"
        : "onb-text-[color:--onb-note-text-date-color]";

    return (
      <div {...divProps}>
        <div
          className={`onb-flex-grow onb-flex-col onb-truncate ${
            imageLink && "onb-pr-2"
          }`}
        >
          <div
            className={`${titleClasses} onb-text-[length:--onb-note-text-title-size] onb-font-semibold onb-truncate`}
          >
            {title}
          </div>
          <div className="onb-flex onb-flex-row onb-gap-2 onb-w-full">
            <div
              className={`${timeClasses} onb-text-[length:--onb-note-text-description-size] onb-font-normal onb-text-nowrap`}
            >
              {lastModificationTimeOrDate}
            </div>
            <div
              className={`${descriptionClasses} onb-truncate onb-text-[length:--onb-note-text-description-size]`}
            >
              {description}
            </div>
          </div>
        </div>
        {imageLink && (
          <img
            src={imageLink}
            className="onb-border onb-object-fill onb-object-top onb-min-w-9 onb-min-h-9 onb-size-9 onb-border-gray-300 onb-rounded"
          />
        )}
      </div>
    );
  }
);
