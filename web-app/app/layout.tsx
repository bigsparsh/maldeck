
import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans } from "next/font/google"

const dmsans_init = DM_Sans({
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: "MalDeck",
  description: "Detect any anomalies with your backend and fix them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={dmsans_init.className + " "}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >

            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
