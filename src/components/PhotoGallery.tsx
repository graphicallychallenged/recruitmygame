"use client"

import { useState } from "react"
import {
  Box,
  SimpleGrid,
  Image,
  AspectRatio,
  IconButton,
  VStack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  HStack,
} from "@chakra-ui/react"
import { ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react"

interface Photo {
  id: string
  caption: string
  photo_url: string
  created_at: string
}

interface PhotoGalleryProps {
  photos: Photo[]
  columns?: { base: number; md: number; lg: number; xl: number }
  onPhotoClick?: (photo: Photo) => void
  showActions?: boolean
}

export function PhotoGallery({
  photos,
  columns = { base: 2, md: 3, lg: 4, xl: 5 },
  onPhotoClick,
  showActions = false,
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handlePhotoClick = (photo: Photo, index: number) => {
    setCurrentIndex(index)
    onOpen()
    onPhotoClick?.(photo)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
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
      console.error("Download failed:", error)
    }
  }

  if (photos.length === 0) {
    return (
      <Box textAlign="center" py={12} color="gray.500">
        <Text>No photos to display</Text>
      </Box>
    )
  }

  const currentPhoto = photos[currentIndex]

  return (
    <>
      <SimpleGrid columns={columns} spacing={4}>
        {photos.map((photo, index) => (
          <Box
            key={photo.id}
            cursor="pointer"
            _hover={{ transform: "scale(1.05)" }}
            transition="all 0.2s"
            onClick={() => handlePhotoClick(photo, index)}
          >
            <AspectRatio ratio={1}>
              <Image
                src={photo.photo_url || "/placeholder.svg"}
                alt={photo.caption || `Photo ${index + 1}`}
                objectFit="cover"
                borderRadius="md"
                loading="lazy"
                fallback={
                  <Box bg="gray.100" w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="xs" color="gray.400">
                      Loading...
                    </Text>
                  </Box>
                }
              />
            </AspectRatio>
          </Box>
        ))}
      </SimpleGrid>

      {/* Lightbox Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay bg="blackAlpha.900" />
        <ModalContent bg="transparent" shadow="none" maxW="95vw" maxH="95vh">
          <ModalCloseButton color="white" size="lg" zIndex={3} />
          <ModalBody p={0} display="flex" alignItems="center" justifyContent="center" position="relative">
            {currentPhoto && (
              <VStack spacing={4} w="full" h="full" justify="center">
                {/* Navigation arrows */}
                {photos.length > 1 && (
                  <>
                    <IconButton
                      aria-label="Previous photo"
                      icon={<ChevronLeft size={24} />}
                      position="absolute"
                      left={4}
                      top="50%"
                      transform="translateY(-50%)"
                      colorScheme="whiteAlpha"
                      size="lg"
                      onClick={handlePrevious}
                      zIndex={2}
                    />
                    <IconButton
                      aria-label="Next photo"
                      icon={<ChevronRight size={24} />}
                      position="absolute"
                      right={4}
                      top="50%"
                      transform="translateY(-50%)"
                      colorScheme="whiteAlpha"
                      size="lg"
                      onClick={handleNext}
                      zIndex={2}
                    />
                  </>
                )}

                {/* Main image */}
                <Box maxW="full" maxH="80vh" position="relative">
                  <Image
                    src={currentPhoto.photo_url || "/placeholder.svg"}
                    alt={currentPhoto.caption || "Photo"}
                    maxW="full"
                    maxH="80vh"
                    objectFit="contain"
                    borderRadius="md"
                  />

                  {/* Action buttons overlay */}
                  {showActions && (
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
                        onClick={() => handleDownload(currentPhoto)}
                      />
                      <IconButton
                        aria-label="Open original"
                        icon={<ExternalLink size={16} />}
                        size="sm"
                        colorScheme="whiteAlpha"
                        as="a"
                        href={currentPhoto.photo_url}
                        target="_blank"
                      />
                    </HStack>
                  )}
                </Box>

                {/* Photo info */}
                <VStack spacing={2} textAlign="center">
                  {currentPhoto.caption && (
                    <Text color="white" fontSize="lg" maxW="2xl">
                      {currentPhoto.caption}
                    </Text>
                  )}
                  <Text color="gray.300" fontSize="sm">
                    {currentIndex + 1} of {photos.length} • Added{" "}
                    {new Date(currentPhoto.created_at).toLocaleDateString()}
                  </Text>
                </VStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
