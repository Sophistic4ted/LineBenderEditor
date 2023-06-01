import { DataTransferHandler } from "./DataTransferHandler.js";
import { GridState } from "./GridState.js";

export class ClipboardManager {

    private dataTransferHandler: DataTransferHandler;

    constructor(gridState: GridState) {
        this.dataTransferHandler =  new DataTransferHandler(gridState)
    }
    
    public async copyToClipboard() {
        const textToCopy = this.dataTransferHandler.exportLines();
        if (textToCopy === undefined) { return; }
        try {
            await navigator.clipboard.writeText(textToCopy);
        } catch (err) {
            console.error('Error in copying text: ', err);
        }
    }

    public async pasteFromClipboard() {
        try {
            const readText = await navigator.clipboard.readText();
            this.dataTransferHandler.importLines(readText);
        } catch (err) {
            console.error('Error in pasting text: ', err);
        }
    }
}