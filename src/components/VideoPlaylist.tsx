"use client"

import { useState } from "react"
import {
  Box,
  Grid,
  GridItem,
  AspectRatio,
  Image,
  Text,
  VStack,
  HStack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Flex,
  Badge,
} from "@chakra-ui/react"
import { Play, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import type { AthleteVideo } from "@/types/database"

interface VideoPlaylistProps {
  videos: AthleteVideo[]
}

export function VideoPlaylist({ videos }: VideoPlaylistProps) {
  const [selectedVideo, setSelectedVideo] = useState<AthleteVideo | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const openVideo = (video: AthleteVideo, index: number) => {
    setSelectedVideo(video)
    setCurrentIndex(index)
    onOpen()
  }

  const navigateVideo = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev" ? (currentIndex - 1 + videos.length) % videos.length : (currentIndex + 1) % videos.length

    setCurrentIndex(newIndex)
    setSelectedVideo(videos[newIndex])
  }

  const getVideoEmbedUrl = (url: string) => {
    // YouTube URL conversion
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }

    // Vimeo URL conversion
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0]
      return `https://player.vimeo.com/video/${videoId}`
    }

    // Return original URL if it's already an embed or direct video
    return url
  }

  const getThumbnailUrl = (video: AthleteVideo) => {
    if (video.thumbnail_url) {
      return video.thumbnail_url
    }

    // Generate YouTube thumbnail
    if (video.video_url.includes("youtube.com/watch")) {
      const videoId = video.video_url.split("v=")[1]?.split("&")[0]
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    if (video.video_url.includes("youtu.be/")) {
      const videoId = video.video_url.split("youtu.be/")[1]?.split("?")[0]
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }

    // Fallback placeholder
    return "/placeholder.svg?height=200&width=300&text=Video"
  }

  if (videos.length === 0) {
    return null
  }

  return (
    <>
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
        {videos.map((video, index) => (
          <GridItem key={video.id}>
            <Box
              cursor="pointer"
              onClick={() => openVideo(video, index)}
              transition="all 0.3s ease"
              _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
              bg="white"
              borderRadius="lg"
              overflow="hidden"
              border="1px solid"
              borderColor="gray.200"
            >
              <AspectRatio ratio={16 / 9}>
                <Box position="relative">
                  <Image
                    src={getThumbnailUrl(video) || "/placeholder.svg"}
                    alt={video.title}
                    objectFit="cover"
                    w="full"
                    h="full"
                  />
                  <Flex
                    position="absolute"
                    inset={0}
                    align="center"
                    justify="center"
                    bg="blackAlpha.400"
                    opacity={0}
                    _hover={{ opacity: 1 }}
                    transition="opacity 0.3s ease"
                  >
                    <Box
                      bg="whiteAlpha.900"
                      borderRadius="full"
                      p={3}
                      transform="scale(1)"
                      _hover={{ transform: "scale(1.1)" }}
                      transition="transform 0.2s ease"
                    >
                      <Icon as={Play} size={24} color="gray.800" />
                    </Box>
                  </Flex>
                  <Badge position="absolute" top={2} right={2} colorScheme="blue" variant="solid" fontSize="xs">
                    {video.video_type || "Video"}
                  </Badge>
                </Box>
              </AspectRatio>
              <VStack align="start" p={4} spacing={2}>
                <Text fontWeight="semibold" fontSize="md" noOfLines={2}>
                  {video.title}
                </Text>
                {video.description && (
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {video.description}
                  </Text>
                )}
                <HStack spacing={2} fontSize="xs" color="gray.500">
                  <Icon as={Calendar} size={12} />
                  <Text>{new Date(video.created_at).toLocaleDateString()}</Text>
                </HStack>
              </VStack>
            </Box>
          </GridItem>
        ))}
      </Grid>

      {/* Video Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="white" maxW="90vw" maxH="90vh">
          <ModalCloseButton zIndex={10} />
          <ModalBody p={0}>
            {selectedVideo && (
              <VStack spacing={0} align="stretch">
                <AspectRatio ratio={16 / 9} w="full">
                  <iframe
                    src={getVideoEmbedUrl(selectedVideo.video_url)}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      border: "none",
                      borderRadius: "8px 8px 0 0",
                    }}
                  />
                </AspectRatio>

                <Box p={6}>
                  <VStack align="start" spacing={4}>
                    <VStack align="start" spacing={2} w="full">
                      <Text fontSize="xl" fontWeight="bold">
                        {selectedVideo.title}
                      </Text>
                      {selectedVideo.description && (
                        <Text color="gray.600" lineHeight="tall">
                          {selectedVideo.description}
                        </Text>
                      )}
                      <HStack spacing={4} fontSize="sm" color="gray.500">
                        <HStack spacing={1}>
                          <Icon as={Calendar} size={14} />
                          <Text>{new Date(selectedVideo.created_at).toLocaleDateString()}</Text>
                        </HStack>
                        <Badge colorScheme="blue" variant="outline">
                          {selectedVideo.video_type || "Video"}
                        </Badge>
                      </HStack>
                    </VStack>

                    {videos.length > 1 && (
                      <HStack justify="space-between" w="full" pt={4} borderTop="1px solid" borderColor="gray.200">
                        <Button
                          leftIcon={<ChevronLeft size={16} />}
                          onClick={() => navigateVideo("prev")}
                          variant="outline"
                          size="sm"
                        >
                          Previous
                        </Button>
                        <Text fontSize="sm" color="gray.500">
                          {currentIndex + 1} of {videos.length}
                        </Text>
                        <Button
                          rightIcon={<ChevronRight size={16} />}
                          onClick={() => navigateVideo("next")}
                          variant="outline"
                          size="sm"
                        >
                          Next
                        </Button>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
