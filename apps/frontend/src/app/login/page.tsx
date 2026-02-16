"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react/hooks";
// import { useRouter } from "next/navigation";

// 1. Define the Login Mutation
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      accessToken
      user {
        id
        name
        role
        region
      }
    }
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const router = useRouter();

  // 2. Setup the Mutation Hook
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      // 3. Save Token & User Info
      localStorage.setItem("token", data.login.accessToken);
      localStorage.setItem("user", JSON.stringify(data.login.user));

      // Force a reload to ensure Apollo Link picks up the new token immediately
      window.location.href = "/";
    },
    onError: (err) => {
      console.error("Login Failed:", err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ variables: { email, password } });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login to Slooze 🍔
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-black p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="nick@slooze.xyz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
              {error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center mb-2 font-medium">
            TEST CREDENTIALS
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
            <div className="flex justify-between bg-gray-50 p-2 rounded">
              <span>Admin (Global):</span>
              <span className="font-mono">nick@slooze.xyz / slooze123</span>
            </div>
            <div className="flex justify-between bg-gray-50 p-2 rounded">
              <span>Manager (USA):</span>
              <span className="font-mono">cap@slooze.xyz / slooze123</span>
            </div>
            <div className="flex justify-between bg-gray-50 p-2 rounded">
              <span>Member (India):</span>
              <span className="font-mono">thanos@slooze.xyz / slooze123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
