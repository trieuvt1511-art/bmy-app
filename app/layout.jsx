import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import { ShoppingListProvider } from "@/components/ShoppingListProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PWAInstaller from "@/components/PWAInstaller";

export const metadata = {
  title: "YumGo — Global Cooking, from Asia to Europe",
  description:
    "Discover global recipes, ingredients and food trends — from Hanoi pho to Madrid tapas. Trilingual cooking app (VI/EN/ES).",
  manifest: "/manifest.json",
  applicationName: "YumGo",
  appleWebApp: {
    capable: true,
    title: "YumGo",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF5722",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <LanguageProvider>
          <FavoritesProvider>
            <ShoppingListProvider>
              <Navbar />
              <main className="min-h-[calc(100vh-4rem)]">{children}</main>
              <Footer />
              <PWAInstaller />
            </ShoppingListProvider>
          </FavoritesProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
