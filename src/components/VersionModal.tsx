import { createSignal, Show } from "solid-js";
import { ExtensionItem, Version } from "../types/extensionItem";
import { execDownload } from "../utils";
import { createEffect } from "solid-js";
import { downloadTarget, setDownloadTarget } from "../store";
// 外部传递ID进行查询，并选择，最终将选择的版本返回给调用者

async function fetchExtensionVersions(id: string = "WallabyJs.console-ninja") {
    try {
        const response = await fetch("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery", {
            method: 'POST',
            headers: {
                'accept': 'application/json;api-version=7.2-preview.1;excludeUrls=true',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                assetTypes: null,
                filters: [{
                    criteria: [{
                        filterType: 7,
                        value: id
                    }],
                    direction: 2,
                    pageSize: 100,
                    pageNumber: 1,
                    sortBy: 0,
                    sortOrder: 0,
                    pagingToken: null
                }],
                flags: 2151
            })
        });

        const result = await response.json();
        const tempSet = new Set<string>();
        const extensionData: ExtensionItem = result.results[0].extensions[0];
        const tempList: string[] = [];
        // extensionData.versions.forEach(item => {
        //     if (!tempSet.has(item.version)) {
        //         tempSet.add(item.version);
        //         const dateObject = new Date(item.lastUpdated);
        //         // 使用 UTC 方法提取
        //         const year = dateObject.getUTCFullYear();
        //         const month = dateObject.getUTCMonth() + 1; // getUTCMonth() 返回 0-11，需要 +1
        //         const day = dateObject.getUTCDate();

        //         // 格式化输出
        //         const yearStr = String(year);
        //         const monthStr = String(month).padStart(2, '0'); // 确保月份是两位数
        //         const dayStr = String(day).padStart(2, '0');     // 确保日期是两位数

        //         const date = `${yearStr}-${monthStr}-${dayStr}`;
        //         tempList.push(date);
        //     }
        // })
        // return Array.from(tempSet);
        return extensionData.versions;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function timeMap(dateString: string) {
    const dateObject = new Date(dateString);
    // 使用 UTC 方法提取
    const year = dateObject.getUTCFullYear();
    const month = dateObject.getUTCMonth() + 1; // getUTCMonth() 返回 0-11，需要 +1
    const day = dateObject.getUTCDate();

    // 格式化输出
    const yearStr = String(year);
    const monthStr = String(month).padStart(2, '0'); // 确保月份是两位数
    const dayStr = String(day).padStart(2, '0');     // 确保日期是两位数

    return `${yearStr}-${monthStr}-${dayStr}`;
}

function versionDisplayMap(version: Version) {
    return `${version.version} [${timeMap(version.lastUpdated)} Released]${version.targetPlatform ? ` [${version.targetPlatform}]` : ''}`;
}

export default function VersionModal(props: { item: ExtensionItem, isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
    const [inputValue, setInputValue] = createSignal("");
    const [selectedVersion, setSelectedVersion] = createSignal<Version>();
    const [isDropdownOpen, setIsDropdownOpen] = createSignal(true);
    const [versionList, setVersionList] = createSignal<Version[]>([]);

    const handleClose = () => {
        setInputValue("");
        setSelectedVersion();
        props.setIsOpen(false);
    }
    const handleDownload = () => {
        const version = downloadTarget()?.version;
        if (version) {
            execDownload(downloadTarget()!);
        } else {
            alert("请选择一个版本进行下载");
        }
    }

    createEffect(() => {
        if (props.isOpen) {
            fetchExtensionVersions(`${props.item!.publisher.publisherName}.${props.item!.extensionName}`).then(versions => {
                setVersionList(versions);
            })
            setIsDropdownOpen(true);
        }
    });
    // 模糊匹配过滤
    const filteredOptions = () => {
        let result = versionList();
        if (downloadTarget()?.targetPlatform && downloadTarget()?.targetPlatform !== 'undefined') {
            result = result.filter(v => v.targetPlatform === downloadTarget()?.targetPlatform)
        }
        if (!inputValue()) return result;
        return result.filter(option => {
            return versionDisplayMap(option).toLowerCase().includes(inputValue().toLowerCase());
        });
    };

    return (
        <>
            {/* 模态框 */}
            <Show when={props.isOpen}>
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transition-colors">
                        {/* 头部 - 标题和关闭按钮 */}
                        <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">请选择版本</h3>
                            <button
                                onClick={handleClose}
                                class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 主体内容 */}
                        <div class="relative p-4 grid gap-2">
                            {/* 输入框 */}
                            <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                                <input
                                    type="text"
                                    value={selectedVersion() ? versionDisplayMap(selectedVersion()!) : inputValue()}
                                    onInput={(e) => {
                                        setInputValue(e.currentTarget.value);
                                        // setSelectedVersion(e.currentTarget.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen())}
                                    placeholder="搜索或选择..."
                                    class="flex-1 p-2 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                <button
                                    onClick={() => {
                                        setDownloadTarget({
                                            ...downloadTarget(),
                                            version: selectedVersion()?.version,
                                        })
                                        handleDownload()
                                    }}
                                    class="h-36px px-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                >
                                    下载
                                </button>
                                {/* 下拉选项 */}

                            </div>
                            <div class={`${isDropdownOpen() ? '' : 'hidden'} mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-auto`}>
                                {filteredOptions().length > 0 ? (
                                    filteredOptions().map(option => (
                                        <div
                                            onClick={() => {
                                                setSelectedVersion(option);
                                                if (option.targetPlatform) {
                                                    setDownloadTarget({
                                                        ...downloadTarget(),
                                                        targetPlatform: option.targetPlatform
                                                    })
                                                }
                                                setInputValue("");
                                                setIsDropdownOpen(false);
                                            }}
                                            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100 transition-colors"
                                        >
                                            {versionDisplayMap(option)}
                                        </div>
                                    ))
                                ) : (
                                    <div class="p-2 text-gray-500 dark:text-gray-400">无匹配结果</div>
                                )}
                            </div>
                            <Show when={props.item.versions.length > 1}>
                                <select class='w-full p-8px bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md' value={downloadTarget()?.targetPlatform} onChange={e => {
                                    setDownloadTarget({
                                        ...downloadTarget(),
                                        targetPlatform: e.target.value
                                    })
                                }}>
                                    {props.item?.versions.map(item => {
                                        return (
                                            <option class="p-2" value={item.targetPlatform}>{item.targetPlatform}</option>
                                        )
                                    })}
                                </select>
                            </Show>
                        </div>


                        {/* 底部按钮 */}
                        <div class="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 gap-2">
                            <button
                                onClick={handleClose}
                                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleClose}
                                class="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors"
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            </Show>
        </>
    );
}