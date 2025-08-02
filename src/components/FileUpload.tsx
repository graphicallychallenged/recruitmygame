"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Box, Text, VStack, HStack, Progress, Alert, AlertIcon, Image, IconButton, useToast } from "@chakra-ui/react"
import { Upload, X, File } from "lucide-react"
import { uploadFile, deleteFile, extractStoragePath } from "../utils/supabase/storage"

interface FileUploadProps {
  uploadOptions: {
    bucket: string
    folder?: string
    fileName?: string
    maxSizeBytes?: number
    allowedTypes?: string[]
  }
  accept?: string
  onUploadStart?: () => void
  onUploadComplete?: (url: string) => void
  onUploadError?: (error: string) => void
  onDelete?: () => void
  currentFileUrl?: string
  showPreview?: boolean
  multiple?: boolean
}

export function FileUpload({
  uploadOptions,
  accept = "*/*",
  onUploadStart,
  onUploadComplete,
  onUploadError,
  onDelete,
  currentFileUrl,
  showPreview = true,
  multiple = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentFileUrl || null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0] // Handle single file for now
    console.log("FileUpload: Selected file:", file.name, file.type, file.size)

    // Create preview for images
    if (file.type.startsWith("image/") && showPreview) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }

    // Start upload
    setUploading(true)
    setProgress(0)
    onUploadStart?.()

    try {
      console.log("FileUpload: Starting upload with options:", uploadOptions)

      const result = await uploadFile(file, uploadOptions)
      console.log("FileUpload: Upload result:", result)

      if (result.success && result.url) {
        console.log("FileUpload: Upload successful, URL:", result.url)
        setProgress(100)
        onUploadComplete?.(result.url)

        // Update preview to show the uploaded image
        if (file.type.startsWith("image/") && showPreview) {
          setPreviewUrl(result.url)
        }

        toast({
          title: "Upload successful",
          description: "File uploaded successfully",
          status: "success",
          duration: 3000,
        })
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error: any) {
      console.error("FileUpload: Upload error:", error)
      onUploadError?.(error.message)
      toast({
        title: "Upload failed",
        description: error.message,
        status: "error",
        duration: 5000,
      })
      // Reset preview on error
      setPreviewUrl(currentFileUrl || null)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDelete = async () => {
    if (!currentFileUrl) return

    try {
      const pathInfo = extractStoragePath(currentFileUrl)
      if (pathInfo) {
        await deleteFile(pathInfo.bucket, pathInfo.path)
      }
      setPreviewUrl(null)
      onDelete?.()
      toast({
        title: "File deleted",
        description: "File deleted successfully",
        status: "info",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Delete error:", error)
      toast({
        title: "Delete failed",
        description: error.message,
        status: "error",
        duration: 3000,
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const isImage = (url: string) => {
    return url && (url.includes("image") || /\.(jpg|jpeg|png|gif|webp)$/i.test(url))
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Upload Area */}
      <Box
        border="2px dashed"
        borderColor={dragOver ? "blue.400" : "gray.300"}
        borderRadius="lg"
        p={6}
        textAlign="center"
        cursor="pointer"
        bg={dragOver ? "blue.50" : "gray.50"}
        transition="all 0.2s"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <VStack spacing={3}>
          <Upload size={32} color={dragOver ? "#3182ce" : "#718096"} />
          <Text fontWeight="medium" color={dragOver ? "blue.600" : "gray.600"}>
            {dragOver ? "Drop file here" : "Click to upload or drag and drop"}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {uploadOptions.allowedTypes?.join(", ") || "Any file type"}
            {uploadOptions.maxSizeBytes && <> • Max {Math.round(uploadOptions.maxSizeBytes / (1024 * 1024))}MB</>}
          </Text>
        </VStack>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: "none" }}
        />
      </Box>

      {/* Upload Progress */}
      {uploading && (
        <Box>
          <Progress value={progress} colorScheme="blue" size="sm" />
          <Text fontSize="sm" color="gray.600" mt={1}>
            Uploading... {progress}%
          </Text>
        </Box>
      )}

      {/* Preview */}
      {showPreview && previewUrl && (
        <Box position="relative">
          <HStack justify="space-between" align="center" mb={2}>
            <Text fontSize="sm" fontWeight="medium">
              Preview
            </Text>
            {currentFileUrl && (
              <IconButton
                aria-label="Delete file"
                icon={<X size={16} />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={handleDelete}
              />
            )}
          </HStack>

          {isImage(previewUrl) ? (
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              maxH="200px"
              maxW="100%"
              objectFit="contain"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            />
          ) : (
            <HStack p={3} border="1px solid" borderColor="gray.200" borderRadius="md" bg="gray.50">
              <File size={20} />
              <Text fontSize="sm" isTruncated>
                {previewUrl.split("/").pop() || "File"}
              </Text>
            </HStack>
          )}
        </Box>
      )}

      {/* Error Display */}
      {!uploading && !previewUrl && currentFileUrl && (
        <Alert status="warning" size="sm">
          <AlertIcon />
          <Text fontSize="sm">Failed to load current file</Text>
        </Alert>
      )}
    </VStack>
  )
}
