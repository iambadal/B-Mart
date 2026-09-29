
const CustomCheckbox = ({
  name,
  isChecked,
  value,
  toggleCheckbox,
  className,
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        className="sr-only" // Visually hide the native checkbox.
        checked={isChecked}
        value={value}
        onChange={toggleCheckbox}
      />

      <div
        className={`flex items-center justify-center rounded-md border-2 ring-4 p-0.5 transition ${className}`}
      >
        {isChecked && (
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        )}
      </div>

      {/* <span className="ml-2 text-gray-700">{label}</span> */}
    </label>
  );
};

export default CustomCheckbox;
