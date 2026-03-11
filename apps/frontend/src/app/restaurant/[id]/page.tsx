"use client";

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

const GET_MENU = gql`
  query GetRestaurant($id: String!) {
    restaurant(id: $id) {
      id
      name
      region
      menuItems {
        id
        name
        price
      }
    }
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
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      restaurantId
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

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function RestaurantPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  //  State to track quantity inputs for each menu item (before adding to cart)
  const [inputs, setInputs] = useState<{ [key: string]: number }>({});

  const { loading, error, data } = useQuery(GET_MENU, { variables: { id } });

  const { data: cartData, refetch: refetchCart } = useQuery(GET_REGIONAL_CART, { fetchPolicy: "network-only" });
  const [addToCartMut] = useMutation(ADD_TO_CART);
  const [clearCartMut] = useMutation(CLEAR_CART);
  const [removeFromCartMut] = useMutation(REMOVE_FROM_CART);

  const cart = cartData?.myRegionalCart?.items || [];
  const cartRestaurantId = cartData?.myRegionalCart?.restaurantId || null;

  const [createOrder, { loading: ordering }] = useMutation(CREATE_ORDER, {
    onCompleted: () => {
      toast.success("Order placed successfully! 🚀");
      localStorage.removeItem(`cart-${id}`);
      router.push("/orders");
    },
    onError: (err) => {
      if (err.message.includes("Forbidden")) {
        toast.error("Security Block: You cannot order from this region!");
      } else {
        toast.error("Failed to place order: " + err.message);
      }
    },
  });

  // 1. Handle Input Change ( +/- buttons)
  const updateInput = (itemId: string, delta: number) => {
    setInputs((prev) => {
      const current = prev[itemId] || 1; // Default to 1
      const newValue = Math.max(1, current + delta); // Minimum 1
      return { ...prev, [itemId]: newValue };
    });
  };

  // 2. Add Specific Quantity to Cart
  const addToCart = async (item: any) => {
    const qtyToAdd = inputs[item.id] || 1; // Get selected qty or default 1

    if (cartRestaurantId && cartRestaurantId !== id) {
      const confirmClear = window.confirm(
        "You already have some items in the cart from another restaurant. Should we clean the cart and add this new one?"
      );
      if (confirmClear) {
        await clearCartMut();
      } else {
        const goToCart = window.confirm("Would you like to go to your cart to manage it?");
        if (goToCart) router.push("/cart");
        return;
      }
    }

    try {
      await addToCartMut({
        variables: {
          input: {
            menuItemId: item.id,
            restaurantId: id,
            quantity: qtyToAdd,
          },
        },
      });
      toast.success("Added to cart");
      refetchCart();
      setInputs((prev) => ({ ...prev, [item.id]: 1 }));
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart");
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      await removeFromCartMut({ variables: { cartItemId } });
      refetchCart();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove item");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    createOrder({
      variables: {
        input: {
          restaurantId: id,
          items: cart.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
        },
      },
    });
  };

  const total = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-red-500 text-center">
        Error: {error.message}
      </div>
    );

  const { restaurant } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {restaurant.name}
            </h1>
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {restaurant.region} Cuisine
            </span>
          </div>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-900 transition"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Menu Items */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Menu</h2>
          {restaurant.menuItems.map((item: any) => {
            const currentInput = inputs[item.id] || 1; // Current number shown in input

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 font-medium">
                    ₹{item.price.toFixed(2)}
                  </p>
                </div>

                {/* 🆕 Quantity Selector & Add Button */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded-lg">
                    <button
                      onClick={() => updateInput(item.id, -1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-l-lg font-bold"
                    >
                      -
                    </button>
                    <span className="px-2 w-8 text-center font-medium text-gray-800">
                      {currentInput}
                    </span>
                    <button
                      onClick={() => updateInput(item.id, 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-r-lg font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => addToCart(item)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Cart (Sticky) */}
        <div className="h-fit">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex justify-between items-center">
              Your Cart{" "}
              <span className="text-sm font-normal text-gray-500">
                {cart.length} items
              </span>
            </h2>

            {cart.length === 0 ? (
              <p className="text-center py-8 text-gray-400">
                Your cart is empty.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                  {cart.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div>
                        <span className="font-bold mr-2">{item.quantity}x</span>
                        <span className="text-gray-800">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-gray-600">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-600 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 font-medium">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={ordering}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex justify-center gap-2 mb-2"
                  >
                    {ordering ? "Processing..." : "Confirm Order 🚀"}
                  </button>
                  <button
                    onClick={() => router.push("/cart")}
                    className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-bold hover:bg-blue-200 transition text-center"
                  >
                    View Cart ({cart.length} items)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
