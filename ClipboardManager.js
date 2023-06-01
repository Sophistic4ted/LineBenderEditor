import { DataTransferHandler } from "./DataTransferHandler.js";
export class ClipboardManager {
    dataTransferHandler;
    constructor(gridState) {
        this.dataTransferHandler = new DataTransferHandler(gridState);
    }
    async copyToClipboard() {
        const textToCopy = this.dataTransferHandler.exportLines();
        if (textToCopy === undefined) {
            return;
        }
        try {
            await navigator.clipboard.writeText(textToCopy);
        }
        catch (err) {
            console.error('Error in copying text: ', err);
        }
    }
    async pasteFromClipboard() {
        try {
            const readText = await navigator.clipboard.readText();
            this.dataTransferHandler.importLines(readText);
        }
        catch (err) {
            console.error('Error in pasting text: ', err);
        }
    }
}
