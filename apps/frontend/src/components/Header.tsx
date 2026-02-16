"use client";

import { useApp } from "../context/AppContext";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const { user, logout } = useApp(); // No debugMode
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* LEFT */}
        <div className="flex items-center gap-8">
          <h1
            onClick={() => router.push("/")}
            className="text-2xl font-bold text-gray-900 tracking-tight cursor-pointer hover:text-blue-600 transition"
          >
            Slooze Food 🍔
          </h1>
          <nav className="hidden md:flex gap-4 text-sm font-medium text-gray-600">
            <button
              onClick={() => router.push("/")}
              className="hover:text-blue-600 transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/orders")}
              className="hover:text-blue-600 transition"
            >
              Orders
            </button>
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 uppercase">
                  {user.role} • {user.region}
                </p>
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 font-medium"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
