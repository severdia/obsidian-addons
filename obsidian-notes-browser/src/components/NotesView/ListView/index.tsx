import { Note } from "components/Note";
import { TFile } from "obsidian";
import { AutoSizer, List, ListRowProps } from "react-virtualized";

export const ListView = ({ notes }: { notes: TFile[] }) => {
  const RowRenderer = (props: ListRowProps) => (
    <div
      aria-label=""
      key={notes[props.index].path}
      style={props.style}
      className="onb-overflow-y-visible"
    >
      <Note file={notes[props.index]} isFirst={props.index === 0} />
    </div>
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          className="onb-pr-2 custom-scrollbar"
          width={width}
          height={height}
          rowCount={notes.length}
          rowHeight={64}
          rowRenderer={RowRenderer}
          aria-label=""
        />
      )}
    </AutoSizer>
  );
};
