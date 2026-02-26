import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/header";
import Footer from "./components/footer";
import "./globals.css";
import {UserProvider} from "@/app/context/UserContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>

        <div className="flex flex-col h-screen ">
          <div className="sticky top-0 z-50">
            <Header />
          </div>

          <div className="flex-1 bg-white z-30"> {children}</div>
          <div className="sticky bottom-0 z-50">
            <Footer />
          </div>
        </div>

        </UserProvider>
      </body>
    </html>
  );
}
