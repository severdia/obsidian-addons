import { TAbstractFile, TFile } from "obsidian";
import { useApp } from "./useApp";

export function useDragHandlers(abstractFile: TAbstractFile) {
	const app = useApp();
	const type = abstractFile instanceof TFile ? "file" : "folder";

	return {
		onDragStart: (e: React.DragEvent<HTMLDivElement>) => {
			if (!app) return;
			e.dataTransfer.setData(
				"application/json",
				JSON.stringify({ path: abstractFile.path, type: type })
			);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const dragManager = (app as any).dragManager;
			const dragData = dragManager.dragFile(e.nativeEvent, abstractFile);
			dragManager.onDragStart(e.nativeEvent, dragData);
		},
	};
}
