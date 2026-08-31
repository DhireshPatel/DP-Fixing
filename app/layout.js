import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/context/ToastContext";

export const metadata = {
  title: "DP Fixing | Professional Electrician Services",
  description:
    "Book trusted electricians for electrical repairs, installations and maintenance at your doorstep with DP Fixing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <LocationProvider>
            <CartProvider>
              <Navbar />
              <main style={{ minHeight: "60vh" }}>{children}</main>
              <Footer />
            </CartProvider>
          </LocationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
