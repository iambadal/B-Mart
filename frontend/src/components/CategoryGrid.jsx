import { useNavigate } from "react-router";
import { motion as Motion } from "motion/react";

const categories = [
  { id: 1, name: "Electronics", image: "/el.webp" },
  {
    id: 2,
    name: "Fashion",
    image: "/fs.webp",
  },
  { id: 3, name: "Home & Kitchen Item", image: "hk.webp" },
  {
    id: 4,
    name: "Grocery & Essentials",
    image: "gs.webp",
  },
];


const CategoryGrid = () => {

  const Navigate = useNavigate();

  return (
    <section className="category-section max-sm:px-3 px-6 py-8 bg-linear-to-b from-[#eef2ff] to-[#f4f4f8]">
      <h2 className="max-sm:text-xl text-2xl font-bold mb-4">
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-sm:gap-5 ">
        {categories.map((cat) => (
          <Motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{once: true}}
            key={cat.id}
            onClick={() => Navigate(`/category/${cat.name?.split(" ")[0]}`)}
            className="category-card relative left-1/2 -translate-x-1/2 w-fit h-fit p-2 text-center bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg active:shadow-lg"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className=" min-h-[150px] max-h-[250px] w-[200px] rounded-xl mb-2 object-center object-cover"
            />

            <p className="relative max-sm:text-sm text-base text-[#334e86] font-medium">
              {cat.name}
            </p>
          </Motion.div>
        ))}
      </div>
    </section>
  );
}

export default CategoryGrid
