import { useState } from "react";
import BannerForm from "../../components/admin/BannerForm";
import Select from "../../components/CustomSelect";
import Checkbox from "../../components/CustomCheckbox";
import SearchBar from "../../components/admin/SearchBar";
import { useOutletContext } from "react-router";
import { useDebounce } from "../../Hooks/useDebounce";
import useSelection from "../../Hooks/useSelection";
import { useAuth } from "../../contexts/AuthContext";
import ShimmerButton from "../../components/ShimmerButton";
import { CgSpinner } from "react-icons/cg";
import { BiSolidAddToQueue, BiEdit } from "react-icons/bi";
import Table from "../../components/admin/Table";
import { useEffect } from "react";
import { useDeleteBanners, useFetchBannersList } from "../../Hooks/useAdmin";

const BannerList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showBannerForm, setShowBannerForm] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  const [page, setPage] = useState(1); // current page number
  const [limit, setLimit] = useState(5); // item per page
  const [totalPages, setTotalPages] = useState(1); // total page
  const [bulkAction, setBulkAction] = useState("");
  const [bannerLists, setBannerLists] = useState([]);
  const [isOpen, setIsConfirm] = useOutletContext();
  const [initialData, setInitialData] = useState(null);
  const {
    selected,
    selectAll,
    setSelected,
    setSelectAll,
    handleSelectAll,
    handleSelectOne,
  } = useSelection();
  const { accessToken } = useAuth();

  const {
    data: banners,
    isFetched,
    isFetching,
  } = useFetchBannersList(debouncedSearchTerm, page, limit, "", accessToken);

  const { mutateAsync: deleteBanners, isPending: isDeleting } =
    useDeleteBanners();

  // Handle bulk action
  const handleBulkAction = async () => {
    if (bulkAction === "delete") {
      setIsConfirm({
        showModel: true,
        action: async () => {
          await deleteBanners({ accessToken, ids: selected });
          setSelectAll(false);
          setSelected([]);
        },
      });
    }
  };

  // Set orders...
  useEffect(() => {
    if (isFetched) {
      setBannerLists(banners?.items);
      setTotalPages(banners?.totalPages);
    }
  }, [banners, isFetched]);

  // Reset page when user changes filters (so you go back to page 1)
  useEffect(() => setPage(1), [searchTerm, limit]);

  return (
    <>
      <div className=" w-full max-sm:min-h-[800px] min-h-[400px]  h-full text-blue-100">
        {/* search + filters */}
        <div className="w-full flex max-md:flex-col items-center justify-between max-sm:gap-8 gap-30 mb-6">
          <SearchBar
            className={"w-full max-w-2xl"}
            searchTerm={searchTerm}
            handleSearch={(value) => setSearchTerm(value)}
            placeholder={"Search by Title, Banner ID"}
          />
          <button
            className=" w-fit inline-flex items-center justify-center gap-2 py-2 px-2.5 rounded-md bg-violet-700 transition hover:bg-violet-800 cursor-pointer"
            onClick={() => setShowBannerForm(true)}
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
          {!isFetching && (
            <Table
              columns={["Banner", "Banner ID", "Title", "Date", "Actions"]}
              checkbox={
                <Checkbox
                  name={"selectAll"}
                  isChecked={selectAll}
                  toggleCheckbox={() => handleSelectAll(bannerLists)}
                  className={`size-5 bg-gray-900/10 ${
                    selectAll
                      ? "text-violet-600 border-violet-600/20 ring-violet-600/10"
                      : "text-blue-50 border-gray-700 ring-gray-700/20"
                  }`}
                />
              }
              rows={bannerLists}
              renderRows={(bannerList, idx, ref) => (
                <tr
                  key={bannerList._id || idx}
                  ref={ref}
                  className="text-center border-t border-gray-600/60"
                >
                  <td className="p-4">
                    <Checkbox
                      className={`size-5 bg-gray-900/10 ${
                        selected.includes(bannerList._id)
                          ? "text-violet-600 border-violet-600/20 ring-violet-600/10"
                          : "text-gray-50 border-gray-700 ring-gray-700/20"
                      }`}
                      isChecked={selected.includes(bannerList._id)}
                      toggleCheckbox={() => handleSelectOne(bannerList._id)}
                    />
                  </td>
                  <td>
                    <img
                      src={
                        bannerList?.banner?.url
                          ?.replace(/^http:\/\//i, "https://")
                          ?.replace("/upload/", "/upload/f_auto,q_auto/") ||
                        "/no-image.png"
                      }
                      alt={bannerList?.title}
                      className="w-25 h-12 object-center object-scale-down mx-auto"
                    />
                  </td>
                  <td className="p-4">{bannerList?._id}</td>
                  <td>{bannerList?.title}</td>
                  <td>{bannerList?.createdAt?.split("T")[0]}</td>

                  <td className="p-4 relative">
                    <button
                      className="hover:bg-blue-600/10 text-blue-600 p-1.5 rounded-full mr-2 transition cursor-pointer"
                      onClick={() => {
                        setInitialData(bannerList);
                        setShowBannerForm(true);
                      }}
                    >
                      <BiEdit size={24} />
                    </button>
                  </td>
                </tr>
              )}
            />
          )}
        </div>

        {/* Bulk action */}
        <div className=" flex justify-between max-sm:items-center max-sm:flex-col gap-5 mb-6">
          <div className=" w-full sm:w-[300px] flex flex-row max-sm:flex-col gap-5">
            <Select
              selected={bulkAction || "Bulk Actions"}
              handleSelect={(value) => setBulkAction(value)}
              options={[{ value: "delete", label: "Delete Banners" }]}
              className={
                " w-full py-2.5 px-3 gap-3 bg-gray-800/80 text-blue-100"
              }
              bottom={false}
              hoverStyle={"hover:bg-violet-600/90"}
            />
            <button
              disabled={Boolean(!selected.length) || isFetching || isDeleting}
              className=" disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2.5 px-6 font-medium font-funnel rounded-md bg-violet-600/90 transition hover:bg-violet-700 cursor-pointer"
              onClick={() => handleBulkAction()}
            >
              {isDeleting || isDeleting ? (
                <CgSpinner className=" animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {/* Pages count */}
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

        {/* Page selection */}
        <div className=" flex items-center justify-between mb-4">
          <label className=" flex items-center gap-2.5 max-sm:text-sm">
            <Checkbox
              name={"selectAll"}
              isChecked={selectAll}
              toggleCheckbox={() => handleSelectAll(bannerLists)}
              className={`size-5 bg-gray-900/10 ${
                selectAll
                  ? "text-violet-600 border-violet-600/20 ring-violet-600/10"
                  : "text-gray-50 border-gray-700 ring-gray-700/20"
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
              hoverStyle={"hover:bg-violet-600/90"}
            />
          </div>
        </div>
      </div>
      {showBannerForm && (
        <BannerForm
          cancel={() => setShowBannerForm(false)}
          initialData={initialData}
          setInitialData={setInitialData}
        />
      )}
    </>
  );
};

export default BannerList;
