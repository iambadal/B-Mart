const ShimmerButton = ({ disabled, type, name, className, onClick  }) => {
  return (
    <button
      type={type || "button"}
      disabled={disabled || false}
      className={` relative overflow-hidden max-w-52 max-h-12 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 text-center ring transition-all duration-300 ease-out group cursor-pointer ${className} `}
      onClick={onClick}
    >
      <span
        className={` bg-current opacity-30 absolute right-0 -mt-6 h-20 w-8 translate-x-12 rotate-12 blur-md transition-all duration-1000 ease-out group-hover:-translate-x-50 `}
      ></span>
      {name}
    </button>
  );
};

export default ShimmerButton;
