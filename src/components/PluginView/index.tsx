import SplitPane from "react-split-pane";
import { TreeView } from "components/TreeView";
import { NotesView } from "components/NotesView";

export function PluginUI() {
  return (
    //@ts-expect-error
    <SplitPane
      split="vertical"
      minSize={200}
      defaultSize={parseInt(localStorage.getItem("splitPos") ?? "300")}
      onChange={(size) => localStorage.setItem("splitPos", size.toString())}
      className="onb-fixed onb-w-full !onb-top-0 !onb-left-0 onb-h-full"
    >
      <TreeView />
      <NotesView />
    </SplitPane>
  );
}
