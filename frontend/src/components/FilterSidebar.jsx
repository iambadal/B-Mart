import { useState } from "react";
import { FILTERS_DATA } from "../data/FILTERS_DATA";
import FilterGroup from "./FilterGroup";
import { CgClose } from "react-icons/cg";

const FilterSidebar = ({
  selectedFilters,
  setSelectedFilters,
  showFilter,
  setShowFilter,
}) => {
  const [openGroups, setOpenGroups] = useState({});
  // const [selectedFilters, setSelectedFilters] = useState({});

  const toggleGroup = (title) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleCheckboxChange = (filterKey, optionValue) => {
    setSelectedFilters((prev) => {
      const currentSelections = prev[filterKey] || [];

      // Check select option is already exist...
      const exists = currentSelections.some((selected) => {
        if (typeof selected === "object" && typeof optionValue === "object") {
          return (
            selected.minPrice === optionValue.minPrice &&
            selected.maxPrice === optionValue.maxPrice
          );
        }
        return selected === optionValue;
      });

      let updatedSelections;

      if (exists) {
        updatedSelections = currentSelections.filter((selected) => {
          if (typeof selected === "object" && typeof optionValue === "object") {
            return !(
              selected.minPrice === optionValue.minPrice &&
              selected.maxPrice === optionValue.maxPrice
            );
          }
          return selected !== optionValue;
        });
      } else {
        updatedSelections = [...currentSelections, optionValue];
      }

      return {
        ...prev,
        [filterKey]: updatedSelections,
      };
    });
  };

  return (
    <div
      className={`${
        showFilter ? "block" : "max-sm:hidden"
      }  max-sm:absolute top-33 left-0 z-40 w-full h-fit sm:max-w-60 p-4 rounded-xl bg-gray-50 shadow`}
    >
      <h1 className=" flex justify-between items-center font-semibold text-lg pb-2 mb-4 border-b border-gray-600/15">
        Filters
        {showFilter && (
          <button onClick={() => setShowFilter(false)}>
            <CgClose />
          </button>
        )}
      </h1>
      {FILTERS_DATA.map((filter, idx) => (
        <FilterGroup
          key={filter.key || idx}
          title={filter.title}
          filterKey={filter.key}
          options={filter.options}
          isOpen={!!openGroups[filter.title]}
          onToggle={() => toggleGroup(filter.title)}
          selectedOptions={selectedFilters[filter.key] || []}
          onOptionChange={handleCheckboxChange}
        />
      ))}

      <button
        className="w-full mt-4 font-medium text-red-500 text-center hover:text-red-600  transition-colors cursor-pointer "
        onClick={() =>
          setSelectedFilters({
            search: "",
            tag: "",
            category: [],
            price: [],
            rating: [],
            newArrival: [],
            inStock: [],
          })
        }
      >
        Clear All
      </button>
    </div>
  );
};

export default FilterSidebar;
