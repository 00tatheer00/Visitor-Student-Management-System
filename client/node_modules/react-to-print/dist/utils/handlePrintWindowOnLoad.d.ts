import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";
export interface HandlePrintWindowOnLoadData {
    contentNode: Node;
    clonedContentNode: Node;
    clonedImgNodes: never[] | NodeListOf<HTMLImageElement>;
    clonedVideoNodes: never[] | NodeListOf<HTMLVideoElement>;
    numResourcesToLoad: number;
    originalCanvasNodes: never[] | NodeListOf<HTMLCanvasElement>;
}
export declare function handlePrintWindowOnLoad(printWindow: HTMLIFrameElement, data: HandlePrintWindowOnLoadData, options: UseReactToPrintOptions): void;
