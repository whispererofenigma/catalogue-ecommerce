// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // Import your Navbar

const inter = Inter({ subsets: ["latin"] });

// You can have default metadata here, which pages can override.
export const metadata: Metadata = {
  title: "Xponent - Your E-commerce Store", // A good default title
  description: "Discover amazing products at our online store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* NOTE: You do NOT need to add a <head> tag here. 
        Next.js automatically creates it and populates it with the metadata
        from this file and the specific page being rendered.
      */}
      <body  className={inter.className}>
        <Navbar />
        {/* The 'children' prop renders the content of your active page (e.g., ProductPage) */}
        <main >{children}</main>
        <Footer /> 
      </body>
    </html>
  );
}