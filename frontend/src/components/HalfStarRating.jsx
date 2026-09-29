import { useState } from "react";

const HalfStarRating = ({rating, setRating}) => {
  // const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (e, i) => {
    const starWidth = e.currentTarget.offsetWidth / 2; // half width of a star element...
    const insideHorizontalPosition = e.nativeEvent.offsetX; /// inside horizontal position of a star element div..
    // Calculate the mouse position is in left or right half.
    const half = insideHorizontalPosition < starWidth;
    // Set rating...
    const value = i + (half ? 0.5 : 1);
    setRating(value);
    setHoverRating(value);
  };

  const handleHover = (e, i) => {
    const half = e.nativeEvent.offsetX < e.currentTarget.offsetWidth / 2;
    const value = i + (half ? 0.5 : 1);
    setHoverRating(value);
  };

  return (
    <div className=" flex items-center gap-4">
      <p className="mt-2 text-4xl font-medium text-gray-800">
        {rating.toFixed(1)}
      </p>
      <div className="relative inline-block text-5xl cursor-pointer select-none">
        <div
          className="relative text-gray-300"
          style={{
            "--fill": `${((hoverRating || rating) / 5) * 100}%`,
          }}
        >
          <div
            className="absolute top-0 left-0 text-yellow-400 overflow-hidden"
            style={{ width: "var(--fill)" }}
          >
            ★★★★★
          </div>
          ★★★★★
        </div>

        <div className="absolute top-0 left-0 flex w-full h-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className=" relative flex-1"
              onClick={(e) => handleClick(e, i)}
              onMouseMove={(e) => handleHover(e, i)}
              onMouseLeave={() => setHoverRating(rating)}
            />
          ))}
        </div>
      </div>
      <input type="hidden" name="rating" value={rating.toFixed(1)} />
    </div>
  );
};

export default HalfStarRating;
