"use client"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { RecoilRoot } from "recoil"

const ThemeProvider = ({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) => {
  return (
    <RecoilRoot>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </RecoilRoot>
  )
}
export default ThemeProvider;
