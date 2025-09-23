import { Note } from "components/Note";
import { TFile } from "obsidian";
import { AutoSizer, List, ListRowProps } from "react-virtualized";

export const ListView = ({
  notes,
  listRef,
}: {
  notes: TFile[];
  listRef: React.RefObject<List>;
}) => {
  const RowRenderer = ({ index, style }: ListRowProps) => (
    <div
      aria-label=""
      key={notes[index].path}
      style={style}
      className="onb-overflow-y-visible"
    >
      <Note
        file={notes[index]}
        //@ts-ignore
        notePosition={notes[index].index}
        isFirst={index === 0}
      />
    </div>
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          ref={listRef}
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
