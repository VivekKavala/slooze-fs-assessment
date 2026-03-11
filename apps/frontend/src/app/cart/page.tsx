"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const GET_REGIONAL_CART = gql`
  query GetRegionalCart {
    myRegionalCart {
      id
      restaurantId
      items {
        id
        menuItemId
        name
        price
        quantity
      }
      restaurant {
        id
        name
        region
      }
    }
  }
`;

const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($cartItemId: String!) {
    removeFromCart(cartItemId: $cartItemId) {
      id
      items {
        id
        menuItemId
        name
        price
        quantity
      }
    }
  }
`;

const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(createOrderInput: $input) {
      id
      totalAmount
      status
    }
  }
`;

export default function Cart() {
  const router = useRouter();

  const { data, loading, error, refetch: refetchCart } = useQuery(GET_REGIONAL_CART, {
    fetchPolicy: "network-only",
  });
  const [removeFromCartMut] = useMutation(REMOVE_FROM_CART);
  const [clearCartMut] = useMutation(CLEAR_CART);
  
  const [createOrder, { loading: ordering }] = useMutation(CREATE_ORDER, {
    onCompleted: async () => {
      toast.success("Order placed successfully! 🚀");
      await clearCartMut();
      router.push("/orders");
    },
    onError: (err) => {
      toast.error("Failed to place order: " + err.message);
    },
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error) return <div className="p-10 text-red-500 text-center">Error: {error.message}</div>;

  const cart = data?.myRegionalCart;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pb-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Regional Cart</h1>
        <p className="text-gray-500 mb-8">Your cart is currently empty.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  const { restaurant, items } = cart;
  const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeFromCartMut({ variables: { cartItemId } });
      refetchCart();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove item");
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    try {
      await clearCartMut();
      refetchCart();
      toast.success("Cart cleared");
    } catch (err: any) {
      toast.error(err.message || "Failed to clear cart");
    }
  };

  const handleCheckout = () => {
    createOrder({
      variables: {
        input: {
          restaurantId: restaurant.id,
          items: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Regional Cart</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-900 transition"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Order from {restaurant.name}</h2>
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mt-2">
                {restaurant.region} Cuisine
              </span>
            </div>
            <button
              onClick={handleClear}
              className="text-red-500 hover:text-red-700 font-semibold text-sm transition bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg"
            >
              Empty Cart
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                  <span className="bg-gray-100 text-gray-800 font-bold px-3 py-1 rounded-lg">
                    {item.quantity}x
                  </span>
                  <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-4">
                  <span className="font-mono font-bold text-lg text-gray-800">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-full transition"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-gray-600 font-semibold">Total Amount</span>
              <span className="text-3xl font-bold text-gray-900">
                ₹{total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={ordering}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-md"
            >
              {ordering ? "Processing Final Order..." : "Confirm & Pay 🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}