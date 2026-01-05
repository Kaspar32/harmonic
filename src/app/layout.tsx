import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/header";
import Footer from "./components/footer";
import "./globals.css";


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
        <div className="flex flex-col h-screen ">
          <div className="sticky top-0 z-[60]">
            <Header />
          </div>

          <div className="flex-1 bg-white z-40"> {children}</div>
          <div className="sticky bottom-0 z-40">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
