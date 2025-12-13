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
    { name: "GitHub", url: "https://github.com/OldSaltFish/vscode-extension-downloader" },
    { name: "知乎(顶部评论)", url: "https://zhuanlan.zhihu.com/p/26003070992" },
    { name: "Bilibili", url: "https://www.bilibili.com/video/BV1erTvzoEgn" },
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
      <header class="sticky top-0 z-1 bg-white shadow-sm flex justify-center items-center">
        <div class='max-w-6xl flex justify-between items-center w-full'>
          <a id='title' href='/' class='relative h-full' data-text="vsc-extension-downloader">
            <img class='h-42px' src={logoUrl} alt="" />
          </a>
          <div class="relative flex py-2">
            {navLinks.map(link => (
              <a
                href={link.url}
                target="_blank"
                class="py-2 px-2 text-black hover:text-blue-600 hover:bg-blue-300 bg-blue-200 transition-colors no-underline"
              >
                {link.name}
              </a>
            ))}
            {isSearching() && <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  text-sm text-gray-500">搜索中...</div>}
          </div>
        </div>

      </header>

      {/* 主要内容区 */}
      <main class="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div class="sticky z-1 top-72px w-full max-w-2xl transition-all duration-300">
          <SearchBox
            query={query()}
            onInput={setQuery}
            onSearch={() => {
              setSearchParams('q', query(), false);
              performSearch(false);
            }}
          />

        </div>

        {/* 搜索结果列表 */}
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
          <div class="text-gray-500 text-sm">
            © 2025 vscode插件在线下载.
          </div>
          <div class="mt-4 md:mt-0">
            <a href="mailto:dreamsoul23@qq.com" class="text-blue-600 hover:text-blue-800">
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