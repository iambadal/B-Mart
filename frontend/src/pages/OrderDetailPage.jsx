import { useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useCancelCustomerOrder, useCustomerOrder } from "../Hooks/useOrders";
import ProductRating from "../components/ProductRating";
import toRupee from "../utils/formatToRupee";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const { data: order, isLoading, error } = useCustomerOrder(id, accessToken);
  const cancelOrder = useCancelCustomerOrder();
  const [reviewProductId, setReviewProductId] = useState(null);

  if (isLoading) return <p className="p-6 text-gray-600">Loading order…</p>;
  if (error || order?.message) return <p className="p-6 text-red-600">{order?.message || "Could not load this order."}</p>;
  if (!order) return null;

  const isPaidCancellable = ["paid", "processing"].includes(order.status) && order.paymentInfo?.status === "captured" && Boolean(order.paymentInfo?.paymentId) && !["processing", "completed"].includes(order.cancellationStatus);
  const canCancel = isPaidCancellable || (["pending", "processing"].includes(order.status) && !["captured", "created"].includes(order.paymentInfo?.status));
  const cancel = async () => {
    const confirmMessage = isPaidCancellable
      ? "Cancel this paid order and request a full refund to the original payment method?"
      : "Cancel this order?";
    if (!window.confirm(confirmMessage)) return;
    const result = await cancelOrder.mutateAsync({ orderId: id, accessToken });
    if (result.status !== "success") window.alert(result.message || "Could not cancel this order.");
  };

  return (
    <section className="mx-auto max-w-4xl p-4 font-poppins">
      <Link to="/user/orders" className="text-sm text-blue-600 hover:underline">← Back to my orders</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3 rounded-xl bg-gray-50 p-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Order details</h1>
          <p className="mt-1 break-all text-xs text-gray-500">Order #{order._id}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className={`rounded-full px-2.5 py-1 font-medium capitalize ${order.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-700"}`}>{order.status}</span>
            <span className="text-gray-600">Placed {new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {canCancel && <button disabled={cancelOrder.isPending} onClick={cancel} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{cancelOrder.isPending ? "Cancelling…" : "Cancel order"}</button>}
        {order.cancellationStatus === "processing" && <p className="text-sm text-amber-700">Cancellation and refund are being processed.</p>}
      </div>

      {order.status === "cancelled" && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">This order was cancelled{order.cancelledAt ? ` on ${new Date(order.cancelledAt).toLocaleDateString()}` : ""}.</p>
          {order.paymentInfo?.refundId && <p className="mt-1">Refund status: {order.paymentInfo.refundStatus || "submitted"}</p>}
        </div>
      )}

      <h2 className="mb-3 mt-7 text-lg font-medium">Items</h2>
      <div className="space-y-3">
        {order.items?.map((item) => (
          <article key={item._id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 p-3">
            <img src={item.image?.replace(/^http:\/\//i, "https://") || "/no-image.png"} alt={item.name} className="h-20 w-20 rounded-md object-contain" />
            <div className="min-w-40 flex-1">
              <Link to={`/product/${item.product}`} className="font-medium text-gray-800 hover:text-blue-600">{item.name}</Link>
              <p className="mt-1 text-sm text-gray-500">Quantity: {item.qty}</p>
              <p className="text-sm text-gray-500">{toRupee(item.price)} each</p>
            </div>
            {order.status === "delivered" && <button onClick={() => setReviewProductId(String(item.product))} className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">Rate product</button>}
          </article>
        ))}
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <h2 className="mb-2 font-medium">Shipping address</h2>
          <p className="text-sm text-gray-600">{order.shippingAddress?.name}</p>
          <p className="text-sm text-gray-600">{order.shippingAddress?.address}</p>
          <p className="text-sm text-gray-600">{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(", ")}</p>
          <p className="text-sm text-gray-600">{order.shippingAddress?.country}</p>
          <p className="text-sm text-gray-600">{order.shippingAddress?.phone}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <h2 className="mb-2 font-medium">Payment and total</h2>
          <p className="text-sm capitalize text-gray-600">{order.paymentInfo?.provider || "Payment"} · {order.paymentInfo?.status || order.status}</p>
          <dl className="mt-3 space-y-1 text-sm text-gray-600">
            <div className="flex justify-between"><dt>Items</dt><dd>{toRupee(order.totals?.itemsPrice)}</dd></div>
            <div className="flex justify-between"><dt>Tax</dt><dd>{toRupee(order.totals?.taxPrice)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{toRupee(order.totals?.shippingPrice)}</dd></div>
            <div className="flex justify-between border-t pt-2 font-semibold text-gray-800"><dt>Total</dt><dd>{toRupee(order.totals?.totalPrice)}</dd></div>
          </dl>
        </div>
      </div>
      {order.notes && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-gray-700">Order note: {order.notes}</p>}
      {reviewProductId && <ProductRating productId={reviewProductId} close={() => setReviewProductId(null)} />}
    </section>
  );
}
