// components/ProductList.jsx
import { useAuth } from "../contexts/AuthContext";
import { useFetchProduct } from "../Hooks/useProducts";
import ProductCard from "./ProductCard";
import { motion as Motion } from "motion/react";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15, // delay between cards
    },
  },
};

const ProductList = ({ title, products = null, newProduct }) => {
  const { user } = useAuth();

  const { data: productData } = useFetchProduct(
    {},
    0,
    10,
    newProduct ? "" : "-rating,-numReviews",
    user?.role,
    !products
  );

  return (
    <section className=" max-sm:px-3 max-sm:py-4 px-6 py-8 ">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className=" w-full flex items-center justify-center">
        <Motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10 max-sm:gap-5"
        >
          {products
            ? [...new Map((products.items || []).map((p) => [p._id, p])).values()]?.map((p) => (
                <ProductCard key={p._id} product={p} newProduct={newProduct} />
              ))
            : productData.items?.length > 0 &&
              [...new Map(productData.items.map((p) => [p._id, p])).values()]?.map((p) => (
                <ProductCard key={p._id} product={p} newProduct={newProduct} />
              ))}
        </Motion.div>
      </div>
    </section>
  );
};

export default ProductList;
