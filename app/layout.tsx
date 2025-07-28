
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: 'swap', variable: '--font-body' });
const robotoMono = Roboto_Mono({ subsets: ["latin"], weight: ['400', '500'], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  title: "DevOps Command Center",
  description: "A quick reference for common DevOps and IT commands, refactored to use Next.js with an API backend structure.",
};

// This inline script prevents a flash of unstyled content (FOUC)
// by setting the theme based on localStorage before the page renders.
const THEME_SCRIPT = `
  (function() {
    try {
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${robotoMono.variable}`}>
        <div id="root">
            {children}
        </div>
      </body>
    </html>
  );
}
