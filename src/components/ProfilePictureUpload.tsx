"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Box,
  Button,
  Avatar,
  VStack,
  Text,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  HStack,
  Badge,
} from "@chakra-ui/react"
import { Upload, Camera } from "lucide-react"
import { supabase } from "@/utils/supabase/client"

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null
  onImageUpdate: (url: string) => void
  userId: string
  athleteName: string
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  disabled?: boolean
}

export function ProfilePictureUpload({
  currentImageUrl,
  onImageUpdate,
  userId,
  athleteName,
  size = "xl",
  disabled = false,
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return
    const file = files[0]
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    if (disabled) return

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        throw new Error("User not authenticated")
      }

      console.log("ProfilePictureUpload: User authenticated:", session.user.id)

      // Validate file
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 5MB")
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Please upload a valid image file (JPEG, PNG, or WebP)")
      }

      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      // Generate filename
      const fileExt = file.name.split(".").pop()
      const fileName = `profile_${Date.now()}.${fileExt}`
      const filePath = `${session.user.id}/${fileName}`

      console.log("ProfilePictureUpload: Uploading to:", filePath)

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage.from("profile-pictures").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      clearInterval(progressInterval)

      if (uploadError) {
        console.error("ProfilePictureUpload: Upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pictures").getPublicUrl(data.path)

      console.log("ProfilePictureUpload: Received URL from upload:", publicUrl)

      // Update athlete profile in database
      console.log("ProfilePictureUpload: Updating database for user_id:", session.user.id)
      const { error: updateError } = await supabase
        .from("athletes")
        .update({
          profile_picture_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", session.user.id)

      if (updateError) {
        console.error("ProfilePictureUpload: Database update error:", updateError)
        throw new Error(`Failed to update profile: ${updateError.message}`)
      }

      console.log("ProfilePictureUpload: Database updated successfully")

      setUploadProgress(100)
      onImageUpdate(publicUrl)

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (err: any) {
      console.error("ProfilePictureUpload: Upload failed:", err)
      const errorMessage = err.message || "Upload failed"
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
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  return (
    <VStack spacing={4}>
      {/* Avatar Display */}
      <Box position="relative">
        <Avatar
          size={size}
          src={currentImageUrl || undefined}
          name={athleteName}
          bg="blue.500"
          color="white"
          border="4px solid"
          borderColor="white"
          shadow="lg"
        />
        {!disabled && (
          <Box
            position="absolute"
            bottom={0}
            right={0}
            bg="blue.500"
            borderRadius="full"
            p={2}
            border="2px solid white"
            cursor="pointer"
            _hover={{ bg: "blue.600" }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={16} color="white" />
          </Box>
        )}
      </Box>

      {/* Upload Area */}
      {!disabled && (
        <Box
          w="full"
          maxW="300px"
          p={4}
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
          <VStack spacing={2}>
            {uploading ? (
              <>
                <Upload size={24} color="blue" />
                <Text fontSize="sm" color="blue.600">
                  Uploading...
                </Text>
                <Progress value={uploadProgress} colorScheme="blue" w="full" size="sm" />
                <Text fontSize="xs" color="gray.500">
                  {uploadProgress}%
                </Text>
              </>
            ) : (
              <>
                <Upload size={24} color="gray" />
                <Text fontSize="sm" fontWeight="medium">
                  Drop photo here or click to browse
                </Text>
                <HStack spacing={1}>
                  <Badge colorScheme="blue" size="sm">
                    JPEG
                  </Badge>
                  <Badge colorScheme="blue" size="sm">
                    PNG
                  </Badge>
                  <Badge colorScheme="blue" size="sm">
                    WebP
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Max 5MB
                </Text>
              </>
            )}
          </VStack>
        </Box>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: "none" }}
        disabled={disabled}
      />

      {/* Error message */}
      {error && (
        <Alert status="error" borderRadius="md" maxW="300px">
          <AlertIcon />
          <Text fontSize="sm">{error}</Text>
        </Alert>
      )}

      {/* Upload button */}
      {!disabled && !uploading && (
        <Button
          leftIcon={<Upload size={16} />}
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          colorScheme="blue"
        >
          Change Photo
        </Button>
      )}
    </VStack>
  )
}
