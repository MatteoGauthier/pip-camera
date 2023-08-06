import Camera from "@/components/Camera"
import Head from "next/head"

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen py-24 bg-gray-100">
      <Head>
        <title>Front Camera PIP</title>
        <meta
          name="description"
          content="Display front camera as Picture-in-Picture to record screen with face shown"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-4xl font-bold mb-4">Front Camera PIP</h1>
      <p className="text-lg text-gray-600 mb-8">
        This website allows you to display your front camera as Picture-in-Picture (PIP) to record your screen with your
        face shown.
      </p>
      <Camera />
    </div>
  )
}
