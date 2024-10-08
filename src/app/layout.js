// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import TopNavbar from './components/TopNavbar';
import Footer from './components/footer';
import BottomNavbar from './components/BottomNavbar';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider } from './contexts/AuthContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "سوق ايجار المعدات الثقيلة، بخفة يدك.",
  description: "معدتي هو تطبيق مختص بتسهيل عملية ايجار المعدات لجميع الاطراف",
  icons: [
    { rel: 'icon', url: '/lastelo.png', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/lastelo.png' },
    { rel: 'shortcut icon', url: '/lastelo.png' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <DarkModeProvider>
            <TopNavbar />
            <main className="flex-grow pt-16 pb-0"> {/* Adjusted bottom padding */}
              {children}
            </main>
            <Footer/>
            <BottomNavbar />
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}