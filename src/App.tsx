import { createEffect, createSignal, For, onCleanup } from 'solid-js';
import SearchBox from './components/SearchBox';
import ResultCard from './components/ResultCard';
import LoadingSpinner from './components/LoadingSpinner';
import VersionModal from './components/VersionModal';

import { ExtensionItem } from './types/extensionItem';
import Modal from './components/base/Modal';
import { downloadTarget, isTargetPlatformModalOpen, setDownloadTarget, setIsTargetPlatformModalOpen } from './store';
import ToastContainer from './components/base/Toast';
import { execDownload, useQueryParameters } from './utils';
import logoUrl from './assets/logo.png';

export default function App() {
  const [query, setQuery] = createSignal('');
  let [itemCount, setItemCount] = createSignal(0);
  const [platform, setPlatform] = createSignal("Microsoft.VisualStudio.Code");
  const [isSearching, setIsSearching] = createSignal(false);
  const [isLoadingMore, setIsLoadingMore] = createSignal(false);
  const [results, setResults] = createSignal<ExtensionItem[]>([]);
  const [currentPage, setCurrentPage] = createSignal(1);
  const [hasMore, setHasMore] = createSignal(true);
  // 模态框属性
  const [isOpen, setIsOpen] = createSignal(false);
  const [currentItem, setCurrentItem] = createSignal<ExtensionItem | null>(null);
  const [getSearchParams, setSearchParams] = useQueryParameters();
  // 顶部导航链接
  const navLinks = [
    { name: "GitHub", url: "https://github.com/OldSaltFish/vscode-extension-downloader", icon: "fa-brands fa-github", isCustomIcon: false },
    { name: "知乎", url: "https://zhuanlan.zhihu.com/p/26003070992", icon: "", isCustomIcon: true },
    { name: "Bilibili", url: "https://www.bilibili.com/video/BV1erTvzoEgn", icon: "fa-brands fa-bilibili", isCustomIcon: false },
  ];

  // 执行搜索（支持追加模式）
  const performSearch = async (append: boolean = false) => {
    if (!query()) return;
    
    const page = append ? currentPage() + 1 : 1;
    const minLoadingTime = 600; // 最小加载时间 0.6 秒
    const startTime = Date.now();
    
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsSearching(true);
      setCurrentPage(1);
      setResults([]);
      setHasMore(true);
    }

    try {
      const response = await fetch("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery", {
        method: "POST",
        headers: {
          "authority": "marketplace.visualstudio.com",
          "content-type": "application/json",
          "x-requested-with": "XMLHttpRequest",
        },
        body: JSON.stringify({
          "assetTypes": [
            "Microsoft.VisualStudio.Services.Icons.Default",
            "Microsoft.VisualStudio.Services.Icons.Branding",
            "Microsoft.VisualStudio.Services.Icons.Small"
          ],
          "filters": [
            {
              "criteria": [
                { "filterType": 8, "value": platform() },
                {
                  "filterType": 10, "value": query()
                },
                { "filterType": 12, "value": "37888" }
              ],
              "direction": 2,
              "pageSize": 15,
              "pageNumber": page,
              "sortBy": 0,
              "sortOrder": 0,
              "pagingToken": null
            }
          ],
          "flags": 870
        })
      });

      const data = await response.json();
      const newExtensions = data.results[0].extensions || [];
      const totalCount = data.results[0].resultMetadata[0].metadataItems[0].count;
      
      if (append) {
        setResults([...results(), ...newExtensions]);
      } else {
        setResults(newExtensions);
        setItemCount(totalCount);
        scrollTo(0, 0);
      }
      
      setCurrentPage(page);
      
      // 检查是否还有更多数据
      const totalPages = Math.ceil(totalCount / 15);
      setHasMore(page < totalPages && newExtensions.length > 0);
    } catch (error) {
      console.error("搜索失败:", error);
      if (!append) {
        setResults([]);
      }
    } finally {
      // 确保加载动画至少显示 0.6 秒
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  // 加载更多数据
  const loadMore = () => {
    if (!isLoadingMore() && hasMore() && !isSearching()) {
      performSearch(true);
    }
  };

  // 滚动监听
  createEffect(() => {
    // 只在有搜索结果时启用滚动加载
    if (results().length === 0) return;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
      
      // 当滚动到距离底部 200px 时触发加载
      if (distanceFromBottom <= 200 && !isLoadingMore() && hasMore()) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    onCleanup(() => window.removeEventListener('scroll', handleScroll));
  });
  const handler = () => {
    const queryParam = getSearchParams('q')
    if (queryParam) {
      setQuery(queryParam);
      performSearch(false);
    }
  };
  handler();
  createEffect(() => {
    window.addEventListener('popstate', handler);
    onCleanup(() => window.removeEventListener('popstate', handler));
  });



  return (
    <div class="min-h-screen flex flex-col bg-gray-50">
      {/* 顶部导航 */}
      <header class="sticky top-0 z-1 bg-white shadow-sm flex justify-center items-center py-2 px-4">
        <div class='max-w-6xl flex justify-between items-center w-full gap-4'>
          {/* Logo */}
          {results().length > 0 && (
            <a id='title' href='/' class='relative h-full flex-shrink-0' data-text="vsc-extension-downloader">
              <img class='h-42px' src={logoUrl} alt="" />
            </a>
          )}
          {results().length === 0 && <div></div>}
          
          {/* 搜索框 - 只在有搜索结果时显示在顶部菜单栏 */}
          {results().length > 0 && (
            <div class="flex-1 max-w-2xl mx-4">
              <SearchBox
                query={query()}
                onInput={setQuery}
                onSearch={() => {
                  setSearchParams('q', query(), false);
                  performSearch(false);
                }}
              />
            </div>
          )}
          
          {/* 导航链接 */}
          <div class="relative flex items-center gap-1 flex-shrink-0">
            {navLinks.map(link => (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center w-12 h-12 text-gray-700 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors no-underline"
                title={link.name}
              >
                {link.isCustomIcon && link.name === "知乎" ? (
                  <svg class="w-7 h-7" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="M 940.35 795.875 c 0 78.652 -63.771 142.422 -142.421 142.422 H 228.226 c -78.655 0 -142.427 -63.772 -142.427 -142.422 v -569.7 c 0 -78.658 63.772 -142.432 142.427 -142.432 H 797.93 c 78.658 0 142.432 63.772 142.432 142.431 l -0.01 569.701 Z M 415.621 543.356 h 125.593 c 0 -29.528 -13.923 -46.824 -13.923 -46.824 H 418.295 c 2.59 -53.493 4.91 -122.15 5.739 -147.65 h 103.677 s -0.561 -43.871 -12.091 -43.871 H 333.378 s 10.971 -57.374 25.594 -82.7 c 0 0 -54.417 -2.938 -72.98 69.622 c -18.562 72.56 -46.404 116.43 -49.356 124.446 c -2.953 8.013 16.031 3.795 24.044 0 c 8.015 -3.797 44.294 -16.876 54.84 -67.496 h 56.35 c 0.76 32.082 2.99 130.397 2.287 147.649 H 258.15 c -16.45 11.81 -21.936 46.824 -21.936 46.824 h 132.592 c -5.53 36.615 -15.239 83.813 -28.817 108.835 c -21.513 39.655 -32.904 75.934 -110.525 138.368 c 0 0 -12.657 9.28 26.576 5.906 c 39.231 -3.372 76.356 -13.498 102.087 -64.963 c 13.378 -26.756 27.213 -60.697 38.006 -95.121 l -0.04 0.12 l 109.26 125.795 s 14.343 -33.747 3.798 -70.87 l -80.994 -90.698 l -27.42 20.279 l -0.031 0.099 c 7.615 -26.7 13.092 -53.095 14.795 -76.061 c 0.042 -0.553 0.084 -1.119 0.121 -1.689 Z M 567.366 295.73 v 435.35 h 45.77 l 18.753 52.405 l 79.328 -52.405 h 99.978 V 295.73 H 567.366 Z M 764.09 684.253 h -51.968 l -64.817 42.817 l -15.319 -42.817 H 615.81 v -339.94 h 148.28 v 339.94 Z m 0 0"></path>
                  </svg>
                ) : (
                  <i class={`${link.icon} text-xl`}></i>
                )}
              </a>
            ))}
            {isSearching() && <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  text-sm text-gray-500">搜索中...</div>}
          </div>
        </div>

      </header>

      {/* 主要内容区 */}
      <main class="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* 首页状态：无搜索结果时，显示居中的Logo和搜索框 */}
        {results().length === 0 && !isSearching() && (
          <div class="flex flex-col items-center justify-center gap-10 w-full max-w-2xl -mt-24">
            <img class="h-80px" src={logoUrl} alt="" />
            <div class="w-full">
              <SearchBox
                query={query()}
                onInput={setQuery}
                onSearch={() => {
                  setSearchParams('q', query(), false);
                  performSearch(false);
                }}
              />
            </div>
          </div>
        )}

        {/* 搜索结果状态：有结果时，显示搜索结果列表 */}
        {results().length > 0 && (
          <div class="w-full max-w-6xl mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={results()}>
              {(item) => <ResultCard item={item} setCurrentItem={setCurrentItem} setIsOpen={setIsOpen} />}
            </For>
          </div>
        )}
        
        {/* 加载动画 */}
        {isLoadingMore() && (
          <div class="w-full max-w-6xl mt-8 flex justify-center">
            <LoadingSpinner />
          </div>
        )}
      </main>

      {/* 底部信息 */}
      <footer class="bg-white py-6 px-4 border-t border-gray-200">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div class="text-gray-500 text-sm flex items-center gap-1">
            <i class="fa-regular fa-copyright"></i>
            2025 VSCode 插件在线下载
          </div>
          <div class="mt-4 md:mt-0">
            <a href="mailto:dreamsoul23@qq.com" class="text-gray-700 hover:text-gray-900 no-underline hover:underline flex items-center gap-2">
              <i class="fa-regular fa-envelope"></i>
              dreamsoul23@qq.com
            </a>
          </div>
        </div>
      </footer>
      <VersionModal item={currentItem()!} isOpen={isOpen()} setIsOpen={setIsOpen} />
      <Modal title='选择架构' isOpen={isTargetPlatformModalOpen()} onClose={() => setIsTargetPlatformModalOpen(false)}>
        <div class='flex justify-center gap-12px'>
          <select class='w-50% p-8px' value={downloadTarget()?.targetPlatform} onChange={e => {
            setDownloadTarget({
              ...downloadTarget(),
              targetPlatform: e.target.value,
            })
            console.log('target', downloadTarget());

            execDownload(downloadTarget()!);
            setIsTargetPlatformModalOpen(false);
          }}>
            {currentItem()?.versions.map(item => {
              return (
                <option class='p-2' value={item.targetPlatform}>{item.targetPlatform}</option>
              )
            })}
          </select>
          <button class='bg-blue-600 text-white py-8px rounded-md hover:bg-blue-700 transition-colors' onClick={() => {
            execDownload(downloadTarget()!);
            setIsTargetPlatformModalOpen(false);
          }}>下载</button>
        </div>
      </Modal>
      <ToastContainer></ToastContainer>
    </div>
  );
}