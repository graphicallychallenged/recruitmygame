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
import { Upload, X, ImageIcon } from "lucide-react"
import { supabase } from "@/utils/supabase/client"

interface PhotoUploadProps {
  onUploadComplete?: (photoUrl?: string) => void
  onUploadStart?: () => void
  athleteId: string
  currentPhotoUrl?: string
  onDelete?: () => void
}

export function PhotoUpload({
  onUploadComplete,
  onUploadStart,
  athleteId,
  currentPhotoUrl,
  onDelete,
}: PhotoUploadProps) {
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
      // Get current session to ensure user is authenticated
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        throw new Error("User not authenticated. Please log in and try again.")
      }

      console.log("User authenticated:", session.user.id)

      // Validate file size (10MB limit for photos)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error("File size must be less than 10MB")
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Please upload a valid image file (JPEG, PNG, or WebP)")
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `photo_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      // Use user_id for folder structure to match storage policies
      const filePath = `${session.user.id}/${fileName}`

      console.log("Uploading photo to path:", filePath)
      console.log("File details:", {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage.from("athlete-photos").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      clearInterval(progressInterval)

      if (uploadError) {
        console.error("Storage upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log("Storage upload successful:", data)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("athlete-photos").getPublicUrl(data.path)

      console.log("Photo uploaded successfully, URL:", publicUrl)

      // Update the form data with the new photo URL
      onUploadComplete?.(publicUrl)

      setUploadProgress(100)

      toast({
        title: "Photo uploaded successfully",
        description: "Your photo has been uploaded. Add a caption and save.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
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

  return (
    <VStack spacing={4} w="full">
      {/* Current photo preview */}
      {currentPhotoUrl && (
        <Box position="relative" w="full">
          <Box bg="gray.100" borderRadius="md" overflow="hidden" position="relative" aspectRatio="16/9">
            <img
              src={currentPhotoUrl || "/placeholder.svg"}
              alt="Current photo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
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
            {uploading ? <Upload size={32} /> : <ImageIcon size={32} />}
          </Box>

          {uploading ? (
            <VStack spacing={2} w="full">
              <Text fontSize="sm" color="blue.600">
                Uploading photo...
              </Text>
              <Progress value={uploadProgress} colorScheme="blue" w="full" />
              <Text fontSize="xs" color="gray.500">
                {uploadProgress}%
              </Text>
            </VStack>
          ) : (
            <>
              <Text fontSize="md" fontWeight="medium">
                Drop your photo here, or click to browse
              </Text>
              <HStack spacing={2} wrap="wrap" justify="center">
                <Badge colorScheme="blue">JPEG</Badge>
                <Badge colorScheme="blue">PNG</Badge>
                <Badge colorScheme="blue">WebP</Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Maximum file size: 10MB
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
          Choose Photo File
        </Button>
      )}
    </VStack>
  )
}
