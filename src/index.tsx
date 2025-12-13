import { render } from 'solid-js/web';
import 'uno.css';
import './main.css';
import App from './App';

// 初始化深色模式（在渲染前应用，避免闪烁）
const initTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (saved === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // 如果没有保存的主题，使用系统偏好
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }
};
initTheme();

// 引入 Font Awesome
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
link.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
link.crossOrigin = 'anonymous';
document.head.appendChild(link);

// 设置网站图标
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/svg+xml';
favicon.href = '/favicon.svg';
document.head.appendChild(favicon);

render(() => <App />, document.getElementById('root')!);