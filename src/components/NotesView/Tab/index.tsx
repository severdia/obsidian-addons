import { HTMLAttributes } from "react";
import { useStore } from "store";

interface TabProps extends HTMLAttributes<HTMLDivElement> {
  tabId?: "LIST" | "GRID";
}

export const Tab = (props: TabProps) => {
  const { setNotesViewType, notesViewType } = useStore((state) => ({
    setNotesViewType: state.setNotesViewType,
    notesViewType: state.notesViewType,
  }));

  const styleClasses =
    notesViewType === props.tabId
      ? "onb-bg-[var(--onb-tab-background-color)] onb-text-[color:var(--onb-selected-tab-text-color)]"
      : "onb-text-[color:var(--onb-tab-text-color)]";
  const { tabId, ...divProps } = props;

  return (
    <div
      className={`onb-px-4 ${styleClasses} onb-py-4 onb-rounded-md hover:onb-bg-[var(--onb-tab-background-hover-color)] onb-h-5 onb-flex onb-items-center onb-justify-center onb-cursor-pointer`}
      onClick={() => tabId && setNotesViewType(tabId)}
      {...divProps}
    >
      {props.children}
    </div>
  );
};
