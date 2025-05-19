export interface NoteCommonProps extends React.ComponentProps<"div"> {
  imageLink: string | null;
  title: string;
  description: string;
  lastModificationTimeOrDate: string;
  isSelected ?: boolean
}
