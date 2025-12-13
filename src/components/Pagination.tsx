import { Component, createSignal } from 'solid-js';
interface PaginationProps {
    itemCount: number;
    onPageChange: (page?: number) => void;
}
const Pagination: Component<PaginationProps> = (props) => {
    // 状态管理
    const [currentPage, setCurrentPage] = createSignal(1);
    console.log('items',props.itemCount);
    
    // 计算总页数(固定15条每页)
    const totalPages = () => Math.ceil(props.itemCount/ 15);
    console.log('总页数',totalPages());
    
    // 生成页码按钮范围（当前页前后各2页）
    const getPageRange = () => {
        const range = [];
        const start = Math.max(1, currentPage() - 2);
        const end = Math.min(totalPages(), currentPage() + 2);

        for (let i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    };

    // 切换页码
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages()) {
            setCurrentPage(page);
        }
        props.onPageChange(page);
    };

    return (
        <div class="flex items-center justify-center py-4">
            <div class="flex items-center justify-center gap-2">
                {/* 第一页按钮 */}
                <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage() === 1}
                    class="flex items-center justify-center w-12 h-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 disabled:hover:text-gray-600 dark:disabled:hover:text-gray-300 shadow-sm hover:shadow-md active:scale-95"
                    title="第一页"
                >
                    &laquo;
                </button>

                {/* 上一页按钮 */}
                <button
                    onClick={() => goToPage(currentPage() - 1)}
                    disabled={currentPage() === 1}
                    class="flex items-center justify-center w-12 h-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 disabled:hover:text-gray-600 dark:disabled:hover:text-gray-300 shadow-sm hover:shadow-md active:scale-95"
                    title="上一页"
                >
                    &lt;
                </button>

                {/* 页码按钮 */}
                {getPageRange().map((page) =>
                    page === currentPage() ? (
                        // 当前页（不可点击）
                        <span class="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 dark:bg-blue-700 text-white font-semibold shadow-md">
                            {page}
                        </span>
                    ) : (
                        // 其他页
                        <button
                            onClick={() => goToPage(page)}
                            class="flex items-center justify-center w-12 h-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white shadow-sm hover:shadow-md active:scale-95"
                        >
                            {page}
                        </button>
                    )
                )}

                {/* 下一页按钮 */}
                <button
                    onClick={() => goToPage(currentPage() + 1)}
                    disabled={currentPage() === totalPages()}
                    class="flex items-center justify-center w-12 h-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 disabled:hover:text-gray-600 dark:disabled:hover:text-gray-300 shadow-sm hover:shadow-md active:scale-95"
                    title="下一页"
                >
                    &gt;
                </button>

                {/* 最后一页按钮 */}
                <button
                    onClick={() => goToPage(totalPages())}
                    disabled={currentPage() === totalPages()}
                    class="flex items-center justify-center w-12 h-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 disabled:hover:text-gray-600 dark:disabled:hover:text-gray-300 shadow-sm hover:shadow-md active:scale-95"
                    title="最后一页"
                >
                    &raquo;
                </button>
            </div>
        </div>
    );
}

export default Pagination;