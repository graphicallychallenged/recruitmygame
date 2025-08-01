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
import { supabase } from "../utils/supabase/client"
import { deleteFile, extractStoragePath } from "../utils/supabase/storage"

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

  const handleUploadComplete = async (url: string) => {
    try {
      // Update the database with the new profile picture URL
      const { error } = await supabase.from("athletes").update({ profile_picture_url: url }).eq("user_id", userId)

      if (error) {
        console.error("Error updating profile picture in database:", error)
        toast({
          title: "Upload successful, but failed to save",
          description: "The image was uploaded but couldn't be saved to your profile. Please try again.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        })
        return
      }

      onImageUpdate(url)
      onClose()
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error("Error updating profile picture:", error)
      toast({
        title: "Error saving profile picture",
        description: "Please try again or contact support if the issue persists",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleDelete = async () => {
    if (!currentImageUrl) return

    try {
      // Extract path from URL for deletion using the helper function
      const pathInfo = extractStoragePath(currentImageUrl)

      if (pathInfo) {
        const success = await deleteFile(pathInfo.bucket, pathInfo.path)
        if (!success) {
          console.warn("Failed to delete file from storage, but continuing with database update")
        }
      }

      // Update database to remove profile picture URL
      const { error } = await supabase.from("athletes").update({ profile_picture_url: null }).eq("user_id", userId)

      if (error) {
        console.error("Error removing profile picture from database:", error)
        toast({
          title: "Error removing profile picture",
          description: "Failed to remove profile picture from your profile",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
        return
      }

      onImageUpdate("")
      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed",
        status: "info",
        duration: 3000,
        isClosable: true,
      })
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
            colorScheme="blue"
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
