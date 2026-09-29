import { TiWarning } from "react-icons/ti";
import { motion as Motion } from "motion/react";

const ConfirmModel = ({ confirm, cancel }) => {
  return (
    <section className=" absolute top-0 left-0 min-h-screen w-full flex justify-center items-center z-50 text-gray-100 bg-red-50/10 backdrop-blur ">
      <Motion.div
        initial={{
          opacity: 1,
          scale: 0,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{ duration: 0.25, bounce: 500, ease: "easeInOut" }}
        className=" bg-gray-700 rounded-3xl max-w-80 p-6 shadow-2xs flex flex-col items-center"
      >
        <div className=" p-1 rounded-full ring-2 ring-red-400/50 ring-offset-1 mb-4 bg-rose-500">
          <TiWarning size={30} />
        </div>
        <h1 className="mb-2 text-lg font-semibold">Are you sure?</h1>
        <p className="mb-10 text-base text-center">
          The action can't be undone. Please confirm if you want to proceed.
        </p>
        <div className=" flex flex-row justify-center items-center gap-4">
          <button
            className="px-8 py-2 ring-1 ring-inset rounded-2xl cursor-pointer"
            onClick={cancel}
          >
            Cancel
          </button>
          <button
            className="px-8 py-2 text-white bg-rose-600 rounded-2xl transition hover:bg-rose-700 active:bg-rose-700 cursor-pointer"
            onClick={confirm}
          >
            Confirm
          </button>
        </div>
      </Motion.div>
    </section>
  );
};

export default ConfirmModel;
