import { type Component, type JSX, Show, createMemo } from 'solid-js';
import { Portal } from 'solid-js/web';
import { isDarkMode } from '../../store';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string; // 副标题，用于显示插件名字
  children: JSX.Element;
}

const Modal: Component<ModalProps> = (props) => {
  // 点击遮罩层关闭
  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  // 根据深色模式计算背景样式
  const backgroundStyle = createMemo(() => {
    const isDark = isDarkMode();
    
    if (isDark) {
      return `
        linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%),
        rgba(39, 39, 42, 0.8)
      `;
    } else {
      return `
        linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.03) 100%),
        rgba(255, 255, 255, 0.8)
      `;
    }
  });

  const backgroundColor = createMemo(() => {
    return isDarkMode() ? 'rgba(39, 39, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  });

  return (
    <Show when={props.isOpen}>
      <Portal>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
          onPointerDown={handleOverlayClick}
        >
          {/* 遮罩层 */}
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />

          {/* 对话框主体 */}
          <div 
            class="relative z-10 w-full max-w-md rounded-lg backdrop-blur-md transition-colors relative overflow-hidden"
            style={{
              'box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              'backdrop-filter': 'blur(8px) saturate(150%)',
              '-webkit-backdrop-filter': 'blur(8px) saturate(150%)',
              'background': backgroundStyle(),
              'background-color': backgroundColor()
            }}
          >
            {/* 头部 - 标题和关闭按钮 */}
            <div class="flex justify-between items-start py-2 px-4 border-b border-gray-200 dark:border-zinc-700">
              <div class="flex flex-col">
                <Show when={props.title}>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-0 mt-1">{props.title}</h3>
                </Show>
                <Show when={props.subtitle}>
                  <p class="text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-0">{props.subtitle}</p>
                </Show>
              </div>
              <button
                onClick={props.onClose}
                class="text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors border-none outline-none bg-transparent cursor-pointer mt-1"
                style={{ 'box-shadow': 'none', 'border': 'none', 'padding': '0' }}
              >
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor">
                  <path d="M810.666667 273.493333L750.506667 213.333333 512 451.84 273.493333 213.333333 213.333333 273.493333 451.84 512 213.333333 750.506667 273.493333 810.666667 512 572.16 750.506667 810.666667 810.666667 750.506667 572.16 512z"></path>
                </svg>
              </button>
            </div>

            {/* 内容区域 */}
            <div class="relative p-4 text-gray-900 dark:text-zinc-100">{props.children}</div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};

export default Modal;
