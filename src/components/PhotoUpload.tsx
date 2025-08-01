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
import { supabase } from "@/utils/supabase/client"

interface PhotoUploadProps {
  onUploadComplete?: () => void
  onUploadStart?: () => void
  athleteId: string
  currentPhotoUrl?: string
  onDelete?: () => void
  multiple?: boolean
  maxFiles?: number
}

export function PhotoUpload({
  onUploadComplete,
  onUploadStart,
  athleteId,
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

  const savePhotoToDatabase = async (publicUrl: string) => {
    // Try different combinations based on what might be in the table
    const possibleInserts = [
      // Try with just the basic fields
      { athlete_id: athleteId, photo_url: publicUrl },
      // Try with caption
      { athlete_id: athleteId, photo_url: publicUrl, caption: null },
      // Try with is_public
      { athlete_id: athleteId, photo_url: publicUrl, is_public: true },
      // Try with both
      { athlete_id: athleteId, photo_url: publicUrl, caption: null, is_public: true },
      // Try with created_at
      {
        athlete_id: athleteId,
        photo_url: publicUrl,
        caption: null,
        is_public: true,
        created_at: new Date().toISOString(),
      },
    ]

    let lastError = null

    for (let i = 0; i < possibleInserts.length; i++) {
      const insertData = possibleInserts[i]
      try {
        console.log(`Attempt ${i + 1}: Inserting photo with data:`, insertData)
        const { data, error: dbError } = await supabase.from("athlete_photos").insert(insertData).select()

        if (!dbError) {
          console.log("Successfully inserted photo:", data)
          return data
        } else {
          console.log(`Attempt ${i + 1} failed with error:`, dbError)
          lastError = dbError
        }
      } catch (err) {
        console.log(`Attempt ${i + 1} threw exception:`, err)
        lastError = err
        continue
      }
    }

    // If all attempts failed, throw the last error
    console.error("All insert attempts failed. Last error:", lastError)
    throw lastError || new Error("Could not save photo to database")
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

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${athleteId}/${fileName}`

      console.log("Uploading photo to:", filePath)

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage.from("athlete-photos").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      clearInterval(progressInterval)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("athlete-photos").getPublicUrl(filePath)

      console.log("Photo uploaded successfully, URL:", publicUrl)

      // Save to database
      await savePhotoToDatabase(publicUrl)

      setUploadProgress(100)

      toast({
        title: "Photo uploaded successfully",
        description: "Your photo has been uploaded and saved",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      onUploadComplete?.()
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

        // Validate file
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} is too large (max 10MB)`)
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File ${file.name} is not a valid image type`)
        }

        // Generate unique filename
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `${athleteId}/${fileName}`

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage.from("athlete-photos").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("athlete-photos").getPublicUrl(filePath)

        // Save to database
        await savePhotoToDatabase(publicUrl)

        return { success: true, url: publicUrl }
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

        onUploadComplete?.()
      } else {
        throw new Error("All uploads failed")
      }
    } catch (err: any) {
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
