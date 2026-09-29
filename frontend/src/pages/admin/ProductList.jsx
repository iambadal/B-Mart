import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import SearchBar from "../../components/admin/SearchBar";
import Table from "../../components/admin/Table";
import Select from "../../components/CustomSelect";
import Checkbox from "../../components/CustomCheckbox";
import { BiSolidAddToQueue, BiEdit } from "react-icons/bi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { CgSpinner } from "react-icons/cg";
import ShimmerButton from "../../components/ShimmerButton";
import ProductForm from "../../components/admin/ProductForm";
import { useDebounce } from "../../Hooks/useDebounce";
import {
  useDeleteProduct,
  useDeleteProductMany,
  useFetchProduct,
  useUpdateProductStatus,
} from "../../Hooks/useProducts";
import { useAuth } from "../../contexts/AuthContext";
import useSelection from "../../Hooks/useSelection";

const ProductList = () => {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    published: false,
    unPublished: false,
    lowStock: false,
    minPrice: "",
    maxPrice: "",
    inStock: false,
  });

  const debouncedSearchTerm = useDebounce(filters.search, 500); // 500ms delay
  const [page, setPage] = useState(1); // current page number
  const [limit, setLimit] = useState(5); // item per page
  const [totalPages, setTotalPages] = useState(1); // total page
  const [bulkAction, setBulkAction] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [isOpen, setIsConfirm] = useOutletContext();
  const {
    selected,
    selectAll,
    setSelected,
    setSelectAll,
    handleSelectAll,
    handleSelectOne,
  } = useSelection();
  const sort = "price,-rating";

  const { user, accessToken } = useAuth();

  const CheckboxFilter = [
    {
      id: 1,
      name: "published",
      filter: "Published",
    },
    {
      id: 2,
      name: "unPublished",
      filter: "Unpublished",
    },
    {
      id: 3,
      name: "lowStock",
      filter: "Low Stock (< 10)",
    },
  ];

  const { data, isLoading } = useFetchProduct(
    { ...filters, search: debouncedSearchTerm },
    page,
    limit,
    sort,
    user.role
  );

  const { mutate: deleteOne, isPending } = useDeleteProduct();
  const { mutate: deleteMany, isPending: bulkDeleting } =
    useDeleteProductMany();
  const { mutate: updateStatus, isPending: statusChanging } =
    useUpdateProductStatus();

  // Search
  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };
  // Category
  const handleCategory = (value) => {
    setFilters((prev) => ({ ...prev, category: value }));
  };

  // Filter checkbox
  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: !prev[e.target.name],
    }));
  };

  // Handle  single delete
  const handleDelete = (id) => {
    setIsConfirm({
      showModel: true,
      action: () => deleteOne({ accessToken, productId: id }),
    });
  };

  // Handle bulk action
  const handleBulkAction = () => {
    if (bulkAction === "Published") {
      updateStatus({ accessToken, ids: selected, status: "Active" });
      setSelectAll(false);
      setSelected([]);
    }
    if (bulkAction === "Unpublished") {
      updateStatus({ accessToken, ids: selected, status: "Inactive" });
      setSelectAll(false);
      setSelected([]);
    }
    if (bulkAction === "Delete") {
      setIsConfirm({
        showModel: true,
        action: () => {
          deleteMany({ accessToken, ids: selected });
          setSelectAll(false);
          setSelected([]);
        },
      });
    }
  };

  // Set products
  useEffect(() => {
    setProducts(data?.items);
    setTotalPages(data?.totalPages);
  }, [data]);

  // Reset page when user changes filters (so you go back to page 1)
  useEffect(
    () => setPage(1),
    [
      filters.search,
      filters.category,
      filters.published,
      filters.unPublished,
      filters.lowStock,
      filters.minPrice,
      filters.maxPrice,
      limit,
    ]
  );

  // if (isLoading) return <Loader/>;
  // if (isError) return <p>Error loading products</p>;

  return (
    <>
      <div className=" w-full h-full  text-blue-100">
        {/* search + filters */}
        <div className="w-full flex max-md:flex-col items-center gap-10 max-md:gap-5 mb-6">
          <SearchBar
            className={"w-full"}
            searchTerm={filters.search}
            handleSearch={(value) => handleSearch(value)}
            placeholder={"Search by Name, Category, SKU"}
          />
          <Select
            selected={filters.category || "Category"}
            handleSelect={(value) => handleCategory(value)}
            options={[
              { value: "Electronics", label: "Electronics" },
              { value: "Fashion", label: "Fashion" },
              { value: "Home", label: "Home" },
              { value: "Grocery", label: "Grocery" },
            ]}
            className={" w-full py-2.5 px-3 bg-gray-800/80 text-blue-100"}
            hoverStyle={"hover:bg-blue-600/80"}
          />
        </div>

        {/* Filters checkbox */}
        <div className=" flex max-md:flex-col justify-between gap-5 mb-6">
          <div className=" flex max-sm:flex-col gap-5 text-lg max-md:text-base ">
            {CheckboxFilter.map((item) => (
              <label key={item.id} className="flex items-center gap-2.5">
                {item.filter}
                <Checkbox
                  name={item.name}
                  className={`size-5 bg-gray-900/10 ${
                    filters[item.name]
                      ? "text-blue-600 border-blue-600/20 ring-blue-600/10"
                      : "text-gray-50 border-gray-700 ring-gray-700/20"
                  }`}
                  isChecked={Boolean(filters[item.name])}
                  toggleCheckbox={handleFilterChange}
                />
              </label>
            ))}
          </div>
          <button
            className="flex flex-row items-center justify-center gap-2 py-2 px-2.5 rounded-md bg-blue-700 transition hover:bg-blue-800 cursor-pointer"
            onClick={() => setShowForm(true)}
          >
            Add Product <BiSolidAddToQueue size={24} />
          </button>
        </div>

        {/* Table */}
        <div
          className={`${
            isOpen
              ? "max-md:w-[calc(100vw-30px)] w-[calc(100vw-290px)]"
              : " w-[calc(100vw-95px)]"
          } overflow-x-auto p-2 mb-6`}
        >
          {!isLoading && (
            <Table
              columns={[
                "Image",
                "Product Name",
                "SKU",
                "Category",
                "Price",
                "Stock",
                "Rating",
                "Reviews",
                "Created",
                "Status",
                "Actions",
              ]}
              checkbox={
                <Checkbox
                  name={"selectAll"}
                  isChecked={selectAll}
                  toggleCheckbox={() => handleSelectAll(products)}
                  className={`size-5 bg-gray-900/10 ${
                    selectAll
                      ? "text-blue-600 border-blue-600/20 ring-blue-600/10"
                      : "text-blue-50 border-gray-700 ring-gray-700/20"
                  }`}
                />
              }
              rows={products || []}
              renderRows={(product, idx, ref) => (
                <tr
                  key={product._id || idx}
                  ref={ref}
                  className="text-center border-t border-gray-600/60"
                >
                  <td className="p-4">
                    <Checkbox
                      className={`size-5 bg-gray-900/10 ${
                        selected.includes(product._id)
                          ? "text-blue-600 border-blue-600/20 ring-blue-600/10"
                          : "text-blue-50 border-gray-700 ring-gray-700/20"
                      }`}
                      isChecked={selected.includes(product._id)}
                      toggleCheckbox={() => handleSelectOne(product._id)}
                    />
                  </td>
                  <td>
                    <img
                      src={
                        product.images[0]?.url
                          ?.replace(/^http:\/\//i, "https://")
                          ?.replace("/upload/", "/upload/f_auto,q_auto/") ||
                        "/no-image.png"
                      }
                      alt={product.productName}
                      className="w-12 h-12 object-center object-scale-down mx-auto"
                    />
                  </td>
                  <td>{product.name?.slice(0, 14)}</td>
                  <td>{product.sku}</td>
                  <td>{product.category}</td>
                  <td>₹{product.price}</td>
                  <td>{product.stock}</td>
                  <td>{Math.round((product.rating * 2) / 2)} ⭐</td>
                  <td>{product.reviews?.length}</td>
                  <td>{product.createdAt?.split("T")[0]}</td>
                  <td
                    className={
                      product.status === "Active"
                        ? "text-lime-600"
                        : "text-orange-600"
                    }
                  >
                    {product.status}
                  </td>
                  <td className="p-4">
                    <button
                      className="hover:bg-blue-600/10 text-blue-600 p-1.5 rounded-full mr-2 transition cursor-pointer"
                      onClick={() => {
                        setInitialData(product);
                        setShowForm(true);
                      }}
                    >
                      <BiEdit size={24} />
                    </button>
                    <button
                      className="hover:bg-rose-600/10 text-rose-600 p-1.5 rounded-full transition cursor-pointer "
                      onClick={() => handleDelete(product._id)}
                    >
                      {isPending ? (
                        <CgSpinner size={24} className=" animate-spin" />
                      ) : (
                        <MdOutlineDeleteOutline size={24} />
                      )}
                    </button>
                  </td>
                </tr>
              )}
            />
          )}
        </div>

        {/* Page selection */}
        <div className=" flex justify-between max-sm:items-center max-sm:flex-col gap-5 mb-6">
          <div className=" w-full sm:w-[300px] flex flex-row max-sm:flex-col gap-5">
            <Select
              selected={bulkAction || "Bulk Actions"}
              handleSelect={(value) => setBulkAction(value)}
              options={[
                { value: "Published", label: "Published" },
                { value: "Unpublished", label: "Unpublished" },
                { value: "Delete", label: "Delete" },
              ]}
              className={
                " w-full py-2.5 px-3 gap-3 bg-gray-800/80 text-blue-100"
              }
              bottom={false}
              hoverStyle={"hover:bg-blue-600/90"}
            />
            <button
              disabled={Boolean(!selected.length) || statusChanging}
              className=" disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2.5 px-6 font-medium font-funnel rounded-md bg-blue-600/90 transition hover:bg-blue-700 cursor-pointer"
              onClick={() => handleBulkAction()}
            >
              {bulkDeleting || statusChanging ? (
                <CgSpinner className=" animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          <div className="flex items-center max-sm:text-xs ">
            <ShimmerButton
              disabled={page === 1}
              name={"< Prev"}
              className={
                "h-8 p-2 mr-3 rounded-md bg-gray-600/10 text-gray-600/60"
              }
              onClick={() => setPage(page - 1)}
            />
            <ShimmerButton
              name={1}
              className={
                " size-8 max-sm:size-6 p-2 mx-0.5 justify-center rounded-l-md bg-gray-600/10 text-gray-600/60"
              }
              onClick={() => setPage(1)}
            />
            <ShimmerButton
              name={page}
              className={
                "size-8 max-sm:size-6 p-2 mx-0.5 justify-center bg-gray-600/10 text-gray-600/60"
              }
            />
            <ShimmerButton
              name={totalPages}
              className={
                "size-8 max-sm:size-6 p-2 mx-0.5 justify-center rounded-r-md bg-gray-600/10 text-gray-600"
              }
            />
            <ShimmerButton
              disabled={page === totalPages}
              name={"Next >"}
              className={"h-8 p-2 ml-3 rounded-md bg-gray-600/10 text-gray-600"}
              onClick={() => setPage(page + 1)}
            />
          </div>
        </div>

        <div className=" flex items-center justify-between mb-4">
          <label className=" flex items-center gap-2.5 max-sm:text-sm">
            <Checkbox
              name={"selectAll"}
              isChecked={selectAll}
              toggleCheckbox={() => handleSelectAll(products)}
              className={`size-5 bg-gray-900/10 ${
                selectAll
                  ? "text-blue-600 border-blue-600/20 ring-blue-600/10"
                  : "text-blue-50 border-gray-700 ring-gray-700/20"
              }`}
            />
            Select All
          </label>

          <div className=" max-sm:text-sm ">
            <Select
              selected={`Show ${limit}`}
              handleSelect={(value) => setLimit(value)}
              options={[
                { value: 10, label: "Page 10" },
                { value: 20, label: "Page 20" },
                { value: 30, label: "Page 30" },
              ]}
              className={" py-2.5 px-3 gap-2 text-blue-100"}
              bottom={false}
              hoverStyle={"hover:bg-blue-600/90"}
            />
          </div>
        </div>
      </div>

      {showForm && (
        <ProductForm
          cancel={() => setShowForm(false)}
          initialData={initialData}
          setInitialData={() => setInitialData(null)}
        />
      )}
    </>
  );
};

export default ProductList;
