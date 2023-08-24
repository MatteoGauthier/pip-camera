import "@/styles/globals.css"
import "@/styles/ambient-player.css"

import type { AppProps } from "next/app"

import localFont from "next/font/local"

const CalSans = localFont({
  src: "../../public/fonts/CalSans-SemiBold.woff2",
  variable: "--font-display",
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${CalSans.variable}`}>
      <Component {...pageProps} />
    </main>
  )
}
