// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import TopNavbar from './components/TopNavbar';
import BottomNavbar from './components/BottomNavbar';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider } from './contexts/AuthContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
      <AuthProvider>
        <DarkModeProvider>
          <TopNavbar />
          <main className="flex-grow pt-16 pb-16">
            {children}
          </main>
          <BottomNavbar />
        </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}