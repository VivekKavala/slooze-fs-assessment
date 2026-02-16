"use client";

import { useQuery, gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "../context/AppContext";

const GET_RESTAURANTS = gql`
  query GetRestaurants {
    restaurants {
      id
      name
      region
    }
  }
`;

export default function Dashboard() {
  const router = useRouter();
  const { user } = useApp(); // Get User from Context
  const { loading, error, data } = useQuery(GET_RESTAURANTS);

  useEffect(() => {
    if (error?.message.includes("Unauthorized")) router.push("/login");
  }, [error, router]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Action Bar */}
      <div className="flex flex-wrap gap-4 mb-10">
        <button
          onClick={() => router.push("/orders")}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-sm hover:bg-blue-700 transition active:scale-95"
        >
          📦{" "}
          <span className="font-semibold">
            {user?.role === "ADMIN" || user?.role === "MANAGER"
              ? "Manage All Orders"
              : "View My Orders"}
          </span>
        </button>
      </div>

      {/* Restaurant Grid */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Available Restaurants
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data?.restaurants.map((r: any) => (
          <div
            key={r.id}
            onClick={() => router.push(`/restaurant/${r.id}`)}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl cursor-pointer p-6 transition"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-gray-900">{r.name}</h3>
              <span
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  r.region === "INDIA"
                    ? "bg-orange-50 text-orange-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {r.region}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Click to view menu and order.
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
