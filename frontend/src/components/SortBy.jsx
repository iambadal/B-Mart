import { SORTS_BY_DATA } from "../data/SORTS_BY_DATA";
import Checkbox from "./CustomCheckbox";
import { CgClose } from "react-icons/cg";

const SortBy = ({ sortBy, setSortBy, showSort, setShowSort }) => {
  // const [sortBy, setSortBy] = useState("");

  // console.log(sortBy);

  return (
    <div
      className={`${
        showSort ? "flex max-sm:flex-col" : "flex max-sm:hidden "
      }  gap-4 w-full max-sm:max-w-[640px] max-sm:fixed left-0 bottom-5 z-40 bg-gray-50 p-4 rounded-xl`}
    >
      <h1 className="flex  justify-between font-medium ">
        SORT BY
        {showSort && (
          <button
            className=" text-red-600/50 cursor-pointer"
            onClick={() => setShowSort(false)}
          >
            <CgClose size={20} />
          </button>
        )}
      </h1>

      <ul className=" max-sm:w-full flex flex-row max-sm:flex-col items-center justify-between gap-4">
        {SORTS_BY_DATA.map((sort, idx) => (
          <li
            key={idx}
            className=" max-sm:w-full flex flex-row items-center justify-between gap-3"
          >
            <p className="text-base text-gray-700">{sort.title}</p>
            <Checkbox
              name={sort.title}
              value={sort.value}
              isChecked={SORTS_BY_DATA[idx].value === sortBy}
              toggleCheckbox={(e) => setSortBy(e.target.value)}
              className={`size-4.5 bg-gray-900/0 ${
                sortBy
                  ? "text-[#334e86] border-gray-600/20 ring-gray-600/0"
                  : "text-blue-50 border-gray-600/20 ring-gray-600/0"
              }`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SortBy;
