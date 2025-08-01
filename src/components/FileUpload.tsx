"use client"

import type React from "react"
import { useRef, useState } from "react"
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Progress,
  Alert,
  AlertIcon,
  Image,
  IconButton,
  useToast,
} from "@chakra-ui/react"
import { Upload, X, File } from "lucide-react"
import { uploadFile, type UploadOptions } from "@/utils/supabase/storage"

interface FileUploadProps {
  onUploadComplete?: (url: string) => void
  onUploadStart?: () => void
  accept?: string
  multiple?: boolean
  preview?: boolean
  currentFileUrl?: string | null
  onDelete?: () => void
  maxSizeBytes?: number
  allowedTypes?: string[]
  uploadOptions?: UploadOptions
}

export function FileUpload({
  onUploadComplete,
  onUploadStart,
  accept = "*/*",
  multiple = false,
  preview = true,
  currentFileUrl,
  onDelete,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  allowedTypes = [],
  uploadOptions,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${Math.round(maxSizeBytes / (1024 * 1024))}MB`
    }

    if (allowedTypes.length > 0 && !allowedTypes.some((type) => file.type.includes(type))) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`
    }

    return null
  }

  const handleFileSelect = async (file: File) => {
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      toast({
        title: "Invalid file",
        description: validationError,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (!uploadOptions) {
      setError("Upload configuration missing")
      toast({
        title: "Configuration error",
        description: "Upload options not provided",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setError(null)
    setUploading(true)
    setUploadProgress(0)
    onUploadStart?.()

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      console.log("Starting upload with options:", uploadOptions)
      console.log("File details:", { name: file.name, size: file.size, type: file.type })

      // Use the storage utility function
      const result = await uploadFile(file, {
        ...uploadOptions,
        maxSizeBytes,
        allowedTypes: allowedTypes.length > 0 ? allowedTypes : uploadOptions.allowedTypes,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log("Upload result:", result)

      if (result.success && result.url) {
        onUploadComplete?.(result.url)
        toast({
          title: "Upload successful",
          description: "File has been uploaded successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || "Upload failed")
      toast({
        title: "Upload failed",
        description: err.message || "An error occurred during upload.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDelete = () => {
    onDelete?.()
    toast({
      title: "File removed",
      description: "File has been removed successfully.",
      status: "info",
      duration: 3000,
      isClosable: true,
    })
  }

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  }

  return (
    <VStack spacing={4} align="stretch">
      {currentFileUrl && preview && (
        <Box position="relative" borderRadius="md" overflow="hidden">
          {isImage(currentFileUrl) ? (
            <Image
              src={currentFileUrl || "/placeholder.svg"}
              alt="Current file"
              maxH="200px"
              objectFit="cover"
              w="100%"
            />
          ) : (
            <Box p={4} bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
              <HStack>
                <File size={24} />
                <Text>Current file</Text>
              </HStack>
            </Box>
          )}
          {onDelete && (
            <IconButton
              aria-label="Remove file"
              icon={<X size={16} />}
              size="sm"
              position="absolute"
              top={2}
              right={2}
              colorScheme="red"
              onClick={handleDelete}
            />
          )}
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <Box
        border="2px dashed"
        borderColor={uploading ? "blue.300" : "gray.300"}
        borderRadius="md"
        p={8}
        textAlign="center"
        cursor={uploading ? "not-allowed" : "pointer"}
        onClick={uploading ? undefined : handleClick}
        _hover={uploading ? {} : { borderColor: "blue.400", bg: "gray.50" }}
        transition="all 0.2s"
      >
        <VStack spacing={3}>
          <Upload size={32} color={uploading ? "#90CDF4" : "#A0AEC0"} />
          <VStack spacing={1}>
            <Text fontWeight="medium" color={uploading ? "blue.500" : "gray.600"}>
              {uploading ? "Uploading..." : "Click to upload file"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {accept === "image/*" ? "Images only" : "Any file type"} • Max {Math.round(maxSizeBytes / (1024 * 1024))}
              MB
            </Text>
          </VStack>
          {uploading && (
            <Box w="100%" maxW="200px">
              <Progress value={uploadProgress} colorScheme="blue" size="sm" />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {uploadProgress}% complete
              </Text>
            </Box>
          )}
        </VStack>
      </Box>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Button
        leftIcon={<Upload size={16} />}
        onClick={handleClick}
        isLoading={uploading}
        loadingText="Uploading..."
        variant="outline"
        size="sm"
      >
        Choose File
      </Button>
    </VStack>
  )
}
