import { FiSearch } from "react-icons/fi";

function SearchBar({ searchTerm, handleSearch, placeholder, className }) {
  // const debouncedSearchTerm = useDebounce(searchTerm)

  return (
    <div
      className={` relative rounded-md bg-gray-800/80 text-blue-100 ${className}`}
    >
      <FiSearch size={20} className=" absolute top-3 left-3 text-current  " />
      <input
        type="text"
        name="search"
        id="search"
        placeholder={placeholder}
        className=" w-full pl-10 pr-5 py-2.5 text-base focus:outline-0"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
