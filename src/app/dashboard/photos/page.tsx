"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Alert,
  AlertIcon,
  Badge,
  useToast,
  Spinner,
  Center,
  Progress,
  Image,
  AspectRatio,
  SimpleGrid,
} from "@chakra-ui/react"
import { Plus, Edit, Trash2, ImageIcon, Eye, Download } from "lucide-react"
import { PhotoUpload } from "@/components/PhotoUpload"
import { getSubscriptionLimits, canUploadMore, getUpgradeMessage, type SubscriptionTier } from "@/utils/subscription"
import { deleteFile, extractStoragePath, getOptimizedImageUrl } from "@/utils/supabase/storage"
import Link from "next/link"

interface Photo {
  id: string
  caption: string
  photo_url: string
  created_at: string
  updated_at: string
}

export default function PhotosPage() {
  const [athlete, setAthlete] = useState<any>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isViewerOpen, onOpen: onViewerOpen, onClose: onViewerClose } = useDisclosure()
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null)
  const [formData, setFormData] = useState({
    caption: "",
    photo_url: "",
  })
  const toast = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      // Fetch athlete profile
      const { data: athleteData } = await supabase.from("athletes").select("*").eq("user_id", session.user.id).single()

      if (athleteData) {
        setAthlete(athleteData)
        setSubscriptionTier(athleteData.subscription_tier || "free")

        // Fetch photos
        const { data: photosData, error } = await supabase
          .from("athlete_photos")
          .select("*")
          .eq("athlete_id", athleteData.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setPhotos(photosData || [])
      }
    } catch (error: any) {
      toast({
        title: "Error loading photos",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!athlete || !formData.photo_url) return

    setSaving(true)
    try {
      const photoData = {
        ...formData,
        athlete_id: athlete.id,
        updated_at: new Date().toISOString(),
      }

      if (editingPhoto) {
        // Update existing photo
        const { error } = await supabase.from("athlete_photos").update(photoData).eq("id", editingPhoto.id)
        if (error) throw error
        toast({
          title: "Photo updated",
          description: "Your photo has been updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        // Create new photo
        const { error } = await supabase.from("athlete_photos").insert({
          ...photoData,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
        toast({
          title: "Photo added",
          description: "Your photo has been added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }

      // Refresh data and close modal
      await fetchData()
      handleCloseModal()
    } catch (error: any) {
      toast({
        title: "Error saving photo",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (photo: Photo) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    try {
      // Delete from database
      const { error } = await supabase.from("athlete_photos").delete().eq("id", photo.id)
      if (error) throw error

      // Delete file from storage if it's a direct upload
      if (photo.photo_url.includes("supabase")) {
        const pathInfo = extractStoragePath(photo.photo_url)
        if (pathInfo) {
          await deleteFile(pathInfo.bucket, pathInfo.path)
        }
      }

      toast({
        title: "Photo deleted",
        description: "Your photo has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      await fetchData()
    } catch (error: any) {
      toast({
        title: "Error deleting photo",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleEdit = (photo: Photo) => {
    setEditingPhoto(photo)
    setFormData({
      caption: photo.caption,
      photo_url: photo.photo_url,
    })
    onOpen()
  }

  const handleView = (photo: Photo) => {
    setViewingPhoto(photo)
    onViewerOpen()
  }

  const handleCloseModal = () => {
    setEditingPhoto(null)
    setFormData({
      caption: "",
      photo_url: "",
    })
    onClose()
  }

  const handlePhotoUpload = () => {
    // Refresh data after upload
    fetchData()
  }

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.photo_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `photo-${photo.id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the photo",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  if (!athlete) {
    return (
      <VStack spacing={6} textAlign="center" py={12}>
        <Heading size="lg">Create Your Profile First</Heading>
        <Text color="gray.600">You need to create your athlete profile before managing photos.</Text>
        <Link href="/dashboard/profile">
          <Button colorScheme="blue" size="lg">
            Create Profile
          </Button>
        </Link>
      </VStack>
    )
  }

  const limits = getSubscriptionLimits(subscriptionTier)
  const canAddMore = canUploadMore(photos.length, subscriptionTier, "photos")

  return (
    <Container maxW="6xl">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" mb={2}>
              Photo Gallery
            </Heading>
            <HStack spacing={4}>
              <Text color="gray.600">
                {photos.length} of {limits.photos} photos used
              </Text>
              <Badge
                colorScheme={subscriptionTier === "free" ? "gray" : subscriptionTier === "premium" ? "blue" : "purple"}
              >
                {subscriptionTier.toUpperCase()}
              </Badge>
            </HStack>
          </Box>
          <Button
            leftIcon={<Plus size={20} />}
            colorScheme="blue"
            onClick={onOpen}
            isDisabled={!canAddMore}
            size={{ base: "sm", md: "md" }}
          >
            Add Photo
          </Button>
        </Flex>

        {/* Usage Progress */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="medium">
                  Photo Usage
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {photos.length} / {limits.photos}
                </Text>
              </Flex>
              <Progress
                value={(photos.length / limits.photos) * 100}
                colorScheme={photos.length >= limits.photos ? "red" : "green"}
                size="sm"
              />
              {!canAddMore && (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">{getUpgradeMessage(subscriptionTier, "photos")}</Text>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <Card>
            <CardBody py={12} textAlign="center">
              <VStack spacing={4}>
                <Box color="gray.400">
                  <ImageIcon size={48} />
                </Box>
                <Heading size="md" color="gray.600">
                  No photos yet
                </Heading>
                <Text color="gray.500" maxW="md">
                  Add your first photos to showcase your athletic achievements, team moments, and training sessions.
                </Text>
                <Button leftIcon={<Plus size={16} />} colorScheme="blue" onClick={onOpen} isDisabled={!canAddMore}>
                  Add Your First Photo
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={4}>
            {photos.map((photo) => (
              <Card
                key={photo.id}
                overflow="hidden"
                cursor="pointer"
                _hover={{ transform: "scale(1.02)" }}
                transition="all 0.2s"
              >
                <CardBody p={0}>
                  <VStack spacing={0} align="stretch">
                    {/* Photo */}
                    <AspectRatio ratio={1}>
                      <Image
                        src={getOptimizedImageUrl("athlete-photos", extractStoragePath(photo.photo_url)?.path || "", {
                          width: 300,
                          height: 300,
                          resize: "cover",
                          quality: 80,
                        })}
                        alt={photo.caption || "Athlete photo"}
                        objectFit="cover"
                        onClick={() => handleView(photo)}
                        fallback={
                          <Box
                            bg="gray.100"
                            w="full"
                            h="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <ImageIcon size={24} color="gray.400" />
                          </Box>
                        }
                      />
                    </AspectRatio>

                    {/* Photo Info & Actions */}
                    <Box p={3}>
                      <VStack align="stretch" spacing={2}>
                        {photo.caption && (
                          <Text fontSize="xs" noOfLines={2} color="gray.700">
                            {photo.caption}
                          </Text>
                        )}

                        <Text fontSize="xs" color="gray.500">
                          {new Date(photo.created_at).toLocaleDateString()}
                        </Text>

                        {/* Actions */}
                        <HStack spacing={1} justify="center">
                          <IconButton
                            aria-label="View photo"
                            icon={<Eye size={14} />}
                            size="xs"
                            variant="ghost"
                            onClick={() => handleView(photo)}
                          />
                          <IconButton
                            aria-label="Edit photo"
                            icon={<Edit size={14} />}
                            size="xs"
                            variant="ghost"
                            onClick={() => handleEdit(photo)}
                          />
                          <IconButton
                            aria-label="Download photo"
                            icon={<Download size={14} />}
                            size="xs"
                            variant="ghost"
                            onClick={() => handleDownload(photo)}
                          />
                          <IconButton
                            aria-label="Delete photo"
                            icon={<Trash2 size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(photo)}
                          />
                        </HStack>
                      </VStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Add/Edit Photo Modal */}
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{editingPhoto ? "Edit Photo" : "Add New Photo"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Caption</FormLabel>
                    <Textarea
                      value={formData.caption}
                      onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                      placeholder="Describe this photo..."
                      rows={3}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Photo</FormLabel>
                    <PhotoUpload
                      onUploadComplete={(photoUrl) => {
                        if (photoUrl) {
                          setFormData({ ...formData, photo_url: photoUrl })
                        }
                      }}
                      athleteId={athlete.id}
                      currentPhotoUrl={formData.photo_url}
                      onDelete={() => setFormData({ ...formData, photo_url: "" })}
                    />
                  </FormControl>

                  <HStack spacing={3} w="full" pt={4}>
                    <Button variant="ghost" onClick={handleCloseModal} flex={1}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      isLoading={saving}
                      loadingText={editingPhoto ? "Updating..." : "Adding..."}
                      flex={1}
                      isDisabled={!formData.photo_url}
                    >
                      {editingPhoto ? "Update Photo" : "Add Photo"}
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Photo Viewer Modal */}
        <Modal isOpen={isViewerOpen} onClose={onViewerClose} size="6xl">
          <ModalOverlay bg="blackAlpha.900" />
          <ModalContent bg="transparent" shadow="none" maxW="90vw" maxH="90vh">
            <ModalCloseButton color="white" size="lg" zIndex={2} />
            <ModalBody p={0} display="flex" alignItems="center" justifyContent="center">
              {viewingPhoto && (
                <VStack spacing={4} w="full" h="full" justify="center">
                  <Box maxW="full" maxH="80vh" position="relative">
                    <Image
                      src={viewingPhoto.photo_url || "/placeholder.svg"}
                      alt={viewingPhoto.caption || "Athlete photo"}
                      maxW="full"
                      maxH="80vh"
                      objectFit="contain"
                      borderRadius="md"
                    />

                    {/* Action buttons overlay */}
                    <HStack
                      position="absolute"
                      bottom={4}
                      right={4}
                      spacing={2}
                      bg="blackAlpha.700"
                      p={2}
                      borderRadius="md"
                    >
                      <IconButton
                        aria-label="Download photo"
                        icon={<Download size={16} />}
                        size="sm"
                        colorScheme="whiteAlpha"
                        onClick={() => handleDownload(viewingPhoto)}
                      />
                      <IconButton
                        aria-label="Edit photo"
                        icon={<Edit size={16} />}
                        size="sm"
                        colorScheme="whiteAlpha"
                        onClick={() => {
                          onViewerClose()
                          handleEdit(viewingPhoto)
                        }}
                      />
                    </HStack>
                  </Box>

                  {viewingPhoto.caption && (
                    <Text color="white" fontSize="lg" textAlign="center" maxW="2xl">
                      {viewingPhoto.caption}
                    </Text>
                  )}

                  <Text color="gray.300" fontSize="sm">
                    Added {new Date(viewingPhoto.created_at).toLocaleDateString()}
                  </Text>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  )
}
