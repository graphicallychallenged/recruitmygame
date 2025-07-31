"use client"

import { useState } from "react"
import {
  Box,
  Avatar,
  Button,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react"
import { Camera } from "lucide-react"
import { FileUpload } from "./FileUpload"

// Import storage utilities - let's be very explicit about the path
import { deleteFile, extractStoragePath, type UploadResult } from "../utils/supabase/storage"

interface ProfilePictureUploadProps {
  currentImageUrl?: string
  onImageUpdate: (imageUrl: string) => void
  userId: string
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  athleteName?: string
}

export function ProfilePictureUpload({
  currentImageUrl,
  onImageUpdate,
  userId,
  size = "xl",
  athleteName = "Profile Picture",
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const handleUploadComplete = (result: UploadResult) => {
    if (result.success && result.url) {
      onImageUpdate(result.url)
      onClose()
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDelete = async () => {
    if (!currentImageUrl) return

    try {
      // Extract path from URL for deletion using the helper function
      const pathInfo = extractStoragePath(currentImageUrl)

      if (!pathInfo) {
        console.error("Could not extract storage path from URL:", currentImageUrl)
        return
      }

      const success = await deleteFile(pathInfo.bucket, pathInfo.path)
      if (success) {
        onImageUpdate("")
        toast({
          title: "Profile picture removed",
          description: "Your profile picture has been removed",
          status: "info",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error)
      toast({
        title: "Error",
        description: "Failed to delete profile picture",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <>
      <VStack spacing={4}>
        <Box position="relative">
          <Avatar src={currentImageUrl} size={size} name={athleteName} />
          <Button
            position="absolute"
            bottom={0}
            right={0}
            size="sm"
            borderRadius="full"
            colorScheme="teal"
            onClick={onOpen}
            leftIcon={<Camera size={14} />}
          >
            {currentImageUrl ? "Change" : "Add"}
          </Button>
        </Box>

        {currentImageUrl && (
          <Button size="xs" variant="ghost" colorScheme="red" onClick={handleDelete}>
            Remove Picture
          </Button>
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Profile Picture</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FileUpload
              uploadOptions={{
                bucket: "profile-pictures",
                folder: userId,
                maxSizeBytes: 5 * 1024 * 1024, // 5MB
                allowedTypes: ["image/jpeg", "image/png", "image/webp"],
              }}
              accept="image/*"
              onUploadStart={() => setUploading(true)}
              onUploadComplete={handleUploadComplete}
              currentFileUrl={currentImageUrl}
              onDelete={handleDelete}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
