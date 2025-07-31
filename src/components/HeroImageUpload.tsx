"use client"

import type React from "react"

import { useState } from "react"
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Image,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react"
import { Upload, X } from "lucide-react"
import { uploadMedia } from "@/utils/supabase/storage"
import { supabase } from "@/utils/supabase/client"

interface HeroImageUploadProps {
  currentHeroUrl?: string | null
  athleteId: string
  onUploadComplete: (url: string) => void
}

export function HeroImageUpload({ currentHeroUrl, athleteId, onUploadComplete }: HeroImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentHeroUrl || null)
  const toast = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setUploading(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Upload to hero-images bucket
      const result = await uploadMedia(file, user.id, "photo")

      if (!result.success || !result.url) {
        throw new Error(result.error || "Upload failed")
      }

      // Update athlete record with new hero image URL
      const { error: updateError } = await supabase
        .from("athletes")
        .update({
          hero_image_url: result.url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", athleteId)

      if (updateError) throw updateError

      setPreviewUrl(result.url)
      onUploadComplete(result.url)

      toast({
        title: "Hero image updated!",
        description: "Your custom hero image has been uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error: any) {
      console.error("Error uploading hero image:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload hero image",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    try {
      const { error } = await supabase
        .from("athletes")
        .update({
          hero_image_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", athleteId)

      if (error) throw error

      setPreviewUrl(null)
      onUploadComplete("")

      toast({
        title: "Hero image removed",
        description: "Your profile will now use the default sport hero image",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error: any) {
      console.error("Error removing hero image:", error)
      toast({
        title: "Error removing image",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Custom Hero Image</FormLabel>
        <Text fontSize="sm" color="gray.600" mb={4}>
          Upload a custom hero image for your profile. Recommended size: 1920x500px or larger.
        </Text>

        {previewUrl && (
          <Box position="relative" mb={4}>
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Hero image preview"
              w="full"
              h="200px"
              objectFit="cover"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            />
            <Button
              position="absolute"
              top={2}
              right={2}
              size="sm"
              colorScheme="red"
              variant="solid"
              leftIcon={<X size={14} />}
              onClick={handleRemoveImage}
            >
              Remove
            </Button>
          </Box>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          id="hero-image-upload"
        />

        <Button
          as="label"
          htmlFor="hero-image-upload"
          leftIcon={<Upload size={16} />}
          colorScheme="teal"
          variant="outline"
          isLoading={uploading}
          loadingText="Uploading..."
          cursor="pointer"
          w="full"
        >
          {previewUrl ? "Change Hero Image" : "Upload Hero Image"}
        </Button>
      </FormControl>

      <Alert status="info" size="sm">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Pro Feature</AlertTitle>
          <AlertDescription fontSize="xs">
            Custom hero images are available for Pro subscribers. The image will be displayed as the background of your
            profile header.
          </AlertDescription>
        </Box>
      </Alert>
    </VStack>
  )
}
