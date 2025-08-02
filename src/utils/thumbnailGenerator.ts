export interface ThumbnailOptions {
  width?: number
  height?: number
  quality?: number
  timeOffset?: number // seconds into video to capture
}

export interface ThumbnailResult {
  success: boolean
  blob?: Blob
  dataUrl?: string
  error?: string
}

// Generate thumbnail from video file
export async function generateVideoThumbnail(
  videoFile: File,
  options: ThumbnailOptions = {},
): Promise<ThumbnailResult> {
  const { width = 320, height = 180, quality = 0.8, timeOffset = 1 } = options

  return new Promise((resolve) => {
    try {
      const video = document.createElement("video")
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        resolve({ success: false, error: "Canvas context not available" })
        return
      }

      video.crossOrigin = "anonymous"
      video.muted = true
      video.playsInline = true

      video.onloadedmetadata = () => {
        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Seek to the specified time offset
        video.currentTime = Math.min(timeOffset, video.duration)
      }

      video.onseeked = () => {
        try {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, width, height)

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const dataUrl = canvas.toDataURL("image/jpeg", quality)
                resolve({
                  success: true,
                  blob,
                  dataUrl,
                })
              } else {
                resolve({ success: false, error: "Failed to create thumbnail blob" })
              }

              // Cleanup
              video.remove()
              canvas.remove()
            },
            "image/jpeg",
            quality,
          )
        } catch (error: any) {
          resolve({ success: false, error: error.message })
        }
      }

      video.onerror = () => {
        resolve({ success: false, error: "Failed to load video for thumbnail generation" })
      }

      // Load the video file
      const videoUrl = URL.createObjectURL(videoFile)
      video.src = videoUrl

      // Cleanup URL after video loads
      video.onloadstart = () => {
        URL.revokeObjectURL(videoUrl)
      }
    } catch (error: any) {
      resolve({ success: false, error: error.message })
    }
  })
}

// Generate multiple thumbnails at different time offsets
export async function generateMultipleThumbnails(
  videoFile: File,
  count = 3,
  options: ThumbnailOptions = {},
): Promise<ThumbnailResult[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    const results: ThumbnailResult[] = []
    let currentIndex = 0

    video.crossOrigin = "anonymous"
    video.muted = true
    video.playsInline = true

    const generateNext = async () => {
      if (currentIndex >= count) {
        video.remove()
        resolve(results)
        return
      }

      const timeOffset = (video.duration / (count + 1)) * (currentIndex + 1)
      video.currentTime = timeOffset
    }

    video.onloadedmetadata = () => {
      generateNext()
    }

    video.onseeked = async () => {
      const result = await captureFrame(video, options)
      results.push(result)
      currentIndex++
      generateNext()
    }

    video.onerror = () => {
      resolve([{ success: false, error: "Failed to load video" }])
    }

    const videoUrl = URL.createObjectURL(videoFile)
    video.src = videoUrl

    video.onloadstart = () => {
      URL.revokeObjectURL(videoUrl)
    }
  })
}

// Helper function to capture frame from video element
async function captureFrame(video: HTMLVideoElement, options: ThumbnailOptions = {}): Promise<ThumbnailResult> {
  const { width = 320, height = 180, quality = 0.8 } = options

  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        resolve({ success: false, error: "Canvas context not available" })
        return
      }

      canvas.width = width
      canvas.height = height

      ctx.drawImage(video, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const dataUrl = canvas.toDataURL("image/jpeg", quality)
            resolve({
              success: true,
              blob,
              dataUrl,
            })
          } else {
            resolve({ success: false, error: "Failed to create thumbnail blob" })
          }
          canvas.remove()
        },
        "image/jpeg",
        quality,
      )
    } catch (error: any) {
      resolve({ success: false, error: error.message })
    }
  })
}

// Get video duration without playing
export function getVideoDuration(videoFile: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true

    video.onloadedmetadata = () => {
      resolve(video.duration)
      video.remove()
    }

    video.onerror = () => {
      reject(new Error("Failed to load video metadata"))
      video.remove()
    }

    const videoUrl = URL.createObjectURL(videoFile)
    video.src = videoUrl

    video.onloadstart = () => {
      URL.revokeObjectURL(videoUrl)
    }
  })
}
