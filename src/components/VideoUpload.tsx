"use client"

import type React from "react"

import { useState, useRef } from "react"
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
} from "@chakra-ui/react"
import { Upload, X, Video } from "lucide-react"
import { uploadMedia, type UploadResult } from "@/utils/supabase/storage"

interface VideoUploadProps {
  onUploadComplete?: (result: UploadResult) => void
  onUploadStart?: () => void
  userId: string
  currentVideoUrl?: string
  onDelete?: () => void
}

export function VideoUpload({ onUploadComplete, onUploadStart, userId, currentVideoUrl, onDelete }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

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
      // Validate file size (100MB limit)
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
        setUploadProgress((prev) => Math.min(prev + 5, 90))
      }, 500)

      const result = await uploadMedia(file, userId, "video") // Pass userId directly

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        toast({
          title: "Video uploaded successfully",
          description: "Your video has been uploaded and is ready to use",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
        onUploadComplete?.(result)
      } else {
        setError(result.error || "Upload failed")
        toast({
          title: "Upload failed",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (err: any) {
      setError(err.message || "Upload failed")
      toast({
        title: "Upload failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <VStack spacing={4} w="full">
      {/* Current video preview */}
      {currentVideoUrl && (
        <Box position="relative" w="full">
          <Box bg="black" borderRadius="md" overflow="hidden" position="relative" aspectRatio="16/9">
            <video controls style={{ width: "100%", height: "100%", objectFit: "cover" }}>
              <source src={currentVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
          {onDelete && (
            <IconButton
              aria-label="Delete current video"
              icon={<X size={16} />}
              size="sm"
              colorScheme="red"
              position="absolute"
              top={2}
              right={2}
              onClick={onDelete}
            />
          )}
        </Box>
      )}

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
                Uploading video...
              </Text>
              <Progress value={uploadProgress} colorScheme="blue" w="full" />
              <Text fontSize="xs" color="gray.500">
                {uploadProgress}% - This may take a few minutes
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
                Maximum file size: 100MB
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
