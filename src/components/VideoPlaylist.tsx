"use client"

import { useState } from "react"
import { Box, VStack, HStack, Text, Card, CardBody, Image, AspectRatio, Badge, Icon, Flex } from "@chakra-ui/react"
import { Play, Clock } from "lucide-react"
import { VideoPlayer } from "@/components/VideoPlayer"
import type { AthleteVideo } from "@/types/database"

interface VideoPlaylistProps {
  videos: AthleteVideo[]
  title?: string
}

export function VideoPlaylist({ videos, title = "Game Film" }: VideoPlaylistProps) {
  const [selectedVideo, setSelectedVideo] = useState<AthleteVideo | null>(videos.length > 0 ? videos[0] : null)

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be")
  }

  const isVimeoUrl = (url: string) => {
    return url.includes("vimeo.com")
  }

  const getYouTubeThumbnail = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    }
    return "/placeholder.svg?height=120&width=200&text=Video"
  }

  const getVimeoThumbnail = (url: string) => {
    // For Vimeo, we'll use a generic video thumbnail since getting actual thumbnails requires API calls
    return "/placeholder.svg?height=120&width=200&text=Vimeo+Video"
  }

  const getVideoThumbnail = (video: AthleteVideo) => {
    // If there's a custom thumbnail, use it
    if (video.thumbnail_url) {
      return video.thumbnail_url
    }

    // For YouTube videos, get the thumbnail from YouTube
    if (isYouTubeUrl(video.video_url)) {
      return getYouTubeThumbnail(video.video_url)
    }

    // For Vimeo videos, use a generic Vimeo thumbnail
    if (isVimeoUrl(video.video_url)) {
      return getVimeoThumbnail(video.video_url)
    }

    // For uploaded videos or other URLs, use a generic video thumbnail
    return "/placeholder.svg?height=120&width=200&text=Video+File"
  }

  const getVideoDuration = (video: AthleteVideo) => {
    // This would typically come from video metadata
    // For now, we'll show a placeholder
    return "2:30"
  }

  if (videos.length === 0) {
    return (
      <Card>
        <CardBody>
          <VStack spacing={4} py={8}>
            <Icon as={Play} size={48} color="gray.300" />
            <Text color="gray.500">No videos available</Text>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Main Video Player */}
          {selectedVideo && (
            <Box>
              <VideoPlayer
                videoUrl={selectedVideo.video_url}
                title={selectedVideo.title}
                thumbnailUrl={selectedVideo.thumbnail_url}
              />
              <VStack align="start" spacing={2} mt={3}>
                <Text fontSize="lg" fontWeight="bold">
                  {selectedVideo.title}
                </Text>
                {selectedVideo.description && (
                  <Text fontSize="sm" color="gray.600" lineHeight="tall">
                    {selectedVideo.description}
                  </Text>
                )}
                <HStack spacing={2}>
                  <Badge colorScheme="blue" size="sm">
                    {selectedVideo.video_type || "highlight"}
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(selectedVideo.created_at).toLocaleDateString()}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Video Playlist */}
          {videos.length > 1 && (
            <Box>
              <Text fontSize="md" fontWeight="semibold" mb={3}>
                Playlist ({videos.length} videos)
              </Text>
              <VStack spacing={2} align="stretch" maxH="400px" overflowY="auto">
                {videos.map((video, index) => (
                  <Card
                    key={video.id}
                    variant={selectedVideo?.id === video.id ? "filled" : "outline"}
                    cursor="pointer"
                    onClick={() => setSelectedVideo(video)}
                    _hover={{ bg: "gray.50" }}
                    transition="all 0.2s"
                  >
                    <CardBody p={3}>
                      <HStack spacing={3}>
                        {/* Thumbnail */}
                        <Box position="relative" flexShrink={0}>
                          <AspectRatio ratio={16 / 9} w="120px">
                            <Image
                              src={getVideoThumbnail(video) || "/placeholder.svg"}
                              alt={video.title}
                              objectFit="cover"
                              borderRadius="md"
                              fallback={
                                <Box
                                  bg="gray.100"
                                  w="100%"
                                  h="100%"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  borderRadius="md"
                                >
                                  <Icon as={Play} color="gray.400" size={24} />
                                </Box>
                              }
                            />
                          </AspectRatio>
                          {/* Play overlay */}
                          <Flex
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            align="center"
                            justify="center"
                            bg="blackAlpha.400"
                            borderRadius="md"
                            opacity={selectedVideo?.id === video.id ? 0 : 1}
                            transition="opacity 0.2s"
                          >
                            <Icon as={Play} color="white" size={20} />
                          </Flex>
                          {/* Duration badge */}
                          <Badge
                            position="absolute"
                            bottom={1}
                            right={1}
                            bg="blackAlpha.700"
                            color="white"
                            fontSize="xs"
                            borderRadius="sm"
                          >
                            <HStack spacing={1}>
                              <Icon as={Clock} size={10} />
                              <Text>{getVideoDuration(video)}</Text>
                            </HStack>
                          </Badge>
                        </Box>

                        {/* Video Info */}
                        <VStack align="start" spacing={1} flex={1} minW={0}>
                          <Text
                            fontSize="sm"
                            fontWeight={selectedVideo?.id === video.id ? "bold" : "medium"}
                            noOfLines={2}
                            color={selectedVideo?.id === video.id ? "blue.600" : "gray.900"}
                          >
                            {video.title}
                          </Text>
                          {video.description && (
                            <Text fontSize="xs" color="gray.500" noOfLines={2}>
                              {video.description}
                            </Text>
                          )}
                          <HStack spacing={2}>
                            <Badge size="xs" colorScheme="gray">
                              {video.video_type || "highlight"}
                            </Badge>
                            <Text fontSize="xs" color="gray.400">
                              {new Date(video.created_at).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </VStack>

                        {/* Playlist number */}
                        <Box
                          bg={selectedVideo?.id === video.id ? "blue.500" : "gray.200"}
                          color={selectedVideo?.id === video.id ? "white" : "gray.600"}
                          borderRadius="full"
                          w={6}
                          h={6}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xs"
                          fontWeight="bold"
                          flexShrink={0}
                        >
                          {index + 1}
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
