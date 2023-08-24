import Camera from "@/components/Camera"
import Head from "next/head"

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen py-24">
      <Head>
        <title>Front Camera PIP - Mirror Camera</title>
        <meta
          name="description"
          content="Display front camera as Picture-in-Picture to record screen with face shown"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-7xl font-bold mb-4 font-display text-white">Front Camera PIP</h1>
      <p className="text-lg max-w-lg text-center text-white/70 text-gray-600 mb-8">
        This website allows you to display your front camera as Picture-in-Picture (PIP) to record your screen with your
        face shown.
      </p>
      <Camera />

      <footer className="fixed bottom-0 m-5">
        {/* @todo add squale link */}
        <p className="text-gray-500">Made by <a className="text-white/70" href="https://twitter.com/MatteoGauthier_">Mattèo Gauthier</a></p>
      </footer>
    </div>
  )
}
