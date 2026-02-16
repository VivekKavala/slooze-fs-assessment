"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";

const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      status
      totalAmount
      createdAt
      restaurant {
        name
        region
      }
      items {
        name
        quantity
        price
      }
    }
  }
`;

const PAY_ORDER = gql`
  mutation PayOrder($id: String!) {
    payOrder(id: $id) {
      id
      status
    }
  }
`;

export default function OrdersPage() {
  const { user } = useApp();
  const { loading, data, refetch } = useQuery(GET_ORDERS, {
    pollInterval: 3000,
  });

  const [payOrder, { loading: paying }] = useMutation(PAY_ORDER, {
    onCompleted: (res) => {
      toast.success(`Order #${res.payOrder.id.slice(-4)} Paid Successfully!`);
      refetch();
    },
    onError: (err) => {
      if (err.message.includes("Forbidden")) {
        toast.error("⛔ Permission Denied: You cannot pay for this region.");
      } else {
        toast.error(err.message);
      }
    },
  });

  const isPrivileged = user?.role === "ADMIN" || user?.role === "MANAGER";

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // STRICT FILTER: Only show what belongs to the user
  const visibleOrders = data?.orders.filter((order: any) => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return order.restaurant.region === user.region;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Order Management
      </h1>

      <div className="space-y-4">
        {visibleOrders?.length === 0 ? (
          <p className="text-gray-500 text-center">
            No orders found for your region.
          </p>
        ) : (
          visibleOrders.map((order: any) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-lg text-black">
                    {order.restaurant.name}
                  </h3>
                  <span className="text-xs text-gray-500 uppercase">
                    {order.restaurant.region}
                  </span>
                </div>

                {/* Only show button if Pending AND User is Manager/Admin */}
                {order.status === "PENDING" && isPrivileged && (
                  <button
                    onClick={() => payOrder({ variables: { id: order.id } })}
                    disabled={paying}
                    className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800"
                  >
                    {paying ? "Processing..." : "Pay Order"}
                  </button>
                )}

                {/* Status Badge if not pending or not privileged */}
                {(order.status !== "PENDING" || !isPrivileged) && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      order.status === "PAID"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    {order.status}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Total: ₹{order.totalAmount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
