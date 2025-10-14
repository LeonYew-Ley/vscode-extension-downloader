import { Component } from 'solid-js';

interface SearchBoxProps {
  query: string;
  onInput: (value: string) => void;
  onSearch: () => void;
}

const SearchBox: Component<SearchBoxProps> = (props) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      props.onSearch();
    }
  };

  return (
    <div class="relative">
      <input
        type="text"
        value={props.query}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder="搜索扩展..."
        autofocus
        class="w-full box-border pl-12px pr-104px py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
      />
      <button
        onClick={props.onSearch}
        class="absolute h-80% right-1 top-50% -translate-y-1/2 w-100px right-0 bg-blue-600 text-white px-4 py-1 rounded-md border-0 hover:bg-blue-700 transition-colors"
      >
        搜索(Enter)
      </button>
    </div>
  );
};

export default SearchBox;