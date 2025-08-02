"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Box,
  Button,
  Text,
  VStack,
  Progress,
  Alert,
  AlertIcon,
  IconButton,
  useToast,
  HStack,
  Badge,
  Image,
} from "@chakra-ui/react"
import { Upload, X, Video } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { generateVideoThumbnail } from "@/utils/thumbnailGenerator"
import { uploadVideoThumbnail } from "@/utils/supabase/storage"

interface VideoUploadProps {
  onUploadComplete?: (videoUrl: string, thumbnailUrl?: string) => void
  onUploadStart?: () => void
  athleteId: string
  currentVideoUrl?: string
  currentThumbnailUrl?: string
  onDelete?: () => void
}

export function VideoUpload({
  onUploadComplete,
  onUploadStart,
  athleteId,
  currentVideoUrl,
  currentThumbnailUrl,
  onDelete,
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>(currentVideoUrl || "")
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState<string>(currentThumbnailUrl || "")
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  // Update uploaded URLs when props change
  useEffect(() => {
    setUploadedVideoUrl(currentVideoUrl || "")
    setUploadedThumbnailUrl(currentThumbnailUrl || "")
  }, [currentVideoUrl, currentThumbnailUrl])

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    setUploadProgress(0)
    onUploadStart?.()

    try {
      // Get current session to ensure user is authenticated
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        throw new Error(`Session error: ${sessionError.message}`)
      }

      if (!session) {
        console.error("No session found")
        throw new Error("User not authenticated. Please log in and try again.")
      }

      console.log("User authenticated:", {
        userId: session.user.id,
        email: session.user.email,
      })

      // Validate file size (100MB limit for videos)
      const maxSize = 100 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error("File size must be less than 100MB")
      }

      // Validate file type
      const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"]
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Please upload a valid video file (MP4, WebM, MOV, or AVI)")
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 70))
      }, 200)

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      // Use user_id for folder structure to match storage policies
      const filePath = `${session.user.id}/${fileName}`

      console.log("Uploading video to path:", filePath)
      console.log("File details:", {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage.from("athlete-videos").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("Storage upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log("Storage upload successful:", data)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("athlete-videos").getPublicUrl(data.path)

      console.log("Video uploaded successfully, URL:", publicUrl)

      // Update progress
      setUploadProgress(75)

      // Generate thumbnail
      setGeneratingThumbnail(true)
      console.log("Generating thumbnail...")

      const thumbnailResult = await generateVideoThumbnail(file, {
        width: 640,
        height: 360,
        quality: 0.8,
        timeOffset: 2, // Capture at 2 seconds
      })

      let thumbnailUrl: string | undefined

      if (thumbnailResult.success && thumbnailResult.blob) {
        console.log("Thumbnail generated, uploading...")

        // Upload thumbnail to storage
        const thumbnailUploadResult = await uploadVideoThumbnail(thumbnailResult.blob, session.user.id)

        if (thumbnailUploadResult.success && thumbnailUploadResult.url) {
          thumbnailUrl = thumbnailUploadResult.url
          setUploadedThumbnailUrl(thumbnailUrl)
          console.log("Thumbnail uploaded successfully:", thumbnailUrl)
        } else {
          console.warn("Thumbnail upload failed:", thumbnailUploadResult.error)
        }
      } else {
        console.warn("Thumbnail generation failed:", thumbnailResult.error)
      }

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Set the uploaded video URL for preview
      setUploadedVideoUrl(publicUrl)

      toast({
        title: "Video uploaded successfully",
        description: thumbnailUrl
          ? "Video and thumbnail ready to save"
          : "Video ready to save (thumbnail generation failed)",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      // Call completion callback with video URL and thumbnail URL
      onUploadComplete?.(publicUrl, thumbnailUrl)
    } catch (err: any) {
      console.error("Upload failed:", err)
      const errorMessage = err.message || err.code || "Upload failed"
      setError(errorMessage)
      toast({
        title: "Upload failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setUploading(false)
      setGeneratingThumbnail(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleDelete = async () => {
    if (uploadedVideoUrl) {
      try {
        // Extract file path from URL for storage deletion
        const urlParts = uploadedVideoUrl.split("/")
        const fileName = urlParts[urlParts.length - 1]
        const userId = urlParts[urlParts.length - 2]
        const filePath = `${userId}/${fileName}`

        // Delete video from storage
        const { error: storageError } = await supabase.storage.from("athlete-videos").remove([filePath])
        if (storageError) {
          console.warn("Video storage deletion failed:", storageError)
        }

        // Delete thumbnail if exists
        if (uploadedThumbnailUrl) {
          const thumbnailParts = uploadedThumbnailUrl.split("/")
          const thumbnailFileName = thumbnailParts[thumbnailParts.length - 1]
          const thumbnailPath = `${userId}/${thumbnailFileName}`

          const { error: thumbnailError } = await supabase.storage.from("video-thumbnails").remove([thumbnailPath])
          if (thumbnailError) {
            console.warn("Thumbnail storage deletion failed:", thumbnailError)
          }
        }

        setUploadedVideoUrl("")
        setUploadedThumbnailUrl("")
        onDelete?.()

        toast({
          title: "Video removed",
          description: "Video and thumbnail have been deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } catch (err: any) {
        toast({
          title: "Delete failed",
          description: err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  // Show uploaded video preview
  if (uploadedVideoUrl) {
    return (
      <VStack spacing={4} w="full">
        <Alert status="success" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">Video uploaded! Add title and description below, then save.</Text>
        </Alert>

        {/* Video Preview with Thumbnail */}
        <Box position="relative" w="full">
          <Box bg="black" borderRadius="md" overflow="hidden" position="relative" aspectRatio="16/9">
            {uploadedThumbnailUrl ? (
              <Box position="relative" w="full" h="full">
                <Image
                  src={uploadedThumbnailUrl || "/placeholder.svg"}
                  alt="Video thumbnail"
                  objectFit="cover"
                  w="full"
                  h="full"
                />
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  bg="blackAlpha.700"
                  borderRadius="full"
                  p={3}
                >
                  <Video size={24} color="white" />
                </Box>
              </Box>
            ) : (
              <video controls style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                <source src={uploadedVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </Box>
          <IconButton
            aria-label="Delete video"
            icon={<X size={16} />}
            size="sm"
            colorScheme="red"
            position="absolute"
            top={2}
            right={2}
            onClick={handleDelete}
          />
        </Box>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setUploadedVideoUrl("")
            setUploadedThumbnailUrl("")
          }}
        >
          Upload Different Video
        </Button>
      </VStack>
    )
  }

  return (
    <VStack spacing={4} w="full">
      {/* Upload area */}
      <Box
        w="full"
        p={8}
        border="2px dashed"
        borderColor={dragActive ? "blue.400" : "gray.300"}
        borderRadius="lg"
        bg={dragActive ? "blue.50" : "gray.50"}
        textAlign="center"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ borderColor: "blue.400", bg: "blue.50" }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <VStack spacing={3}>
          <Box color={dragActive ? "blue.500" : "gray.400"}>
            {uploading ? <Upload size={32} /> : <Video size={32} />}
          </Box>

          {uploading ? (
            <VStack spacing={2} w="full">
              <Text fontSize="sm" color="blue.600">
                {generatingThumbnail ? "Generating thumbnail..." : "Uploading video..."}
              </Text>
              <Progress value={uploadProgress} colorScheme="blue" w="full" />
              <Text fontSize="xs" color="gray.500">
                {uploadProgress}%
              </Text>
            </VStack>
          ) : (
            <>
              <Text fontSize="md" fontWeight="medium">
                Drop your video here, or click to browse
              </Text>
              <HStack spacing={2} wrap="wrap" justify="center">
                <Badge colorScheme="blue">MP4</Badge>
                <Badge colorScheme="blue">WebM</Badge>
                <Badge colorScheme="blue">MOV</Badge>
                <Badge colorScheme="blue">AVI</Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Maximum file size: 100MB • Thumbnail auto-generated
              </Text>
            </>
          )}
        </VStack>
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: "none" }}
      />

      {/* Error message */}
      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">{error}</Text>
        </Alert>
      )}

      {/* Upload button as alternative */}
      {!uploading && (
        <Button
          leftIcon={<Upload size={16} />}
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
        >
          Choose Video File
        </Button>
      )}
    </VStack>
  )
}
