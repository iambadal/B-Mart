import Checkbox from "./CustomCheckbox";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const FilterGroup = ({
  title,
  filterKey,
  options,
  isOpen,
  onToggle,
  selectedOptions,
  onOptionChange,
}) => {

  const isOptionSelected = (selectedOptions, optionValue) => {
    return selectedOptions.some((selected) => {
      if (typeof selected === "object" && typeof optionValue === "object") {
        return (
          selected.minPrice === optionValue.minPrice &&
          selected.maxPrice === optionValue.maxPrice
        );
      }
      return selected === optionValue;
    });
  };

  
  return (
    <div className=" not-last:border-b border-gray-600/20 py-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <h2 className="text-sm font-medium">{title}</h2>
        <span>{isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
      </div>
      {isOpen && (
        <ul className="mt-2">
          {options.map((option, idx) => (
            <li
              key={idx}
              className="flex items-center gap-1 space-x-2 my-2.5 mx-1 "
            >
              <Checkbox
                name={title}
                value={option.value}
                isChecked={isOptionSelected(selectedOptions, option.value)}
                toggleCheckbox={() => onOptionChange(filterKey, option.value)}
                className={`size-4.5 bg-gray-900/0 ${
                  isOptionSelected(selectedOptions, option.value)
                    ? "text-gray-600 border-gray-600/20 ring-gray-600/0"
                    : "text-blue-50 border-gray-600/20 ring-gray-600/0"
                }`}
              />
              <label
                htmlFor={`${title}-${option}`}
                className="text-sm text-gray-600 hover:text-gray-950 active:text-gray-950 cursor-pointer "
              >
                {option.name}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterGroup;
