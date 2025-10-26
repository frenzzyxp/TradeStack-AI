// app/layout.tsx
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // regular/semibold/bold
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "TradeStack AI",
  description: "AI inbox",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className="bg-gray-50 font-sans text-gray-900">{children}</body>
    </html>
  );
}

