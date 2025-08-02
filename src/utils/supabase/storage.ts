import { supabase } from "./client"

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface UploadOptions {
  bucket: string
  folder?: string
  fileName?: string
  maxSizeBytes?: number
  allowedTypes?: string[]
}

// Default upload options
const DEFAULT_OPTIONS: Partial<UploadOptions> = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
}

// Generate unique filename
function generateFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split(".").pop()
  const baseName = prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
  return `${baseName}.${extension}`
}

// Validate file before upload
function validateFile(file: File, options: UploadOptions): string | null {
  // Check file size
  if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
    const maxMB = Math.round(options.maxSizeBytes / (1024 * 1024))
    return `File size must be less than ${maxMB}MB`
  }

  // Check file type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return `File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(", ")}`
  }

  return null
}

// Upload file to Supabase Storage
export async function uploadFile(file: File, options: UploadOptions): Promise<UploadResult> {
  try {
    console.log("Storage: Starting upload process")

    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error("Storage: User not authenticated", sessionError)
      return { success: false, error: "User not authenticated" }
    }

    console.log("Storage: User authenticated, user_id:", session.user.id)

    // Validate file
    const validationError = validateFile(file, { ...DEFAULT_OPTIONS, ...options })
    if (validationError) {
      console.error("Storage: File validation failed:", validationError)
      return { success: false, error: validationError }
    }

    // Generate file path - CRITICAL: use user_id as folder for storage policies
    const fileName = options.fileName || generateFileName(file.name)
    const filePath = `${session.user.id}/${fileName}`

    console.log(`Storage: Uploading file to: ${options.bucket}/${filePath}`)
    console.log(`Storage: File details:`, { name: file.name, type: file.type, size: file.size })

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from(options.bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Storage: Upload error:", error)
      return { success: false, error: error.message }
    }

    console.log("Storage: Upload successful, data:", data)

    // Get public URL
    const { data: urlData } = supabase.storage.from(options.bucket).getPublicUrl(data.path)

    console.log("Storage: Public URL generated:", urlData.publicUrl)

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error: any) {
    console.error("Storage: Upload exception:", error)
    return { success: false, error: error.message || "Upload failed" }
  }
}

// Upload blob to Supabase Storage (for thumbnails)
export async function uploadBlob(blob: Blob, options: UploadOptions): Promise<UploadResult> {
  try {
    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return { success: false, error: "User not authenticated" }
    }

    // Generate file path
    const fileName = options.fileName || `thumbnail_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`
    const filePath = `${session.user.id}/${fileName}`

    console.log(`Uploading blob to: ${options.bucket}/${filePath}`)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from(options.bucket).upload(filePath, blob, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Blob upload error:", error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(options.bucket).getPublicUrl(data.path)

    console.log("Blob upload successful:", { path: data.path, url: urlData.publicUrl })

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error: any) {
    console.error("Blob upload exception:", error)
    return { success: false, error: error.message || "Upload failed" }
  }
}

// Delete file from Supabase Storage
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error("Delete error:", error)
      return false
    }

    console.log("File deleted successfully:", path)
    return true
  } catch (error) {
    console.error("Delete exception:", error)
    return false
  }
}

// Get optimized image URL with transformations
export function getOptimizedImageUrl(
  bucket: string,
  path: string,
  options?: {
    width?: number
    height?: number
    quality?: number
    resize?: "cover" | "contain" | "fill"
  },
): string {
  const transformOptions: any = {}

  if (options?.width) transformOptions.width = options.width
  if (options?.height) transformOptions.height = options.height
  if (options?.quality) transformOptions.quality = options.quality
  if (options?.resize) transformOptions.resize = options.resize

  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: Object.keys(transformOptions).length > 0 ? transformOptions : undefined,
  })

  return data.publicUrl
}

// Get basic public URL without transformations
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Upload profile picture specifically
export async function uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: "profile-pictures",
    fileName: `profile_${Date.now()}.${file.name.split(".").pop()}`,
    maxSizeBytes: 5 * 1024 * 1024, // 5MB for profile pictures
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  })
}

// Upload media files (videos, photos) - Use user_id for folder structure to match storage policies
export async function uploadMedia(file: File, userId: string, type: "video" | "photo"): Promise<UploadResult> {
  const isVideo = type === "video"

  return uploadFile(file, {
    bucket: isVideo ? "athlete-videos" : "athlete-photos",
    maxSizeBytes: isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024, // 100MB for videos, 10MB for photos
    allowedTypes: isVideo
      ? ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"]
      : ["image/jpeg", "image/png", "image/webp", "image/gif"],
  })
}

// Upload video thumbnail specifically
export async function uploadVideoThumbnail(thumbnailBlob: Blob, userId: string): Promise<UploadResult> {
  return uploadBlob(thumbnailBlob, {
    bucket: "video-thumbnails",
    maxSizeBytes: 2 * 1024 * 1024, // 2MB for thumbnails
    allowedTypes: ["image/jpeg"],
  })
}

// Helper function to extract storage path from public URL
export function extractStoragePath(publicUrl: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(publicUrl)
    const pathParts = url.pathname.split("/")

    // Find the storage path structure: /storage/v1/object/public/{bucket}/{path}
    const storageIndex = pathParts.findIndex((part) => part === "storage")
    if (storageIndex === -1) return null

    const bucket = pathParts[storageIndex + 4] // /storage/v1/object/public/{bucket}
    const path = pathParts.slice(storageIndex + 5).join("/") // everything after bucket

    return { bucket, path }
  } catch (error) {
    console.error("Error extracting storage path:", error)
    return null
  }
}
