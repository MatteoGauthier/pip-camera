import React, { useRef, useEffect, useState, useCallback } from "react"
import { useLocalStorage } from "react-use"
import Switch from "./Switch"
import clsx from "clsx"

interface CameraProps {
  width?: number
  height?: number
}

// @xxx not working

const Camera: React.FC<CameraProps> = ({ width = 640, height = 480 }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mirroredVideoRef = useRef<HTMLVideoElement>(null)
  const hiddenVideoRef = useRef<HTMLVideoElement>(null)
  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useLocalStorage<string>("preferred-camera")
  const [isMirrored, setIsMirrored] = useState<boolean>(false)

  useEffect(() => {
    const video = videoRef.current

    if (video) {
      const onDevicesChange = () => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          console.log(devices)
          const videoDevices = devices.filter((device) => device.kind === "videoinput")
          setDevices(videoDevices)
        })
      }

      onDevicesChange()
    }
  }, [])

  function mirrorStream(stream: MediaStream) {
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

    const vid = document.createElement("video")
    vid.srcObject = stream
    // in case requestVideoFrameCallback is available, we use it
    // otherwise we fallback on rAF
    const scheduler = vid.requestVideoFrameCallback
      ? (cb: VideoFrameRequestCallback) => vid.requestVideoFrameCallback(cb)
      : requestAnimationFrame
    const draw = () => {
      const { videoWidth, videoHeight } = vid
      drawOnCanvas(vid, videoWidth, videoHeight)
      scheduler(draw)
    }
    vid.play().then(draw)
    return canvas.captureStream()
  }

  useEffect(() => {
    if (devices.length === 0) return

    const updateCameraStream = async () => {
      const constraints: MediaStreamConstraints =
        selectedDeviceId === ""
          ? { video: { facingMode: "user" }, audio: false }
          : { video: { deviceId: selectedDeviceId }, audio: false }

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)

        videoRef.current!.srcObject = stream
        videoRef.current!.play()

        const mirrored = mirrorStream(stream)

        const canvas = mirrorCanvasRef.current
        if (!canvas) return
        // first initialize a context
        const ctx = canvas.getContext("2d") // or whatever ('webgl', 'webgl2' ...)
        // then you can get the stream
        const canvasStream = canvas.captureStream(30)
        // const $video = $('#video');
        // $video[0].srcObject = stream;
        // $video[0].play();

        if (mirroredVideoRef.current && canvasStream) {
          mirroredVideoRef.current!.srcObject = canvasStream
          mirroredVideoRef.current.play()
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
      }
    }

    updateCameraStream()
  }, [devices.length, selectedDeviceId])

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
      <button
        onClick={togglePictureInPicture}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Toggle PIP
      </button>

      <div className="relative inline-block w-64">
        <select className="block appearance-none w-full px-4 py-2 pr-8 rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option>640x480</option>
          <option>1280x720</option>
          <option>1920x1080</option>
          <option>3840x2160</option>
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
      <Switch checked={isMirrored} onCheckedChange={(e) => setIsMirrored(e)} />
      <div>
        <h2>Default video</h2>
        <video
          ref={videoRef}
          className={clsx("transform", isMirrored ? "-scale-x-100" : "scale-x-100")}
          width={width}
          height={height}
        />

        <h2>Hidden video used for converting video to canvas to video</h2>
        <video ref={hiddenVideoRef} className="" width={width} height={height}></video>

        <h2>Mirrored Video using canvas</h2>
        <video ref={mirroredVideoRef} className="" width={width} height={height}></video>

        <h2>Canvas with video</h2>
        <canvas ref={mirrorCanvasRef} className=""></canvas>
      </div>
    </div>
  )
}

export default Camera
