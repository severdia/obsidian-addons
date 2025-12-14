import { memo, useState } from "react";
import { NoteCommonProps } from "./types";
import { useStore } from "store";

export const NoteListView = memo(
  ({
    description,
    imageLink,
    title,
    isSelected,
    lastModificationTimeOrDate,
    extension,
    ...divProps
  }: NoteCommonProps) => {
    const isFolderFocused = useStore((state) => state.isFolderFocused);
    const [imageError, setImageError] = useState(false);
    const isActive = isSelected && !isFolderFocused;
    const titleClasses = isActive
      ? "onb-text-[color:--onb-note-title-selected]"
      : "onb-text-[color:--onb-note-title]";
    const descriptionClasses = isActive
      ? "onb-text-[color:--onb-note-title-selected]"
      : "onb-text-[color:--onb-note-text-description-color]";
    const timeClasses = isActive
      ? "onb-text-[color:--onb-note-title-selected]"
      : "onb-text-[color:--onb-note-text-date-color]";

    const badgeBorderClasses =
      "onb-border-[1px] onb-border-solid " +
      (isActive
        ? "onb-text-[color:--onb-note-title] onb-text-white"
        : "onb-border-transparent onb-bg-[var(--apple-notes-blue)] onb-text-[color:--onb-badge-text-color] ");

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
          {extension && extension !== "md" && (
            <div
              className={`onb-box-border onb-inline-block ${badgeBorderClasses} onb-align-middle  onb-rounded-full onb-text-[length:--onb-note-text-badge-size] onb-w-fit onb-px-1`}
            >
              {extension.toUpperCase()}
            </div>
          )}
        </div>
        {imageLink && !imageError && (
          <img
            src={imageLink}
            onError={() => setImageError(true)}
            className="onb-border onb-object-fill onb-object-top onb-min-w-9 onb-min-h-9 onb-size-9 onb-border-gray-300 onb-rounded"
          />
        )}
      </div>
    );
  }
);
