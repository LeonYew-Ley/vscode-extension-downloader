import { createSignal, createEffect } from "solid-js";
import { DownloadTarget } from "./types/downloadTarget";

export const [isTargetPlatformModalOpen, setIsTargetPlatformModalOpen] = createSignal(false);
// 下载目标的类型。  
export const [downloadTarget,setDownloadTarget] = createSignal<Partial<DownloadTarget>|null>(null);

// 获取系统主题偏好
const getSystemTheme = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

// 深色模式状态管理 - 始终跟随系统主题
export const [isDarkMode, setIsDarkMode] = createSignal(getSystemTheme());

// 应用主题到 DOM
const applyTheme = (dark: boolean) => {
  if (typeof window !== 'undefined') {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

// 监听主题变化并应用到 DOM
createEffect(() => {
  const dark = isDarkMode();
  applyTheme(dark);
});

// 监听系统主题变化
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 监听系统主题变化事件
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    const shouldBeDark = e.matches;
    setIsDarkMode(shouldBeDark);
    applyTheme(shouldBeDark);
  };
  
  // 添加事件监听器
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  } else {
    // 兼容旧版浏览器
    mediaQuery.addListener(handleSystemThemeChange);
  }
  
  // 初始化时检测一次系统主题
  const initialDark = getSystemTheme();
  setIsDarkMode(initialDark);
  applyTheme(initialDark);
}