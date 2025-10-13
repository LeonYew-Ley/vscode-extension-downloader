import { createSignal } from "solid-js";
import { DownloadTarget } from "./types/downloadTarget";

export const [isTargetPlatformModalOpen, setIsTargetPlatformModalOpen] = createSignal(false);
// 下载目标的类型。  
export const [downloadTarget,setDownloadTarget] = createSignal<Partial<DownloadTarget>|null>(null);