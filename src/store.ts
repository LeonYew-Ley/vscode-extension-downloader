import { createSignal } from "solid-js";
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

// 从 localStorage 获取用户手动选择的主题（null 表示跟随系统）
const getUserTheme = (): 'light' | 'dark' | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme-preference');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  }
  return null;
};

// 根据用户设置和系统主题获取实际主题
const getActualTheme = (): boolean => {
  const userTheme = getUserTheme();
  if (userTheme === 'light') return false;
  if (userTheme === 'dark') return true;
  return getSystemTheme(); // null 时跟随系统
};

// 深色模式状态管理
export const [isDarkMode, setIsDarkMode] = createSignal(getActualTheme());

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

// 切换主题（用户手动切换）
export const toggleTheme = () => {
  const current = isDarkMode();
  const shouldBeDark = !current; // 切换到相反的主题
  const themePreference = shouldBeDark ? 'dark' : 'light';
  
  // 保存用户选择到 localStorage
  localStorage.setItem('theme-preference', themePreference);
  
  setIsDarkMode(shouldBeDark);
  applyTheme(shouldBeDark);
};

// 监听系统主题变化（仅在用户未手动设置时跟随系统）
if (typeof window !== 'undefined') {
  // 初始化时应用主题（优先使用用户设置，否则跟随系统）
  const initialDark = getActualTheme();
  setIsDarkMode(initialDark);
  applyTheme(initialDark);
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 监听系统主题变化事件
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    // 浏览器主题切换时，无论用户是否手动设置过，都跟随浏览器主题
    // 并清除用户设置，这样刷新后就会跟随系统主题
    localStorage.removeItem('theme-preference');
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
}