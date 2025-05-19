import { useApp } from "hooks";
import { Modal, Notice, TFolder } from "obsidian";
import { ChangeEvent, useEffect, useRef, useState } from "react";

interface CustomModalProps {
  modal: Modal;
  file: TFolder;
}

export function NewFolderModal({ modal, file }: Readonly<CustomModalProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const app = useApp();
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    modal.setTitle("New folder");
    inputRef.current?.focus();
  }, []);

  const createFolder = () => {
    if (!inputRef.current) {
      modal.close();
      return;
    }

    const inputValue = inputRef.current.value;
    const hasNonWhitespaceChars = /\S/.test(inputValue);

    if (!hasNonWhitespaceChars) return;

    app.vault.createFolder(`${file.path}/${inputValue}`).catch((e) => {
      new Notice(e);
    });

    modal.close();
  };

  const cancel = () => modal.close();
  const btnClasses = isDisabled
    ? "onb-bg-[--background-secondary] hover:onb-bg-[--background-secondary]  onb-cursor-not-allowed"
    : "mod-cta";

  const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const value = evt.currentTarget.value;
    const hasNonWhitespaceChars = /\S/.test(value);
    if (hasNonWhitespaceChars !== !isDisabled) {
      setIsDisabled(!hasNonWhitespaceChars);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        onChange={onChange}
        onKeyDown={(e) => e.key === "Enter" && createFolder()}
        className="onb-w-full onb-p-2 onb-border-solid onb-border onb-rounded-md onb-border-gray-400"
      />
      <div className="modal-button-container">
        <button className={`${btnClasses}`} onClick={createFolder}>
          Create
        </button>
        <button className="mod-cancel" onClick={cancel}>
          Cancel
        </button>
      </div>
    </>
  );
}
