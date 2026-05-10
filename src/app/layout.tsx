import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tile Assassin",
  description: "Tile Assassin — web edition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;900&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="rotate-overlay">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect x="12" y="8" width="32" height="40" rx="4" stroke="#d0d8e0" strokeWidth="2.5" />
            <rect x="8"  y="16" width="40" height="24" rx="4" stroke="#c8a050" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
            <path d="M38 6 L44 10 L38 14" stroke="#c8a050" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.3em',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
          }}>
            Gerät drehen
          </p>
        </div>
        {children}
      </body>
    </html>
  );
}
