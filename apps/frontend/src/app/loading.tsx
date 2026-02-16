export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* 1. The Spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        {/* Optional: A subtle inner dot or icon if you want extra flair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🍔</span>
        </div>
      </div>

      {/* 2. The Text */}
      <h2 className="mt-6 text-gray-500 font-medium tracking-wide animate-pulse">
        Loading deliciousness...
      </h2>
    </div>
  );
}
