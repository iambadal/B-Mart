import SummaryCard from "../../components/admin/SummaryCard";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { FaTruckFast, FaIndianRupeeSign } from "react-icons/fa6";
import { HiUsers } from "react-icons/hi2";
import { useDashboardSummary, useDashboardData } from "../../Hooks/useAdmin";
import { useAuth } from "../../contexts/AuthContext";
import ChartWrapper from "../../components/admin/ChartWrapper";
import { useOutletContext } from "react-router";
import { useRecentOrders } from "../../Hooks/useOrders";
import Table from "../../components/admin/Table";

const AdminDashboard = () => {
  const { accessToken: token } = useAuth();
  const { data: summary } = useDashboardSummary(token);
  const { salesQuery, categoryQuery, stockQuery } = useDashboardData(token);
  const { data: orders } = useRecentOrders(token);
  const [isOpen] = useOutletContext();


  return (
    <div className=" overflow-hidden">
      {/* Quick status */}
      <div className=" flex flex-row justify-between max-sm:justify-center flex-wrap gap-5 mb-8">
        <SummaryCard
          count={summary.totalProducts || 0}
          title={"Total Products"}
          icon={RiShoppingBag4Fill}
          classNames={"bg-violet-500/10 text-violet-600"}
        />
        <SummaryCard
          count={summary.totalOrders || 0}
          title={"Total Orders"}
          icon={FaTruckFast}
          classNames={"bg-blue-500/10 text-blue-600"}
        />
        <SummaryCard
          count={summary.totalUsers || 0}
          title={"Total Users"}
          icon={HiUsers}
          classNames={"bg-orange-500/10 text-orange-600"}
        />
        <SummaryCard
          count={summary.totalRevenue || 0}
          title={"Total Revenue"}
          icon={FaIndianRupeeSign}
          classNames={"bg-green-500/10 text-green-600"}
        />
      </div>

      <div className=" grid grid-cols-2 max-sm:grid-cols-1 gap-10">
        {/* Charts */}
        <div className="sm:col-span-2 p-6 space-y-4 rounded-xl shadow bg-gray-800/30 text-gray-50">
          <h2 className=" font-semibold text-lg">Stock Status</h2>
          {stockQuery.data.length > 0 && (
            <ChartWrapper
              type="bar"
              data={stockQuery.data.map((s) => ({
                name: s._id,
                value: s.totalStock,
              }))}
              config={{ xKey: "name", yKey: "value", color: "#3b82f6" }}
            />
          )}
        </div>

        <div className="p-6 space-y-4 rounded-xl shadow bg-gray-800/30 text-gray-50">
          <h2 className=" font-semibold text-lg">Category Distribution</h2>

          {categoryQuery.data.length > 0 && (
            <ChartWrapper
              type="pie"
              data={categoryQuery.data.map((c) => ({
                name: c._id,
                value: c.count,
              }))}
              config={{ xKey: "name", yKey: "value" }}
            />
          )}
        </div>

        <div className="p-6 space-y-4 rounded-xl shadow bg-gray-800/30 text-gray-50">
          <h2 className=" font-semibold text-lg">Sales Overview</h2>

          {salesQuery.data?.length > 0 && (
            <ChartWrapper
              type="area"
              data={salesQuery.data?.map((s) => ({
                name: `Month ${s._id}`,
                value: s.totalRevenue,
              }))}
              config={{ xKey: "name", yKey: "value", color: "#3b82f6" }}
            />
          )}
        </div>

        {/* Order table */}
        <div
          className={`${
            isOpen
              ? "max-md:w-[calc(100vw-30px)] w-[calc(100vw-290px)]"
              : " w-[calc(100vw-100px)]"
          } overflow-x-auto mb-6 p-6 space-y-4 rounded-xl shadow bg-gray-800/30 text-gray-200`}
        >
          <h1 className=" font-semibold text-lg">Recent Activity</h1>
          <Table
            columns={["Order ID", "Customer", "Date", "Amount", "status"]}
            rows={orders}
            renderRows={(order, idx, ref) => (
              <tr
                key={order._id || idx}
                ref={ref}
                className="text-center border-t border-gray-600/60"
              >
                <td className="p-4">{order._id}</td>
                <td>{order.user?.username}</td>
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
                
              </tr>
            )}
          />
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;
