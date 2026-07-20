import { IcChevronBase } from "./ChevronBase";

export const Chevron = ({
  direction,
  className,
}: {
  direction: "forward" | "down";
  className: string;
}) => {
  const style = direction == "forward" ? {} : { transform: "rotate(90deg)" };
    
  return (
    <IcChevronBase
      style={style}
      className={`onb-size-fit ${className}  onb-min-w-fit`}
    />
  );
};
