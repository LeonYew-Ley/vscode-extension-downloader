import { render } from 'solid-js/web';
import 'uno.css';
import './main.css';
import App from './App';

// 引入 Font Awesome
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
link.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
link.crossOrigin = 'anonymous';
document.head.appendChild(link);

render(() => <App />, document.getElementById('root')!);