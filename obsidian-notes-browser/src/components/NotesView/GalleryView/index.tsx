import { Note } from "components/Note";
import { TFile } from "obsidian";
import { AutoSizer, ListRowProps, List } from "react-virtualized";
import { CELL_WIDTH, COLUMN_GAP, ROW_HEIGHT } from "./constant";

export const GalleryView = ({ notes }: { notes: TFile[] }) => (
  <AutoSizer>
    {({ height, width }) => {
      const virtualCellWidth = Math.floor(width / (CELL_WIDTH + COLUMN_GAP));
      const maxColumns = Math.max(1, virtualCellWidth);
      const rowCount = Math.ceil(notes.length / maxColumns);

      const GridRowRenderer = (props: ListRowProps) => (
        <div aria-label="" key={notes[props.index].path} style={props.style}>
          <div className="onb-flex onb-flex-row onb-justify-between">
            {notes
              .slice(
                maxColumns * props.index,
                maxColumns * props.index + maxColumns
              )
              .map((note) => (
                <Note file={note} key={note.path} isFirst={props.index === 0} />
              ))}
          </div>
        </div>
      );

      return (
        <List
          className="onb-pr-2 custom-scrollbar"
          width={width}
          height={height}
          rowCount={rowCount}
          rowHeight={ROW_HEIGHT}
          rowRenderer={GridRowRenderer}
          aria-label=""
        />
      );
    }}
  </AutoSizer>
);
