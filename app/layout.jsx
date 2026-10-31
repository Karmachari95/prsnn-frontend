import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import NavBar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";
import BottomNav from "./components/layout/BottomNav";
import { AuthProvider } from "./context/AuthContext";
import VerificationGuard from "./components/common/VerificationGuard";
import GlobalClickGuard from "./components/auth/GlobalClickGuard";
import { NotificationProvider } from "./context/NotificationContext";
import EnvBanner from "./components/common/EnvBanner";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "prsnn. — Presence without pressure",
  description:
    "prsnn. is a peer-to-peer platform to book trusted companions for shared presence. Sit, walk, or just be around — no dating, no therapy, no pressure.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <NotificationProvider>
            <GlobalClickGuard />
            <NavBar />
            {children}
            <Footer />
            <BottomNav />
            <EnvBanner />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
