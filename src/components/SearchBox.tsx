import { Component, createSignal } from 'solid-js';

interface SearchBoxProps {
  query: string;
  onInput: (value: string) => void;
  onSearch: () => void;
}

const SearchBox: Component<SearchBoxProps> = (props) => {
  const [isFocused, setIsFocused] = createSignal(false);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      props.onSearch();
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div class="relative hover:shadow-lg transition-shadow">
      <input
        type="text"
        value={props.query}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="搜索扩展..."
        autofocus
        class={`w-full box-border pl-12px pr-104px py-3 rounded-none border-2 border-solid outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 appearance-none ${
          isFocused() 
            ? 'border-blue-500 dark:border-blue-600' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
      />
      <button
        onClick={props.onSearch}
        class="absolute h-80% right-1 top-50% -translate-y-1/2 w-100px right-0 bg-blue-600 dark:bg-blue-700 text-white px-4 py-1 rounded-none border-0 hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
      >
        搜索(Enter)
      </button>
    </div>
  );
};

export default SearchBox;