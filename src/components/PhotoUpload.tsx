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
  Image,
  SimpleGrid,
} from "@chakra-ui/react"
import { Upload, X, ImageIcon } from "lucide-react"
import { uploadMedia, type UploadResult } from "@/utils/supabase/storage"

interface PhotoUploadProps {
  onUploadComplete?: (result: UploadResult) => void
  onUploadStart?: () => void
  userId: string
  currentPhotoUrl?: string
  onDelete?: () => void
  multiple?: boolean
  maxFiles?: number
}

export function PhotoUpload({
  onUploadComplete,
  onUploadStart,
  userId,
  currentPhotoUrl,
  onDelete,
  multiple = false,
  maxFiles = 5,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    if (multiple) {
      const fileArray = Array.from(files).slice(0, maxFiles)
      handleMultipleUpload(fileArray)
    } else {
      handleUpload(files[0])
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    setUploadProgress(0)
    onUploadStart?.()

    try {
      // Validate file size (10MB limit for photos)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error("File size must be less than 10MB")
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Please upload a valid image file (JPEG, PNG, WebP, or GIF)")
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await uploadMedia(file, userId, "photo")

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        toast({
          title: "Photo uploaded successfully",
          description: "Your photo has been uploaded and is ready to use",
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

  const handleMultipleUpload = async (files: File[]) => {
    setUploading(true)
    setError(null)
    setUploadProgress(0)
    onUploadStart?.()

    try {
      const uploadPromises = files.map(async (file, index) => {
        // Update progress based on file completion
        const baseProgress = (index / files.length) * 100
        setUploadProgress(baseProgress)

        const result = await uploadMedia(file, userId, "photo")
        return result
      })

      const results = await Promise.all(uploadPromises)
      setUploadProgress(100)

      // Only add successful uploads with valid URLs
      const successfulUrls: string[] = []
      results.forEach((result) => {
        if (result.success && result.url) {
          successfulUrls.push(result.url)
        }
      })

      setUploadedFiles((prev) => [...prev, ...successfulUrls])

      const successCount = results.filter((r) => r.success).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        toast({
          title: `${successCount} photo${successCount > 1 ? "s" : ""} uploaded successfully`,
          description: failCount > 0 ? `${failCount} photo${failCount > 1 ? "s" : ""} failed to upload` : undefined,
          status: failCount > 0 ? "warning" : "success",
          duration: 3000,
          isClosable: true,
        })

        // Return the first successful result for compatibility
        const firstSuccess = results.find((r) => r.success)
        if (firstSuccess) {
          onUploadComplete?.(firstSuccess)
        }
      } else {
        throw new Error("All uploads failed")
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  return (
    <VStack spacing={4} w="full">
      {/* Current photo preview */}
      {currentPhotoUrl && !multiple && (
        <Box position="relative" w="full">
          <Image
            src={currentPhotoUrl || "/placeholder.svg"}
            alt="Current photo"
            maxH="300px"
            w="full"
            objectFit="cover"
            borderRadius="md"
            border="1px"
            borderColor="gray.200"
          />
          {onDelete && (
            <IconButton
              aria-label="Delete current photo"
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

      {/* Multiple uploaded files preview */}
      {multiple && uploadedFiles.length > 0 && (
        <SimpleGrid columns={3} spacing={2} w="full">
          {uploadedFiles.map((url, index) => (
            <Box key={index} position="relative">
              <Image
                src={url || "/placeholder.svg"}
                alt={`Uploaded ${index + 1}`}
                aspectRatio="1"
                objectFit="cover"
                borderRadius="md"
              />
              <IconButton
                aria-label="Remove photo"
                icon={<X size={12} />}
                size="xs"
                colorScheme="red"
                position="absolute"
                top={1}
                right={1}
                onClick={() =>
                  setUploadedFiles((prev) => {
                    const newFiles = [...prev]
                    newFiles.splice(index, 1)
                    return newFiles
                  })
                }
              />
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Upload area */}
      <Box
        w="full"
        p={8}
        border="2px dashed"
        borderColor={dragActive ? "green.400" : "gray.300"}
        borderRadius="lg"
        bg={dragActive ? "green.50" : "gray.50"}
        textAlign="center"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ borderColor: "green.400", bg: "green.50" }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <VStack spacing={3}>
          <Box color={dragActive ? "green.500" : "gray.400"}>
            {uploading ? <Upload size={32} /> : <ImageIcon size={32} />}
          </Box>

          {uploading ? (
            <VStack spacing={2} w="full">
              <Text fontSize="sm" color="green.600">
                Uploading photo{multiple ? "s" : ""}...
              </Text>
              <Progress value={uploadProgress} colorScheme="green" w="full" />
              <Text fontSize="xs" color="gray.500">
                {uploadProgress}%
              </Text>
            </VStack>
          ) : (
            <>
              <Text fontSize="md" fontWeight="medium">
                Drop your photo{multiple ? "s" : ""} here, or click to browse
              </Text>
              <HStack spacing={2} wrap="wrap" justify="center">
                <Badge colorScheme="green">JPEG</Badge>
                <Badge colorScheme="green">PNG</Badge>
                <Badge colorScheme="green">WebP</Badge>
                <Badge colorScheme="green">GIF</Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Maximum file size: 10MB{multiple ? ` • Up to ${maxFiles} files` : ""}
              </Text>
            </>
          )}
        </VStack>
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
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
          colorScheme="green"
        >
          Choose Photo{multiple ? "s" : ""}
        </Button>
      )}
    </VStack>
  )
}
