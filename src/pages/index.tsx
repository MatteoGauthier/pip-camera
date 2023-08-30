import Camera from "@/components/Camera"
import Head from "next/head"

const title = "Tiny Mirror - Front Camera Picture In Picture"

const description = "Display webcam as Picture-in-Picture to record screen with face shown, useful for creator teachers"

const url = "https://tinymirror.xyz"

export default function Home() {
  return (
    <div className="flex px-4 md:px-0 flex-col justify-center items-center min-h-screen py-24">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://tinymirror.xyz" />
        <meta property="og:image" content="https://tinymirror.xyz/og-image-tinymirror.png" />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:description" content={description} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={"Tiny Mirror"} />
      </Head>

      <h1 className="md:text-7xl text-5xl font-bold mb-4 font-display text-center text-white">Tiny Mirror PIP</h1>
      <p className="text-lg max-w-lg text-center text-white/70 text-gray-600 mb-8">
        This website allows you to display your front camera as Picture-in-Picture (PIP) to record your screen with your
        face shown.
      </p>
      <Camera />

      <footer className="fixed bottom-0 m-5">
        {/* @todo add squale link */}
        <p className="text-gray-500">
          Made by{" "}
          <a className="text-white/70" href="https://twitter.com/MatteoGauthier_">
            Mattèo Gauthier
          </a>
        </p>
      </footer>
    </div>
  )
}
