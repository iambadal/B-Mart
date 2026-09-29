import React, { useState } from "react";
import HalfStarRating from "./HalfStarRating";
import { CgSpinner, CgClose } from "react-icons/cg";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "d9-toast";
import { motion as Motion, AnimatePresence } from "motion/react";
import { useAddUserProductReviews } from "../Hooks/useUser";

const ProductRating = ({ productId, close }) => {
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const { mutateAsync: addReviews, isPending } = useAddUserProductReviews();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", comment);
    formData.append("title", title);
    await addReviews(
      { formData, accessToken, productId },
      {
        onSuccess: (result) => {
          if (result.status === "success") {
            showToast({
              message: result?.message,
              type: "success",
              theme: "light",
              duration: 4000,
              closable: true,
              progress: true,
              pauseOnHover: true,
              pauseOnFocusLoss: true,
            });
          }
          setRating(0);
          setComment("");
          close();
        },
      }
    );
  };

  return (
    <AnimatePresence mode="wait">
      <Motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: "easeInOut" }}
        exit={{ opacity: 0, scale: 0.85 }}
        className=" w-full max-w-xl min-w-80 fixed top-1/6 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-gray-500/5 px-4 py-2 shadow-2xl bg-white"
      >
        <h1 className="flex items-center justify-between text-xl font-medium my-2">
          Add Rating & Review
          <button
            className=" hover:text-red-500 active:text-red-500 cursor-pointer"
            onClick={close}
          >
            <CgClose />
          </button>
        </h1>
        <form
          className=" flex flex-col justify-center items-center space-y-3 my-6"
          onSubmit={handleSubmit}
        >
          <label className=""> Add your rating</label>
          <HalfStarRating rating={rating} setRating={setRating} />
          <label className="self-start">Title</label>
          <input
            className="w-full py-2 px-3 text-base rounded-md border border-gray-600/50 outline-4 outline-gray-700/10 focus:border-yellow-600 focus:outline-yellow-600/20"
            type="text"
            name="title"
            value={title}
            placeholder="Add a title"
            required
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="self-start">Review</label>
          <textarea
            name="comment"
            id="comment"
            className="w-full h-20 py-2 px-3 text-base rounded-md border border-gray-600/50 outline-4 outline-gray-700/10 focus:border-yellow-600 focus:outline-yellow-600/20"
            value={comment}
            placeholder="Add a review..."
            required
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
          <button
            disabled={isPending}
            type="submit"
            className=" min-w-32 p-2 mt-4 flex items-center justify-center gap-2 text-lg bg-amber-500/70 text-amber-50 rounded-md hover:bg-amber-500/80 cursor-pointer"
          >
            {isPending ? (
              <>
                <CgSpinner className=" animate-spin" /> Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </Motion.div>
    </AnimatePresence>
  );
};

export default ProductRating;
