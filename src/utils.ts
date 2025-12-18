import { showToast } from "./components/base/Toast";
import { DownloadTarget } from "./types/downloadTarget";

export const execDownload = (downloadTarget: Partial<DownloadTarget>) => {
  if (!downloadTarget.extensionName) {
    showToast({ message: "未获取扩展名称" });
    return;
  } else if (!downloadTarget.publisherName) {
    showToast({ message: "未获取扩展作者" });
    return;
  } else if (!downloadTarget.version) {
    showToast({ message: "未获取扩展版本" });
    return;
  }
  let url = `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${downloadTarget.publisherName}/vsextensions/${downloadTarget.extensionName}/${downloadTarget.version}/vspackage`;
  if (downloadTarget.targetPlatform) {
    url += `?targetPlatform=${downloadTarget.targetPlatform}`;
  }
  const a = document.createElement("a");
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

import { createSignal, onCleanup, createEffect } from "solid-js";

// 自定义 Hook 来获取和设置 URL 查询参数
export function useQueryParameters(): [
  (key: string) => string | null, // Getter
  (key: string, value: string, replace?: boolean) => void // Setter
] {
  // Signal 用于存储查询参数的当前状态
  const [searchParams, setSearchParams] = createSignal(
    new URLSearchParams(window.location.search)
  );

  // 监听 popstate 事件 (用户点击浏览器前进/后退按钮时触发)
  createEffect(() => {
    const handler = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener("popstate", handler);
    onCleanup(() => window.removeEventListener("popstate", handler));
  });

  // ------------ 获取函数 ------------
  const getParam = (key: string) => {
    // 每次调用都会访问 signal，所以是响应式的
    return searchParams().get(key);
  };

  // ------------ 设置函数 ------------
  const setParam = (key: string, value: string, replace = true) => {
    const currentParams = searchParams();
    const newParams = new URLSearchParams(currentParams.toString());

    if (value === null || value === undefined || value === "") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }

    const hasParams = newParams.toString().length > 0;
    const newUrl = hasParams 
      ? `${window.location.pathname}?${newParams.toString()}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;

    if (replace) {
      // 使用 replaceState 不会创建新的历史记录
      window.history.replaceState(null, "", newUrl);
    } else {
      // 使用 pushState 会创建新的历史记录
      window.history.pushState(null, "", newUrl);
    }

    // 手动更新 signal，以便依赖它的组件重新渲染
    setSearchParams(newParams);
  };

  return [getParam, setParam];
}
