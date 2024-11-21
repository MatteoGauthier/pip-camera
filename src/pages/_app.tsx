/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import "@/styles/globals.css"
import "@/styles/ambient-player.css"

import type { AppProps } from "next/app"

import localFont from "next/font/local"
import Script from "next/script"

const CalSans = localFont({
  src: "../../public/fonts/CalSans-SemiBold.woff2",
  variable: "--font-display",
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${CalSans.variable}`}>
      <Component {...pageProps} />
      <noscript>
        <img
          alt="Shynet"
          src="https://shynet.squale.dev/ingress/b8a1d84f-ddc0-4450-b677-0fffdff02070/pixel.gif"
        />
      </noscript>
      <Script src="https://shynet.squale.dev/ingress/b8a1d84f-ddc0-4450-b677-0fffdff02070/script.js" />
    </main>
  )
}
