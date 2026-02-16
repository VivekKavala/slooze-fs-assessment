import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { AppContextProvider } from "../context/AppContext";
import Header from "../components/Header";
import { Toaster } from "react-hot-toast"; // 👈 Import this

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-900">
        <ApolloWrapper>
          <AppContextProvider>
            <Header />
            {children}
            <Toaster position="bottom-right" reverseOrder={false} />
          </AppContextProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
