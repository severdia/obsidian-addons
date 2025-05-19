import { App, Modal } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { AppContext } from "utils";

export class BaseModal extends Modal {
  root: Root;
  CustomModal: () => JSX.Element;

  constructor(app: App, CustomModal: () => JSX.Element) {
    super(app);
    this.CustomModal = CustomModal;
  }

  onOpen = () => {
    const modalRoot = createRoot(this.contentEl);
    this.root = modalRoot;

    modalRoot.render(
      <AppContext.Provider value={this.app}>
        <this.CustomModal />
      </AppContext.Provider>
    );
  };
}
