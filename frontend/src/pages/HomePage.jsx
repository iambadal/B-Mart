import Navbar from "../components/Navbar";
import HeroBanner from "../components/HeroBanner";
import CategoryGrid from "../components/CategoryGrid";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useFetchProduct } from "../Hooks/useProducts";
import { useState } from "react";
import { useDebounce } from "../Hooks/useDebounce";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { user } = useAuth();

  const { data: searchedProduct } = useFetchProduct(
    { search: debouncedSearchTerm },
    0,
    6,
    "",
    user?.role
  );
  const { data: featuredProducts } = useFetchProduct({}, 0, 20, "-rating,-numReviews", user?.role);
  const { data: newProducts } = useFetchProduct({}, 0, 30, "-createdAt", user?.role);
  const featuredIds = new Set((featuredProducts?.items || []).slice(0, 10).map((product) => product._id));
  const distinctNewProducts = (newProducts?.items || []).filter((product) => !featuredIds.has(product._id)).slice(0, 10);

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={(e) => setSearchTerm(e.target.value)} content={searchedProduct} searchContent={true}/>
      <Sidebar />
      <HeroBanner />
      <CategoryGrid />
      <div id="featured">
        <ProductList title="Featured Products" products={{ items: (featuredProducts?.items || []).slice(0, 10) }} />
      </div>
      <ProductList title="New Arrivals" newProduct={true} products={{ items: distinctNewProducts }} />
      <Footer />
    </>
  );
}
