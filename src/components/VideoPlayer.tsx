"use client"

import { useState } from "react"
import {
  Box,
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
} from "@chakra-ui/react"
import { Maximize } from "lucide-react"

interface VideoPlayerProps {
  videoUrl: string
  title: string
  thumbnailUrl?: string
  autoPlay?: boolean
  controls?: boolean
}

export function VideoPlayer({ videoUrl, title, thumbnailUrl, autoPlay = false, controls = true }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be")
  }

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}`
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}`
    }
    return url
  }

  const getYouTubeThumbnail = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    return thumbnailUrl || "/placeholder.svg?height=200&width=300&text=Video"
  }

  const renderVideo = (fullscreen = false) => {
    if (isYouTubeUrl(videoUrl)) {
      return (
        <iframe
          src={getYouTubeEmbedUrl(videoUrl)}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            width: "100%",
            height: fullscreen ? "80vh" : "100%",
            minHeight: fullscreen ? "400px" : "auto",
          }}
        />
      )
    }

    return (
      <video
        controls={controls}
        autoPlay={autoPlay}
        style={{
          width: "100%",
          height: fullscreen ? "80vh" : "100%",
          objectFit: "contain",
        }}
        poster={thumbnailUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/quicktime" />
        Your browser does not support the video tag.
      </video>
    )
  }

  return (
    <>
      <Box position="relative" w="full">
        <AspectRatio ratio={16 / 9}>
          <Box bg="black" borderRadius="md" overflow="hidden" position="relative">
            {renderVideo()}

            {/* Fullscreen button */}
            <IconButton
              aria-label="Open fullscreen"
              icon={<Maximize size={16} />}
              size="sm"
              position="absolute"
              top={2}
              right={2}
              colorScheme="whiteAlpha"
              variant="solid"
              onClick={onOpen}
              opacity={0.8}
              _hover={{ opacity: 1 }}
            />
          </Box>
        </AspectRatio>
      </Box>

      {/* Fullscreen Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay bg="blackAlpha.900" />
        <ModalContent bg="black" m={0}>
          <ModalCloseButton color="white" size="lg" />
          <ModalBody p={0} display="flex" alignItems="center" justifyContent="center">
            <VStack spacing={4} w="full" h="full" justify="center">
              <Box w="full" maxW="90vw">
                {renderVideo(true)}
              </Box>
              <Text color="white" fontSize="lg" fontWeight="medium" textAlign="center">
                {title}
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
