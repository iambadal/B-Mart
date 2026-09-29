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

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={(e) => setSearchTerm(e.target.value)} content={searchedProduct} searchContent={true}/>
      <Sidebar />
      <HeroBanner />
      <CategoryGrid />
      <div id="featured">
        <ProductList title="Featured Products" />
      </div>
      <ProductList title="New Arrivals" newProduct={true} />
      <Footer />
    </>
  );
}
