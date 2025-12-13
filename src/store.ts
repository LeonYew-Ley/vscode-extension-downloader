import { createSignal, createEffect } from "solid-js";
import { DownloadTarget } from "./types/downloadTarget";

export const [isTargetPlatformModalOpen, setIsTargetPlatformModalOpen] = createSignal(false);
// 下载目标的类型。  
export const [downloadTarget,setDownloadTarget] = createSignal<Partial<DownloadTarget>|null>(null);

// 深色模式状态管理
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

export const [isDarkMode, setIsDarkMode] = createSignal(getInitialTheme());

// 监听主题变化并应用到 DOM
createEffect(() => {
  const dark = isDarkMode();
  if (typeof window !== 'undefined') {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
});

// 切换深色模式
export const toggleDarkMode = () => {
  setIsDarkMode(!isDarkMode());
};