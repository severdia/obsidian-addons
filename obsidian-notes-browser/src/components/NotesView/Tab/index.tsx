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
      ? "onb-bg-[#F2F2F2] onb-text-[#494a49]"
      : "onb-text-[#757575]";
  const { tabId, ...divProps } = props;

  return (
    <div
      className={`onb-px-4 ${styleClasses} onb-py-4 onb-rounded-md hover:onb-bg-[#F2F2F2] onb-h-5 onb-flex onb-items-center onb-justify-center onb-cursor-pointer`}
      onClick={() => tabId && setNotesViewType(tabId)}
      {...divProps}
    >
      {props.children}
    </div>
  );
};
