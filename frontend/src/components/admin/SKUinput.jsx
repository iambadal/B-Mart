import { RiAiGenerateText } from "react-icons/ri";

const SKUInput = ({value, setValue, handleChange}) => {
  // Stock keeping unit Generate.
  const skuGenerate = () => {
    if (value.category !== "") {
      const category = value.category;
      const finalSku =
        category.substring(0, 4).toLocaleUpperCase() + "-" + Date.now();
      setValue({ ...value, sku: finalSku });
    }
  };

  return (
    <div className="w-full FormDiv mb-8">
      <label htmlFor="sku" className="FormLabel">
        SKU
      </label>
      <div className="flex gap-4">
        <input
          className="w-full FormInput "
          type="text"
          name="sku"
          id="sku"
          value={value.sku}
          onChange={e => handleChange("sku", e)}
        />
        <button
          type="button"
          disabled={value.category === ""}
          className="p-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-gray-600/10 border border-gray-700 outline-4 outline-gray-700/20 focus:border-blue-600 focus:outline-blue-600/20 hover:bg-blue-600/10 text-gray-600 hover:text-blue-600 transition-all cursor-pointer"
          onClick={() => skuGenerate()}
        >
          <RiAiGenerateText size={24} />
        </button>
      </div>
      
    </div>
  );
};

export default SKUInput;
