import React, { useRef, useEffect, useState, useCallback, Fragment } from "react"
import { useLocalStorage } from "react-use"
import Switch from "./Switch"
import clsx from "clsx"
import { Button } from "./ui/Button"
import PipIcon from "./svgx/PIPIcon"
import { Listbox, Transition } from "@headlessui/react"
import { ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { CheckIcon } from "@radix-ui/react-icons"

const aspectRatioOptions = [
  {
    label: "1:1",
    value: "1",
  },
  {
    label: "3:4",
    value: "0.75",
  },
  {
    label: "16:9",
    value: "1.7777777778",
  },
  {
    label: "4:3",
    value: "1.3333333333",
  },
]

const Camera = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mirroredVideoRef = useRef<HTMLVideoElement>(null)
  const hiddenVideoRef = useRef<HTMLVideoElement>(null)
  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<{
    label: string
    value: (typeof aspectRatioOptions)[number]["value"]
  }>(aspectRatioOptions[2])
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useLocalStorage<string>("preferred-camera", "")
  const [isMirrored, setIsMirrored] = useLocalStorage<boolean>("is-mirrored", true)

  useEffect(() => {
    const video = videoRef.current

    if (video) {
      const onDevicesChange = () => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          const videoDevices = devices.filter((device) => device.kind === "videoinput")
          setDevices(videoDevices)
        })
      }

      onDevicesChange()
    }
  }, [])

  const mirrorStream = useCallback(async (stream: MediaStream) => {
    const canvas = mirrorCanvasRef.current
    if (!canvas) return
    Object.assign(canvas, {
      width: 0,
      height: 0,
    })
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const drawOnCanvas = (image: any, width: number, height: number) => {
      // MediaStream's video size may change over time
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        ctx.setTransform(-1, 0, 0, 1, width, 0)
      }
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(image, 0, 0)
    }

    const vid = hiddenVideoRef.current
    if (!vid) return
    vid.srcObject = stream

    const scheduler = vid.requestVideoFrameCallback
      ? (cb: VideoFrameRequestCallback) => vid.requestVideoFrameCallback(cb)
      : requestAnimationFrame
    const draw = () => {
      const { videoWidth, videoHeight } = vid
      drawOnCanvas(vid, videoWidth, videoHeight)
      scheduler(draw)
    }
    await vid.play()
    draw()
    return canvas.captureStream()
  }, [])

  const updateCameraStream = useCallback(async () => {
    const constraints =
      selectedDeviceId === ""
        ? ({
            video: { facingMode: "user", aspectRatio: Number(selectedAspectRatio.value) },
            audio: false,
          } satisfies MediaStreamConstraints)
        : ({
            video: { deviceId: selectedDeviceId, aspectRatio: Number(selectedAspectRatio.value) },
            audio: false,
          } satisfies MediaStreamConstraints)

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      videoRef.current!.srcObject = stream
      console.log("hey")
      await videoRef.current!.play()

      await mirrorStream(stream)

      const canvas = mirrorCanvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")

      const canvasStream = ctx?.canvas.captureStream(60)

      if (mirroredVideoRef.current && canvasStream) {
        mirroredVideoRef.current!.srcObject = canvasStream

        await mirroredVideoRef.current.play()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }, [mirrorStream, selectedAspectRatio, selectedDeviceId])

  useEffect(() => {
    updateCameraStream()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAspectRatio, selectedDeviceId])

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value)
  }

  const togglePictureInPicture = useCallback(() => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture()
    } else if (document.pictureInPictureEnabled) {
      if (isMirrored && mirroredVideoRef.current) {
        mirroredVideoRef.current.requestPictureInPicture()
      } else if (videoRef.current) {
        videoRef.current.requestPictureInPicture()
      }
    }
  }, [isMirrored])

  const videoStyle =
    "absolute top-0 left-0 w-full h-full rounded-lg bg-black transition-colors ease-in-out duration-300 group-hover:bg-opacity-80 bg-opacity-60 z-[2]"

  return (
    <div>
      <div className="mb-4">
        <div onClick={togglePictureInPicture} className="flex group relative justify-center items-center">
          <div className="relative">
            <div className={videoStyle}></div>
            <video ref={videoRef} className={clsx("z-10 video-element", isMirrored ? "hidden" : "")} />
          </div>

          <video ref={hiddenVideoRef} className="hidden"></video>

          <div className="relative">
            <div className={videoStyle}></div>
            <video ref={mirroredVideoRef} className={clsx("z-10 video-element", isMirrored ? "" : "hidden")}></video>
          </div>

          <canvas ref={mirrorCanvasRef} className={"hidden"}></canvas>
          <div className="z-10 absolute m-auto">
            <button className="w-auto transition-transform transform group-hover:scale-105 min-w-fit hover:opacity-100 opacity-95 px-[22px] py-[18px] bg-yellow-400/90 rounded-2xl items-center justify-center gap-2 inline-flex">
              <PipIcon color="#000" className="h-5 w-5" />
              <div className="text-slate-900 text-lg">Open Camera in PIP</div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row bg-slate-800/50 p-5 rounded-lg justify-center items-center gap-4 mb-4">
        <select className="p-2 border-2 rounded-md" value={selectedDeviceId} onChange={handleDeviceChange}>
          <option value="">Default Camera</option>
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
        <div className="h-1 w-1 hidden md:block rounded-full bg-white/20"></div>
        <label htmlFor="ratio" className="space-x-3">
          <span className="text-white">Ratio de la caméra</span>

          <select
            id="ratio"
            name="ratio"
            className="p-2 border-2 rounded-md"
            value={aspectRatioOptions.findIndex((ar) => ar.value === selectedAspectRatio.value)}
            onChange={(e) => setSelectedAspectRatio(aspectRatioOptions[Number(e.target.value)])}
          >
            <option value="">Default Camera</option>
            {aspectRatioOptions.map((ar, idx) => (
              <option key={ar.value} value={idx}>
                {ar.label}
              </option>
            ))}
          </select>
        </label>

        <div className="h-1 w-1 hidden md:block rounded-full bg-white/20"></div>

        <label className="flex items-center" htmlFor={"mirror-switch"}>
          <Switch
            checked={isMirrored}
            id="mirror-switch"
            name="mirror-switch"
            onCheckedChange={(e) => setIsMirrored(e)}
          />
          <span>
            <span className="ml-2 text-white">Mirror camera</span>
          </span>
        </label>
      </div>


    </div>
  )
}

export default Camera
