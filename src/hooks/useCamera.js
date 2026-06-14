import { useRef, useState, useCallback, useEffect } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [facingMode, setFacingMode] = useState('user') // 'user' = front, 'environment' = back
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const startCamera = useCallback(async (facing = facingMode) => {
    try {
      setError(null)
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }

      const constraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 960 },
          aspectRatio: { ideal: 4 / 3 }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setIsReady(true)
        }
      }
    } catch (err) {
      console.error('[lumi] Camera error:', err)
      setError(err.message || 'Camera access denied')
      setIsReady(false)
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsReady(false)
  }, [])

  const flipCamera = useCallback(() => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacing)
    startCamera(newFacing)
  }, [facingMode, startCamera])

  // Capture a single frame from the video to a canvas
  const captureFrame = useCallback((canvas, filter = 'none') => {
    if (!videoRef.current || !canvas) return null

    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // Mirror for front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.92)
  }, [facingMode])

// Countdown then capture — shows 0 briefly so CameraCanvas flash fires
  const captureWithCountdown = useCallback((canvas, seconds = 3, filter = 'none') => {
    return new Promise((resolve) => {
      setIsCapturing(true)
      let count = seconds
      setCountdown(count)

      const interval = setInterval(() => {
        count -= 1
        if (count <= 0) {
          clearInterval(interval)
          setCountdown(0)  // show 0 so the flash overlay triggers in CameraCanvas
          // Capture after one frame so the flash renders
          requestAnimationFrame(() => {
            const dataUrl = captureFrame(canvas, filter)
            setCountdown(null)
            setIsCapturing(false)
            resolve(dataUrl)
          })
        } else {
          setCountdown(count)
        }
      }, 1000)
    })
  }, [captureFrame])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  return {
    videoRef,
    isReady,
    facingMode,
    error,
    countdown,
    isCapturing,
    startCamera,
    stopCamera,
    flipCamera,
    captureFrame,
    captureWithCountdown
  }
}
