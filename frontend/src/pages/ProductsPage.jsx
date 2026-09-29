import { useParams } from "react-router";
import FilterSidebar from "../components/FilterSidebar";
import SortBy from "../components/SortBy";
import { TbFilterEdit } from "react-icons/tb";
import { BiSort } from "react-icons/bi";
import Navbar from "../components/Navbar";
import { useFetchInfiniteProducts } from "../Hooks/useProducts";
import { useAuth } from "../contexts/AuthContext";
import { lazy, Suspense, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "../Hooks/useDebounce";
import { CgSpinner, CgClose } from "react-icons/cg";
const ProductList = lazy(() => import("../components/ProductList"));

const ProductsPage = () => {
  const { cat: category, tag, sorted } = useParams();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: "",
    tags: [],
    category: [],
    price: [],
    rating: [],
    newArrival: [],
    inStock: [],
  });
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const debouncedSearchTerm = useDebounce(filters.search, 500); // search term...
  const [sort, setSort] = useState("-createdAt"); // sort

  const { ref, inView } = useInView();

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useFetchInfiniteProducts(
      { ...filters, search: debouncedSearchTerm },
      1, // page
      10, // limit
      sort,
      user?.role
    );

  // Handle search...
  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  // Auto-fetch more when scrolled into view.
  useEffect(() => {
    const nextPage = async () => {
      if (inView && hasNextPage) {
        await fetchNextPage();
      }
    };
    nextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (category) setFilters((prev) => ({ ...prev, category: [category] }));
    if (tag) setFilters((prev) => ({ ...prev, tags: [tag] }));
    if (sorted) setSort(decodeURIComponent(sorted));
  }, [category, tag, sorted]);

  return (
    <>
      <Navbar
        searchTerm={filters.search}
        setSearchTerm={(e) => handleSearch(e)}
      />
      <div className=" mt-18 min-h-screen w-full bg-gray-200">
        {/* Products */}
        <div className=" flex flex-row max-sm:flex-col gap-3 p-3 max-sm:p-2">
          {/* Filter */}
          <FilterSidebar
            selectedFilters={filters}
            setSelectedFilters={setFilters}
            showFilter={showFilter}
            setShowFilter={setShowFilter}
          />

          {/* Filter buttons for small devices */}
          <div className="hidden max-sm:flex flex-row justify-evenly items-center gap-4 p-2 rounded-md bg-white">
            <button
              className=" w-full flex items-center justify-center gap-1 border-r-2 border-gray-600/30 cursor-pointer"
              onClick={() => {
                setShowSort(!showSort);
                setShowFilter(false);
              }}
            >
              <BiSort size={20} /> Sort
            </button>
            <button
              className="w-full flex items-center justify-center gap-1 cursor-pointer"
              onClick={() => {
                setShowFilter(!showFilter);
                setShowSort(false);
              }}
            >
              <TbFilterEdit size={20} />
              Filter
            </button>
          </div>

          {/* Product lists */}
          <div className=" relative w-full bg-gray-50 flex-2 p-4 rounded-xl shadow">
            {/* Product sort */}
            <>
              <SortBy
                sortBy={sort}
                setSortBy={setSort}
                showSort={showSort}
                setShowSort={setShowSort}
              />
            </>

            {/* Product lists */}
            {(() => {
              const seenProductIds = new Set();
              return data.pages.map((page, idx) => {
                const uniqueItems = (page.items || []).filter((product) => {
                  if (seenProductIds.has(product._id)) return false;
                  seenProductIds.add(product._id);
                  return true;
                });
                return (
                  <Suspense fallback={<p>loading...</p>} key={idx}>
                    <ProductList products={{ ...page, items: uniqueItems }} />
                  </Suspense>
                );
              });
            })()}

            <div
              ref={ref}
              className=" flex justify-center items-center text-center text-base"
            >
              {isFetchingNextPage && (
                <CgSpinner size={24} className=" animate-spin" />
              )}
              {!hasNextPage && (
                <p className="text-sm text-gray-600 animate-pulse">
                  {`Total ~ ${data.pages[0]?.total}, No more products !`}{" "}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
