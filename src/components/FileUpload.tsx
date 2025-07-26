"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Box, Button, Text, VStack, Progress, Alert, AlertIcon, Image, IconButton, useToast } from "@chakra-ui/react"
import { Upload, X, ImageIcon, Video, File } from "lucide-react"

// Use relative import instead of @/ alias
import { uploadFile, type UploadOptions, type UploadResult } from "../utils/supabase/storage"

interface FileUploadProps {
  onUploadComplete?: (result: UploadResult) => void
  onUploadStart?: () => void
  uploadOptions: UploadOptions
  accept?: string
  multiple?: boolean
  preview?: boolean
  currentFileUrl?: string
  onDelete?: () => void
}

export function FileUpload({
  onUploadComplete,
  onUploadStart,
  uploadOptions,
  accept = "image/*",
  multiple = false,
  preview = true,
  currentFileUrl,
  onDelete,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0] // Handle single file for now
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    setUploadProgress(0)
    onUploadStart?.()

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await uploadFile(file, uploadOptions)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        toast({
          title: "Upload successful",
          description: "File uploaded successfully",
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

  const getFileIcon = () => {
    if (accept.includes("image")) return <ImageIcon size={24} />
    if (accept.includes("video")) return <Video size={24} />
    return <File size={24} />
  }

  const getFileTypeText = () => {
    if (accept.includes("image")) return "image"
    if (accept.includes("video")) return "video"
    return "file"
  }

  return (
    <VStack spacing={4} w="full">
      {/* Current file preview */}
      {preview && currentFileUrl && (
        <Box position="relative" w="full">
          <Image
            src={currentFileUrl || "/placeholder.svg"}
            alt="Current file"
            maxH="200px"
            w="full"
            objectFit="cover"
            borderRadius="md"
            border="1px"
            borderColor="gray.200"
          />
          {onDelete && (
            <IconButton
              aria-label="Delete current file"
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
          <Box color={dragActive ? "blue.500" : "gray.400"}>{uploading ? <Upload size={32} /> : getFileIcon()}</Box>

          {uploading ? (
            <VStack spacing={2} w="full">
              <Text fontSize="sm" color="blue.600">
                Uploading {getFileTypeText()}...
              </Text>
              <Progress value={uploadProgress} colorScheme="blue" w="full" />
              <Text fontSize="xs" color="gray.500">
                {uploadProgress}%
              </Text>
            </VStack>
          ) : (
            <>
              <Text fontSize="md" fontWeight="medium">
                Drop your {getFileTypeText()} here, or click to browse
              </Text>
              <Text fontSize="sm" color="gray.500">
                {uploadOptions.allowedTypes?.join(", ") || "All file types"} • Max{" "}
                {Math.round((uploadOptions.maxSizeBytes || 10485760) / (1024 * 1024))}MB
              </Text>
            </>
          )}
        </VStack>
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
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
        >
          Choose {getFileTypeText()}
        </Button>
      )}
    </VStack>
  )
}
