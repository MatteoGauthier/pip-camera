import React, { useRef, useEffect, useState, useCallback } from "react"
import { useLocalStorage } from "react-use"
import Switch from "./Switch"
import clsx from "clsx"

const aspectRatioOptions = [
  {
    label: "1:1",
    value: 1,
  },
  {
    label: "3:4",
    value: 0.75,
  },
  {
    label: "16:9",
    value: 1.7777777778,
  },
  {
    label: "4:3",
    value: 1.3333333333,
  },
]

const Camera = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mirroredVideoRef = useRef<HTMLVideoElement>(null)
  const hiddenVideoRef = useRef<HTMLVideoElement>(null)
  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<1.7777777778 | 1 | 0.75 | number>(1)
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
            video: { facingMode: "user", aspectRatio: selectedAspectRatio },
            audio: false,
          } satisfies MediaStreamConstraints)
        : ({
            video: { deviceId: selectedDeviceId, aspectRatio: selectedAspectRatio },
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

  return (
    <div>
      <div className="flex justify-center mb-4">
        <select className="p-2 border-2 rounded-md" value={selectedDeviceId} onChange={handleDeviceChange}>
          <option value="">Default Camera</option>
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={togglePictureInPicture}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Toggle PIP
        </button>

        <div className="relative inline-block w-64">
          <select
            onChange={(e) => setSelectedAspectRatio(aspectRatioOptions[Number(e.target.value)].value)}
            className="block appearance-none w-full px-4 py-2 pr-8 rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {aspectRatioOptions.map((option, idx) => (
              <option key={option.label} value={idx}>
                {option.label}
              </option>
            ))}
            {/* Add more options as needed */}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M13.707 7.707a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 10.586l3.293-3.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <label className="flex items-center" htmlFor={"mirror-switch"}>
          <Switch
            checked={isMirrored}
            id="mirror-switch"
            name="mirror-switch"
            onCheckedChange={(e) => setIsMirrored(e)}
          />
          <span>
            <span className="ml-2">Mirror camera</span>
          </span>
        </label>
      </div>

      <div>
        <video ref={videoRef} className={clsx(isMirrored ? "hidden" : "")} />

        <video ref={hiddenVideoRef} className="hidden"></video>

        <video ref={mirroredVideoRef} className={clsx(isMirrored ? "" : "hidden")}></video>

        <canvas ref={mirrorCanvasRef} className={"hidden"}></canvas>
      </div>
    </div>
  )
}

export default Camera
