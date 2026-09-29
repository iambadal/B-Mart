import { useState } from "react";
import { MdOutlineLibraryAddCheck } from "react-icons/md";

const TagsInput = ({ value = [], handleChange }) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    if (input.trim() && !value.includes(input.trim())) {
      handleChange([...value, input.trim()]);
      setInput("");
    }
  };

  const removeTag = (tag) => {
    handleChange(value.filter((t) => t !== tag));
  };

  return (
    <>
      <div className="w-full FormDiv mb-8">
        <label htmlFor="tag" className="FormLabel">
          Tags
        </label>
        <div className=" flex gap-4">
          <input
            type="text"
            name="tag"
            id="tag"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full FormInput"
          />
          <button
            disabled={!input}
            type="button"
            className="p-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-gray-600/10 border border-gray-700 outline-4 outline-gray-700/20 focus:border-blue-600 focus:outline-blue-600/20 hover:bg-blue-600/10 text-gray-600 hover:text-blue-600 transition-all cursor-pointer"
            onClick={addTag}
          >
            <MdOutlineLibraryAddCheck size={24} />
          </button>
        </div>
      </div>
      <div className="flex gap-4 flex-wrap mb-8">
        {value.map((tag, i) => (
          <span
            key={i}
            className="px-2 pb-1 rounded-md bg-green-600/10 text-green-600"
          >
            {tag}
            <button
              type="button"
              className=" disabled:cursor-not-allowed ml-2 text-rose-600 cursor-pointer"
              onClick={() => removeTag(tag)}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </>
  );
};

export default TagsInput;
