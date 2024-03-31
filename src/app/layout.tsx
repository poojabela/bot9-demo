import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { clsxm } from "@/utils/styles";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bot9 Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth h-full">
      <body
        className={clsxm(
          inter.className,
          "bg-neutral-100 text-black h-full flex flex-row items-center justify-center polka-pattern",
        )}
      >
        {children}
      </body>
    </html>
  );
}
