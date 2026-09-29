import { useState } from "react";
import ShimmerButton from "../ShimmerButton";
import { CgSpinner } from "react-icons/cg";
import Select from "../../components/CustomSelect";
import { useEffect } from "react";
import { useCreateBanner, useUpdateBanner } from "../../Hooks/useAdmin";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "d9-toast";

const BannerForm = ({ initialData = null, setInitialData, cancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "",
    banner: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const { mutateAsync: updateBanner, isPending: isUpdating } =
    useUpdateBanner();
  const { mutateAsync: createBanner, isPending: isCreating } =
    useCreateBanner();
  const { accessToken } = useAuth();
  const { showToast } = useToast();

  // Fill the form when editing mode.
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      setImagePreview(initialData.banner?.url);
    }
  }, [initialData]);

  // Handle image change.
  const handleFileChange = (e) => {
    const IMG = e.target.files[0];
    setFormData((prev) => ({ ...prev, banner: IMG }));
    // Set preview url
    const objURL = URL.createObjectURL(IMG);
    setImagePreview(objURL);
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newForm = new FormData();
    newForm.append("title", formData.title);
    newForm.append("subtitle", formData.subtitle);
    newForm.append("category", formData.category);
    if (formData.banner) newForm.append("banner", formData.banner);
    if (formData.public_id) newForm.append("public_id", formData.public_id);
    if (initialData) {
      const id = formData._id;
      await updateBanner(
        { fd: newForm, accessToken, id },
        {
          onSuccess: () => {
            showToast({
              message: "Banner is successfully updated.",
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
            setImagePreview("");
            cancel();
          },
          onError: () => {
            showToast({
              message: "Banner update error!",
              type: "error",
              theme: "dark",
              duration: 3000,
              closable: true,
              progress: true,
              pauseOnHover: true,
              pauseOnFocusLoss: true,
            });
            setInitialData(null);
            setFormData({});
            setImagePreview("");
            cancel();
          },
        }
      );
    } else {
      await createBanner(
        { fd: newForm, accessToken },
        {
          onSuccess: (result) => {
            showToast({
              message:
                result.status === "success"
                  ? "Banner is successfully created."
                  : "Please upload a image!",
              type: result.status === "success" ? "success" : "warning",
              theme: "dark",
              duration: 3000,
              closable: true,
              progress: true,
              pauseOnHover: true,
              pauseOnFocusLoss: true,
            });
            setFormData({});
            setImagePreview("");
            cancel();
          },
          onError: () => {
            showToast({
              message: "Banner create error!",
              type: "error",
              theme: "dark",
              duration: 3000,
              closable: true,
              progress: true,
              pauseOnHover: true,
              pauseOnFocusLoss: true,
            });
            setFormData({});
            setImagePreview("");
            cancel();
          },
        }
      );
    }
  };

  // Revoke objURL,
  useEffect(() => {
    return () => imagePreview && URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  return (
    <div className=" fixed top-0 left-0 h-screen w-full z-50 p-3 backdrop-blur-2xl max-sm:bg-gray-950 bg-gray-950/80 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className=" relative w-full max-w-3xl mx-auto my-10 space-y-2 rounded-3xl p-5 bg-gray-800/10 text-gray-50 shadow-xl ring-2 ring-gray-600/20"
      >
        <h2 className="text-xl font-bold mb-6">
          {initialData ? "Edit Banner" : "Add New Banner"}
        </h2>

        {/* banner title */}
        <div className=" FormDiv mb-8">
          <label htmlFor="title" className="FormLabel ">
            Banner Title
          </label>
          <input
            className="FormInput"
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            required
          />
        </div>

        {/* banner subtitle */}
        <div className=" FormDiv mb-8">
          <label htmlFor="subtitle" className="FormLabel">
            Subtitle
          </label>
          <input
            className="FormInput"
            name="subtitle"
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
            }
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

        {/* Image upload */}
        <h2 className="mt-8 font-medium font-poppins">Banner Image</h2>

        <div className=" w-full flex flex-col items-center  gap-4 mt-6">
          {/* preview */}

          {imagePreview && (
            <div className=" w-full h-20 p-2 border border-gray-700 outline-4 outline-gray-700/20 rounded-md ">
              <img
                src={imagePreview}
                alt="banner"
                loading="lazy"
                className="w-full h-full rounded-md object-center object-contain"
              />
            </div>
          )}

          <div className=" w-full flex justify-center items-center">
            <label
              htmlFor="banner"
              className=" w-full text-center p-3 rounded-md text-base font-semibold bg-gray-600/10 hover:bg-blue-600/10 hover:text-blue-600 cursor-pointer"
            >
              Upload Image
            </label>
            <input
              type="file"
              name="banner"
              id="banner"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Actions */}
        <div className=" flex flex-row flex-wrap gap-5 items-center justify-evenly mt-8 mb-4">
          <ShimmerButton
            disabled={isUpdating || isCreating}
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
            disabled={isUpdating || isCreating}
            type={"submit"}
            name={
              initialData ? (
                isUpdating ? (
                  <>
                    <CgSpinner className=" animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Banner"
                )
              ) : isCreating ? (
                <>
                  <CgSpinner className=" animate-spin" /> Saving...
                </>
              ) : (
                "Save Banner"
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

export default BannerForm;
