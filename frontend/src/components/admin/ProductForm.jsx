import { useEffect, useState } from "react";
import Select from "../CustomSelect";
import CustomCheckbox from "../CustomCheckbox";
import ShimmerButton from "../ShimmerButton";
import { CgSpinner, CgClose } from "react-icons/cg";
import { GrChapterAdd } from "react-icons/gr";
import SKUInput from "./SKUinput";
import TagsInput from "./TagsInput";
import { useCreateProduct, useUpdateProduct } from "../../Hooks/useProducts";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "d9-toast";

const ProductForm = ({ initialData = null, setInitialData, cancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    sku: "",
    tags: [],
    status: "Active",
    images: [],
    questionAnswer: [{ question: "", answer: "" }],
    metadata: {
      dimensions: { width: 0, height: 0, depth: 0 },
      weight: 0,
      color: "",
      extra: {},
    },
  });

  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const { mutate: createProduct, isPending } = useCreateProduct();
  const { mutate: updateProduct, isPending: isLoading } = useUpdateProduct();

  // Fill the form when editing mode.
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  // Add a new custom metadata field..
  const addExtraField = (key, value = "") => {
    if (!key) return;
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        extra: {
          ...prev.metadata.extra,
          [key]: value,
        },
      },
    }));
  };

  // Update an existing extra field.
  const updateExtraField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        extra: {
          ...prev.metadata.extra,
          [key]: value,
        },
      },
    }));
  };

  // Remove an extra field..
  const removeExtraField = (key) => {
    setFormData((prev) => {
      const updatedExtra = { ...prev.metadata.extra };
      delete updatedExtra[key];
      return {
        ...prev,
        metadata: { ...prev.metadata, extra: updatedExtra },
      };
    });
  };

  // Add extra FAQ.
  const addExtraQAField = (question, answer = "") => {
    if (!question) return;

    setFormData((prev) => ({
      ...prev,
      questionAnswer: [
        ...prev.questionAnswer,
        { question: question, answer: answer },
      ],
    }));
  };

  // Remove QA field..
  const removeQAField = (idx) => {
    setFormData((prev) => ({
      ...prev,
      questionAnswer: prev.questionAnswer.filter((_, i) => i !== idx),
    }));
  };

  // Handle QA changes..
  const handleQuestionAnswerChange = (idx, key, value) => {
    setFormData((prev) => {
      const updatedQA = [...prev.questionAnswer];
      updatedQA[idx] = { ...updatedQA[idx], [key]: value };
      return { ...prev, questionAnswer: updatedQA };
    });
  };

  // Handle form change..
  const handleChange = (path, ev) => {
    const { value, type, checked } = ev.target;
    const keys = path.split(".");
    setFormData((prev) => {
      let updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] =
        type === "checkbox" ? (checked ? "Active" : "Inactive") : value;

      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("price", formData.price);
    fd.append("category", formData.category);
    fd.append("stock", formData.stock);
    fd.append("sku", formData.sku);
    fd.append("status", formData.status);
    fd.append("tags", JSON.stringify(formData.tags)); // Convert array → JSON string
    fd.append("questionAnswer", JSON.stringify(formData.questionAnswer));
    fd.append("metadata", JSON.stringify(formData.metadata));

    formData.images.forEach((file) => {
      fd.append("images", file);
    });

    if (!initialData) {
      createProduct(
        { fd, accessToken },
        {
          onSuccess: (result) => {
            // console.log(result);
            showToast({
              message: "Product is successfully added.",
              type: "success",
              theme: "dark",
              duration: 3000,
              closable: true,
              progress: true,
              pauseOnHover: true,
              pauseOnFocusLoss: true,
            });

            setFormData({});
            cancel();
          },
        }
      );
    } else {
      const productId = formData._id;
      updateProduct(
        { fd, accessToken, productId },
        {
          onSuccess: (result) => {
            // console.log(result);
            showToast({
              message: "Successfully update product.",
              type: "success",
              theme: "dark",
              duration: 3000,
              closable: true,
              progress: true,
              pauseOnHover: true,
              pauseOnFocusLoss: true,
            });
            setInitialData(null);
            setFormData({});
            cancel();
          },
        }
      );
    }
  };

  return (
    <div className=" fixed top-0 left-0 h-screen w-full z-50 p-3 backdrop-blur-2xl max-sm:bg-gray-950 bg-gray-950/80 overflow-y-auto">
      <form
        className=" relative w-full max-w-3xl mx-auto my-10 space-y-2 rounded-3xl p-5 bg-gray-800/10 text-gray-50 shadow-xl ring-2 ring-gray-600/20"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-6">
          {initialData ? "Edit Products" : "Add New Products"}
        </h2>

        {/* Product name */}
        <div className=" FormDiv mb-8">
          <label htmlFor="name" className=" FormLabel ">
            Product Name
          </label>
          <input
            className="FormInput"
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e)}
            required
          />
        </div>

        {/* Product description */}
        <div className=" FormDiv mb-8">
          <label htmlFor="description" className=" FormLabel">
            Description
          </label>
          <textarea
            className="FormInput"
            name="description"
            id="description"
            maxLength={900}
            value={formData.description}
            onChange={(e) => handleChange("description", e)}
          />
        </div>

        {/* Tags */}
        <TagsInput
          value={formData.tags}
          handleChange={(tags) => setFormData({ ...formData, tags })}
        />

        <div className=" w-full flex flex-row max-sm:flex-col items-center gap-4">
          {/* Price */}
          <div className="w-full FormDiv mb-8">
            <label htmlFor="price" className="FormLabel">
              Price
            </label>
            <input
              className="FormInput"
              type="number"
              name="price"
              id="price"
              value={formData.price}
              onChange={(e) => handleChange("price", e)}
              required
            />
          </div>
          {/* Category */}
          <div className=" w-full FormDiv mb-8">
            <label className="FormLabel">Category</label>
            <Select
              selected={formData.category || "Select"}
              handleSelect={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              options={[
                { value: "Electronics", label: "Electronics" },
                { value: "Fashion", label: "Fashion" },
                { value: "Home", label: "Home" },
                { value: "Grocery", label: "Grocery" },
              ]}
              className={"w-full FormInput"}
              hoverStyle={"hover:bg-blue-600/50"}
            />
          </div>
        </div>

        <div className="w-full flex flex-row max-sm:flex-col items-center gap-4">
          {/* Stock */}
          <div className="w-full FormDiv mb-8">
            <label htmlFor="stock" className="FormLabel">
              Stock Quantity
            </label>
            <input
              className="FormInput"
              type="number"
              name="stock"
              id="stock"
              value={formData.stock}
              onChange={(e) => handleChange("stock", e)}
            />
          </div>

          {/* SKU */}
          <SKUInput
            value={formData}
            setValue={setFormData}
            handleChange={handleChange}
          />
        </div>

        {/* Metadata */}
        <h2 className="my-3 font-medium font-poppins">Metadata</h2>
        <div className=" grid grid-cols-2 gap-3 relative p-4 mb-8 rounded-md border border-gray-700/50">
          {/* width */}
          <div className=" FormDiv mt-2">
            <label htmlFor="width" className=" FormLabel">
              Width
            </label>
            <input
              className="FormInput"
              type="number"
              name="width"
              id="width"
              value={formData.metadata.dimensions.width}
              onChange={(e) => handleChange("metadata.dimensions.width", e)}
            />
          </div>
          {/* height */}
          <div className=" FormDiv mt-2">
            <label htmlFor="height" className=" FormLabel">
              Height
            </label>
            <input
              className="FormInput"
              type="number"
              name="height"
              id="height"
              value={formData.metadata.dimensions.height}
              onChange={(e) => handleChange("metadata.dimensions.height", e)}
            />
          </div>
          {/* depth */}
          <div className=" FormDiv mt-4">
            <label htmlFor="depth" className=" FormLabel">
              Depth
            </label>
            <input
              className="FormInput"
              type="number"
              name="depth"
              id="depth"
              value={formData.metadata.dimensions.depth}
              onChange={(e) => handleChange("metadata.dimensions.depth", e)}
            />
          </div>
          {/* weight */}
          <div className=" FormDiv mt-4">
            <label htmlFor="weight" className=" FormLabel">
              Weight
            </label>
            <input
              className="FormInput"
              type="number"
              name="weight"
              id="weight"
              value={formData.metadata.weight}
              onChange={(e) => handleChange("metadata.weight", e)}
            />
          </div>
          {/* color */}
          <div className=" FormDiv mt-4">
            <label htmlFor="color" className=" FormLabel">
              Color
            </label>
            <input
              className="FormInput"
              type="text"
              name="color"
              id="color"
              value={formData.metadata.color}
              onChange={(e) => handleChange("metadata.color", e)}
              placeholder="red,green,blue"
            />
          </div>

          {/* extra fields */}
          {Object.entries(formData.metadata.extra).map(([key, value]) => (
            <div key={key} className=" FormDiv mt-4 ">
              <label className="FormLabel">{key.toUpperCase()}</label>
              <div className=" relative flex items-center justify-between gap-2.5 ">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateExtraField(key, e.target.value)}
                  className="w-full py-2 px-3 text-lg rounded-md bg-gray-900/10 border border-gray-700 outline-4 outline-gray-700/20 focus:border-blue-600 focus:outline-blue-600/20"
                />
                <button
                  type="button"
                  className=" absolute right-0 p-2 max-sm:text-lg text-xl disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:text-red-600 transition-all cursor-pointer"
                  onClick={() => removeExtraField(key)}
                >
                  <CgClose />
                </button>
              </div>
            </div>
          ))}

          {/* Add new key-value field */}
          <button
            type="button"
            onClick={() => addExtraField(prompt("Enter field name") || "")}
            className=" absolute -top-3.5 -right-3.5 bg-gray-700/30 p-2 rounded-full shadow flex items-center justify-center text-gray-100 hover:text-blue-600 active:text-blue-600 cursor-pointer"
          >
            <GrChapterAdd />
          </button>
        </div>

        {/* FAQ */}
        <h2 className="my-3 font-medium font-poppins">FAQ</h2>
        <div className="grid grid-cols-1 gap-5 mb-8">
          {formData.questionAnswer.length > 0 &&
            formData.questionAnswer?.map((qa, i) => (
              <div
                key={i}
                className=" relative p-4 rounded-md border border-gray-700/50"
              >
                <div className="w-full relative flex flex-col rounded-md mt-2">
                  <label className="FormLabel">Question</label>
                  <textarea
                    type="text"
                    value={qa.question}
                    onChange={(e) =>
                      handleQuestionAnswerChange(i, "question", e.target.value)
                    }
                    className="w-full py-2 px-3 text-lg rounded-md bg-gray-900/10 border border-gray-700 outline-4 outline-gray-700/20 focus:border-blue-600 focus:outline-blue-600/20"
                  />
                </div>

                <div className=" w-full relative flex flex-col rounded-md mt-6 mb-2 ">
                  <label className="FormLabel">Answer</label>
                  <textarea
                    type="text"
                    value={qa.answer}
                    onChange={(e) =>
                      handleQuestionAnswerChange(i, "answer", e.target.value)
                    }
                    className="w-full py-2 px-3 text-lg rounded-md bg-gray-900/10 border border-gray-700 outline-4 outline-gray-700/20 focus:border-blue-600 focus:outline-blue-600/20"
                  />
                </div>

                {formData.questionAnswer.length - 1 === i && (
                  <button
                    type="button"
                    onClick={() =>
                      addExtraQAField(prompt("Enter field name") || "")
                    }
                    className=" absolute -top-3.5 -right-3.5 bg-gray-700/30 p-2 rounded-full shadow flex items-center justify-center text-gray-100 hover:text-blue-600 active:text-blue-600 cursor-pointer"
                  >
                    <GrChapterAdd />
                  </button>
                )}

                {formData.questionAnswer.length - 1 !== i && (
                  <button
                    type="button"
                    onClick={() => removeQAField(i)}
                    className=" absolute -top-3.5 -right-3.5 bg-gray-700/30 p-2 rounded-full shadow flex items-center justify-center text-gray-100 hover:text-red-500 active:text-red-500 cursor-pointer"
                  >
                    <CgClose />
                  </button>
                )}
              </div>
            ))}
        </div>

        {/* Image upload */}
        <h2 className="mt-8 font-medium font-poppins">Image uploads</h2>
        <div className=" w-full flex flex-row max-sm:flex-col items-center gap-4 mt-6">
          {/* Image upload */}
          <div className=" w-full flex ">
            <label
              htmlFor="image"
              className=" w-full p-3 rounded-md text-base font-semibold bg-gray-600/10 hover:bg-blue-600/10 hover:text-blue-600 cursor-pointer"
            >
              Upload Images +
            </label>
            <input
              type="file"
              name="images"
              id="image"
              accept="image/png, image/jpeg, image/webp"
              multiple
              className="hidden"
              onChange={(e) =>
                setFormData({ ...formData, images: Array.from(e.target.files) })
              }
            />
          </div>

          {/* Publish checkbox */}
          <div className=" w-full flex items-center justify-end gap-2 ">
            <label className=" p-2.5"> Published </label>
            <CustomCheckbox
              name={"status"}
              isChecked={formData.status === "Active"}
              toggleCheckbox={(e) => handleChange("status", e)}
              className={`size-6 bg-gray-900/10 ${
                formData.status
                  ? "text-blue-600 border-blue-600/30 ring-blue-600/10"
                  : "text-blue-50 border-gray-700 ring-gray-700/20"
              } `}
            />
          </div>
        </div>

        {/* Image files name previews */}
        <ol className=" w-full flex flex-wrap text-sm my-3 text-blue-600">
          {formData.images?.map((f, i) => {
            if ((i < 5) & !f.url) {
              return (
                <li key={i} className="px-0.5">
                  {f.name?.substring(0, 10)} - {f.type},
                </li>
              );
            }
          })}
        </ol>

        {/* Actions */}
        <div className=" flex flex-row flex-wrap gap-5 items-center justify-evenly mt-8 mb-4">
          <ShimmerButton
            disabled={isPending || isLoading}
            type={"button"}
            name={"Cancel"}
            className={
              " font-medium text-lg rounded-lg px-6 py-2 bg-red-600/10 text-red-600"
            }
            onClick={() => {
              cancel();
              setInitialData(null);
              setFormData({});
            }}
          />

          <ShimmerButton
            disabled={isPending || isLoading}
            type={"submit"}
            name={
              initialData ? (
                isLoading ? (
                  <>
                    <CgSpinner className=" animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Product"
                )
              ) : isPending ? (
                <>
                  <CgSpinner className=" animate-spin" /> Saving...
                </>
              ) : (
                "Save Product"
              )
            }
            className={
              "font-medium text-lg rounded-lg px-6 py-2 bg-blue-600/10 text-blue-600"
            }
          />
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
