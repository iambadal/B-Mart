import React, { useEffect, useState } from "react";
import SearchBar from "../../components/admin/SearchBar";
import Select from "../../components/CustomSelect";
import { useAuth } from "../../contexts/AuthContext";
import useSelection from "../../Hooks/useSelection";
import { useOutletContext } from "react-router";
import ShimmerButton from "../../components/ShimmerButton";
import Checkbox from "../../components/CustomCheckbox";
import { CgSpinner, CgClose } from "react-icons/cg";
import Table from "../../components/admin/Table";
import {
  useDeleteOrders,
  useFetchOrders,
  useUpdateOrders,
} from "../../Hooks/useOrders";
import { useDebounce } from "../../Hooks/useDebounce";
import { BiEdit } from "react-icons/bi";

const OrderList = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });
  const debouncedSearchTerm = useDebounce(filters.search, 500); // 500ms delay
  const [page, setPage] = useState(1); // current page number
  const [limit, setLimit] = useState(5); // item per page
  const [totalPages, setTotalPages] = useState(1); // total page
  const [bulkAction, setBulkAction] = useState("");
  const [orders, setOrders] = useState([]);
  const [isOpen, setIsConfirm] = useOutletContext();
  const [orderStatus, setOrderStatus] = useState("");
  const [notes, setNotes] = useState("");
  const {
    selected,
    selectAll,
    setSelected,
    setSelectAll,
    handleSelectAll,
    handleSelectOne,
  } = useSelection();

  const { accessToken } = useAuth();
  const { data, isLoading } = useFetchOrders(
    { ...filters, search: debouncedSearchTerm },
    page,
    limit,
    "",
    accessToken
  );
  const { mutateAsync: updateStatus, isPending } = useUpdateOrders();
  const { mutateAsync: deleteOrders, isPending: isDeleting } =
    useDeleteOrders();

  // Handle bulk action
  const handleBulkAction = async () => {
    if (bulkAction === "delivered" || bulkAction === "cancelled") {
      await updateStatus({ accessToken, ids: selected, status: bulkAction });
      setSelectAll(false);
      setSelected([]);
    }

    if (bulkAction === "delete") {
      setIsConfirm({
        showModel: true,
        action: async () => {
          await deleteOrders({ accessToken, ids: selected });
          setSelectAll(false);
          setSelected([]);
        },
      });
    }
  };

  // Set orders...
  useEffect(() => {
    setOrders(data?.items);
    setTotalPages(data?.totalPages);
  }, [data]);

  // Reset page when user changes filters (so you go back to page 1)
  useEffect(() => setPage(1), [filters.search, filters.status, limit]);

  return (
    <>
      <div className=" w-full max-sm:min-h-[800px] min-h-[400px]  h-full text-blue-100">
        {/* search + filters */}
        <div className="w-full flex max-md:flex-col items-center max-sm:gap-8 gap-30 mb-6">
          <SearchBar
            className={"w-full"}
            searchTerm={filters.search}
            handleSearch={(value) =>
              setFilters((prev) => ({ ...prev, search: value }))
            }
            placeholder={"Search by Name, Order ID, Payment ID"}
          />
          <Select
            selected={filters.status || "Status"}
            handleSelect={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            options={[
              { value: "Pending", label: "Pending" },
              { value: "Processing", label: "Processing" },
              { value: "Paid", label: "Paid" },
              { value: "Shipped", label: "Shipped" },
              { value: "Delivered", label: "Delivered" },
              { value: "Cancelled", label: "Cancelled" },
              { value: "Refunded", label: "Refunded" },
            ]}
            className={" w-full py-2.5 px-3 bg-gray-800/80 text-blue-100"}
            hoverStyle={"hover:bg-green-600/80"}
          />
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
                "Order ID",
                "Customer",
                "Date",
                "Amount",
                "Status",
                "Actions",
              ]}
              checkbox={
                <Checkbox
                  name={"selectAll"}
                  isChecked={selectAll}
                  toggleCheckbox={() => handleSelectAll(orders)}
                  className={`size-5 bg-gray-900/10 ${
                    selectAll
                      ? "text-green-600 border-green-600/20 ring-green-600/10"
                      : "text-blue-50 border-gray-700 ring-gray-700/20"
                  }`}
                />
              }
              rows={orders}
              renderRows={(order, idx, ref) => (
                <tr
                  key={order._id || idx}
                  ref={ref}
                  className="text-center border-t border-gray-600/60"
                >
                  <td className="p-4">
                    <Checkbox
                      className={`size-5 bg-gray-900/10 ${
                        selected.includes(order._id)
                          ? "text-green-600 border-green-600/20 ring-green-600/10"
                          : "text-gray-50 border-gray-700 ring-gray-700/20"
                      }`}
                      isChecked={selected.includes(order._id)}
                      toggleCheckbox={() => handleSelectOne(order._id)}
                    />
                  </td>
                  <td className="p-4">{order._id}</td>
                  <td>{order.shippingAddress?.name}</td>
                  <td>{order.createdAt?.split("T")[0]}</td>
                  <td>{order.totals?.totalPrice}</td>
                  <td
                    className={
                      order.status === "pending" || order.status === "cancelled"
                        ? "text-red-600"
                        : order.status === "paid" ||
                          order.status === "refunded" ||
                          order.status === "delivered"
                        ? "text-green-600"
                        : order.status === "processing" ||
                          order.status === "shipped"
                        ? "text-yellow-600"
                        : ""
                    }
                  >
                    {order.status}
                  </td>
                  <td className="p-4 relative">
                    <button
                      className="hover:bg-blue-600/10 text-blue-600 p-1.5 rounded-full mr-2 transition cursor-pointer"
                      onClick={() => {
                        setSelected([order._id]);
                        setOrderStatus("Select");
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
              options={[
                { value: "delivered", label: "Mark as Delivered" },
                { value: "cancelled", label: "Cancel Order" },
                { value: "delete", label: "Delete Order" },
              ]}
              className={
                " w-full py-2.5 px-3 gap-3 bg-gray-800/80 text-blue-100"
              }
              bottom={false}
              hoverStyle={"hover:bg-green-600/90"}
            />
            <button
              disabled={Boolean(!selected.length) || isPending || isDeleting}
              className=" disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2.5 px-6 font-medium font-funnel rounded-md bg-green-600/90 transition hover:bg-green-700 cursor-pointer"
              onClick={() => handleBulkAction()}
            >
              {isPending || isDeleting ? (
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
              toggleCheckbox={() => handleSelectAll(orders)}
              className={`size-5 bg-gray-900/10 ${
                selectAll
                  ? "text-green-600 border-green-600/20 ring-green-600/10"
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
              hoverStyle={"hover:bg-green-600/90"}
            />
          </div>
        </div>
      </div>

      {/* Order status update */}
      {orderStatus && (
        <div className=" fixed top-1/6 left-0 z-50 h-full w-full flex justify-center  bg-gray-800/10 backdrop-blur-xs">
          <div className=" min-w-80 h-fit bg-gray-800/30 backdrop-blur-2xl p-4 rounded-xl space-y-4 shadow-2xl content-center text-center">
            <h1 className="flex flex-row justify-between items-center mb-6 text-lg font-semibold text-gray-100">
              Update Status
              <button
                className="text-green-50 transition hover:text-red-600 active:text-red-600 cursor-pointer"
                onClick={() => {
                  setOrderStatus("");
                  setNotes("");
                  setSelectAll(false);
                  setSelected([]);
                }}
              >
                <CgClose size={24} />
              </button>
            </h1>
            <textarea
              type="text"
              name="notes"
              id="notes"
              placeholder="Add notes"
              onChange={(e) => setNotes(e.target.value)}
              value={notes}
              maxLength={200}
              required
              className=" w-full p-2 rounded-md text-gray-50 border border-gray-700/70 outline-0"
            />
            <Select
              selected={orderStatus || "select"}
              handleSelect={(value) => setOrderStatus(value)}
              options={[
                { value: "Pending", label: "Pending" },
                { value: "Processing", label: "Processing" },
                { value: "Paid", label: "Paid" },
                { value: "Shipped", label: "Shipped" },
                { value: "Delivered", label: "Delivered" },
                { value: "Cancelled", label: "Cancelled" },
                { value: "Refunded", label: "Refunded" },
              ]}
              className={
                " w-full py-1 px-2 bg-gray-800/80 text-blue-100 backdrop-blur-2xl"
              }
              hoverStyle={"hover:bg-green-600/80"}
            />
            <button
              className="bg-green-600 px-4 py-2 mt-4 text-base text-green-50 rounded-lg transition hover:bg-green-700 active:bg-green-700 cursor-pointer"
              onClick={async () => {
                if (!orderStatus || !notes) return;
                await updateStatus({
                  accessToken,
                  ids: selected,
                  status: orderStatus.toLocaleLowerCase(),
                  notes: notes,
                });
                setOrderStatus("");
                setNotes("");
                setSelectAll(false);
                setSelected([]);
              }}
            >
              Update
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderList;
