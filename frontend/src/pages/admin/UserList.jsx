import { useEffect, useState } from "react";
import SearchBar from "../../components/admin/SearchBar";
import Select from "../../components/CustomSelect";
import useSelection from "../../Hooks/useSelection";
import ShimmerButton from "../../components/ShimmerButton";
import Checkbox from "../../components/CustomCheckbox";
import { CgSpinner } from "react-icons/cg";
import { useOutletContext } from "react-router";
import Table from "../../components/admin/Table";
import { useDebounce } from "../../Hooks/useDebounce";
import { useAuth } from "../../contexts/AuthContext";
import {
  useDeleteUsers,
  useFetchUsersList,
  useUpdateUserRole,
  useUpdateUserStatus,
} from "../../Hooks/useAdmin";

const UserList = () => {
  const [filters, setFilters] = useState({
    search: "",
    userType: "",
  });
  const debouncedSearchTerm = useDebounce(filters.search, 500); // 500ms delay
  const [page, setPage] = useState(1); // current page number
  const [limit, setLimit] = useState(5); // item per page
  const [totalPages, setTotalPages] = useState(1); // total page
  const [bulkAction, setBulkAction] = useState("");
  const [users, setUsers] = useState([]);
  const [isOpen, setIsConfirm] = useOutletContext();
  const {
    selected,
    selectAll,
    setSelected,
    setSelectAll,
    handleSelectAll,
    handleSelectOne,
  } = useSelection();

  const { accessToken } = useAuth();
  const { data: usersList, isLoading } = useFetchUsersList(
    { ...filters, search: debouncedSearchTerm },
    page,
    limit,
    "",
    accessToken
  );

  const { mutateAsync: updateUserStatus, isPending } = useUpdateUserStatus();
  const { mutateAsync: updateUserRole, isPending: isUpdating } =
    useUpdateUserRole();
  const { mutateAsync: deleteUsers, isPending: isDeleting } = useDeleteUsers();

  // Handle bulk action
  const handleBulkAction = async () => {
    if (bulkAction === "Banned" || bulkAction === "Unbanned") {
      await updateUserStatus({
        accessToken,
        ids: selected,
        status: bulkAction,
      });
      setSelectAll(false);
      setSelected([]);
    }

    if (bulkAction === "Promote") {
      await updateUserRole({ accessToken, ids: selected, role: "toggle" });
      setSelectAll(false);
      setSelected([]);
    }

    if (bulkAction === "Delete") {
      setIsConfirm({
        showModel: true,
        action: async () => {
          await deleteUsers({ accessToken, ids: selected });
          setSelectAll(false);
          setSelected([]);
        },
      });
    }
  };

  // Set user lists...
  useEffect(() => {
    setUsers(usersList?.items);
    setTotalPages(usersList?.totalPages);
  }, [usersList]);

  // Reset page when user changes filters (so you go back to page 1)
  useEffect(() => setPage(1), [filters.search, filters.userType, limit]);

  return (
    <>
      <div className=" w-full max-sm:min-h-[800px] min-h-[400px] h-full text-blue-100">
        {/* search + filters */}
        <div className="w-full flex max-md:flex-col items-center max-sm:gap-8 gap-30 mb-6">
          <SearchBar
            className={"w-full"}
            searchTerm={filters.search}
            handleSearch={(value) =>
              setFilters((prev) => ({ ...prev, search: value }))
            }
            placeholder={"Search by Name, User ID, Email ID"}
          />
          <Select
            selected={filters.userType || "User Type"}
            handleSelect={(value) =>
              setFilters((prev) => ({ ...prev, userType: value }))
            }
            options={[
              { value: "Admin", label: "Admin" },
              { value: "Customer", label: "Customer" },
              { value: "Blocked", label: "Blocked" },
            ]}
            className={" w-full py-2.5 px-3 bg-gray-800/80 text-blue-100"}
            hoverStyle={"hover:bg-orange-600/80"}
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
              columns={["User ID", "Name", "Email", "Date", "Role", "Status"]}
              checkbox={
                <Checkbox
                  name={"selectAll"}
                  isChecked={selectAll}
                  toggleCheckbox={() => handleSelectAll(users)}
                  className={`size-5 bg-gray-900/10 ${
                    selectAll
                      ? "text-orange-600 border-orange-600/20 ring-orange-600/10"
                      : "text-gray-50 border-gray-700 ring-gray-700/20"
                  }`}
                />
              }
              rows={users}
              renderRows={(user, idx, ref) => (
                <tr
                  key={user._id || idx}
                  ref={ref}
                  className="text-center border-t border-gray-600/60"
                >
                  <td className="p-4">
                    <Checkbox
                      className={`size-5 bg-gray-900/10 ${
                        selected.includes(user._id)
                          ? "text-orange-600 border-orange-600/20 ring-orange-600/10"
                          : "text-gray-50 border-gray-700 ring-gray-700/20"
                      }`}
                      isChecked={selected.includes(user._id)}
                      toggleCheckbox={() => handleSelectOne(user._id)}
                    />
                  </td>
                  <td className="p-4">{user._id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.createdAt?.split("T")[0]}</td>
                  <td>{user.role}</td>
                  <td
                    className={
                      user.status === "Banned"
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {user.status}
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
                { value: "Banned", label: "Ban User" },
                { value: "Unbanned", label: "Unban user" },
                { value: "Promote", label: "Promote to Admin" },
                { value: "Delete", label: "Delete Users" },
              ]}
              className={
                " w-full py-2.5 px-3 gap-3 bg-gray-800/80 text-blue-100"
              }
              bottom={false}
              hoverStyle={"hover:bg-orange-600/90"}
            />
            <button
              disabled={
                Boolean(!selected.length) ||
                isPending ||
                isUpdating ||
                isDeleting
              }
              className=" disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2.5 px-6 font-medium font-funnel rounded-md bg-orange-600/90 transition hover:bg-orange-700 cursor-pointer"
              onClick={() => handleBulkAction()}
            >
              {isPending ? <CgSpinner className=" animate-spin" /> : "Apply"}
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
              toggleCheckbox={() => handleSelectAll(users)}
              className={`size-5 bg-gray-900/10 ${
                selectAll
                  ? "text-orange-600 border-orange-600/20 ring-orange-600/10"
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
              hoverStyle={"hover:bg-orange-600/90"}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserList;
