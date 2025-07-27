"use client"

import { useState } from "react"
import { Box, VStack, HStack, Text, Card, CardBody, Image, AspectRatio, Badge, Icon, Flex } from "@chakra-ui/react"
import { Play, Clock } from "lucide-react"
import { VideoPlayer } from "@/components/VideoPlayer"
import type { AthleteVideo } from "@/types/database"

interface VideoPlaylistProps {
  videos: AthleteVideo[]
  isDarkTheme?: boolean
  primaryColor?: string
  secondaryColor?: string
}

export function VideoPlaylist({
  videos,
  isDarkTheme = false,
  primaryColor = "#1a202c",
  secondaryColor = "#2d3748",
}: VideoPlaylistProps) {
  const [selectedVideo, setSelectedVideo] = useState<AthleteVideo | null>(videos.length > 0 ? videos[0] : null)

  // Theme-aware colors
  const cardBgColor = isDarkTheme ? "gray.800" : "white"
  const textColor = isDarkTheme ? "white" : "gray.800"
  const mutedTextColor = isDarkTheme ? "gray.300" : "gray.600"
  const borderColor = isDarkTheme ? "gray.600" : "gray.200"
  const hoverBgColor = isDarkTheme ? "gray.700" : "gray.50"

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be")
  }

  const isVimeoUrl = (url: string) => {
    return url.includes("vimeo.com")
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
    return "/placeholder.svg?height=180&width=320&text=Video"
  }

  const getVimeoThumbnail = (url: string) => {
    // For Vimeo, we'll use a generic video thumbnail since getting actual thumbnails requires API calls
    return "/placeholder.svg?height=180&width=320&text=Vimeo+Video"
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
    return "/placeholder.svg?height=180&width=320&text=Video+File"
  }

  const getVideoDuration = (video: AthleteVideo) => {
    // This would typically come from video metadata
    // For now, we'll show a placeholder based on video type
    if (video.video_type === "highlight") return "2:30"
    if (video.video_type === "game_film") return "15:45"
    return "3:20"
  }

  if (videos.length === 0) {
    return (
      <Card bg={cardBgColor} borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} py={8}>
            <Icon as={Play} size={48} color={mutedTextColor} />
            <Text color={mutedTextColor}>No videos available</Text>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card bg={cardBgColor} borderColor={borderColor}>
      <CardBody p={0}>
        <Flex direction={{ base: "column", lg: "row" }} h={{ base: "auto", lg: "500px" }}>
          {/* Main Video Player - Left Side */}
          <Box flex="2" minH={{ base: "300px", lg: "500px" }}>
            {selectedVideo && (
              <Box h="full" position="relative">
                <VideoPlayer
                  videoUrl={selectedVideo.video_url}
                  title={selectedVideo.title}
                  thumbnailUrl={selectedVideo.thumbnail_url}
                />
                {/* Video Info Overlay */}
                <Box position="absolute" bottom={0} left={0} right={0} bg="blackAlpha.800" p={4} color="white">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
                      {selectedVideo.title}
                    </Text>
                    {selectedVideo.description && (
                      <Text fontSize="sm" opacity={0.9} noOfLines={2}>
                        {selectedVideo.description}
                      </Text>
                    )}
                    <HStack spacing={3}>
                      <Badge bg={primaryColor} color="white" variant="solid" fontSize="xs">
                        {selectedVideo.video_type || "highlight"}
                      </Badge>
                      <Text fontSize="xs" opacity={0.8}>
                        {new Date(selectedVideo.created_at).toLocaleDateString()}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </Box>
            )}
          </Box>

          {/* Video Playlist - Right Side */}
          <Box
            flex="1"
            borderLeft={{ base: "none", lg: `1px solid` }}
            borderTop={{ base: `1px solid`, lg: "none" }}
            borderColor={borderColor}
            bg={isDarkTheme ? "gray.900" : "gray.50"}
          >
            <VStack spacing={0} align="stretch" h="full">
              <Box p={4} borderBottom={`1px solid`} borderColor={borderColor}>
                <Text fontSize="md" fontWeight="semibold" color={textColor}>
                  Playlist ({videos.length} videos)
                </Text>
              </Box>

              <Box flex="1" overflowY="auto" maxH={{ base: "300px", lg: "450px" }}>
                <VStack spacing={0} align="stretch">
                  {videos.map((video, index) => (
                    <Box
                      key={video.id}
                      cursor="pointer"
                      onClick={() => setSelectedVideo(video)}
                      bg={selectedVideo?.id === video.id ? (isDarkTheme ? "gray.700" : "white") : "transparent"}
                      _hover={{ bg: hoverBgColor }}
                      transition="all 0.2s"
                      borderBottom={`1px solid`}
                      borderColor={borderColor}
                      p={3}
                    >
                      <HStack spacing={3} align="start">
                        {/* Video Thumbnail */}
                        <Box position="relative" flexShrink={0}>
                          <AspectRatio ratio={16 / 9} w="120px">
                            <Image
                              src={getVideoThumbnail(video) || "/placeholder.svg"}
                              alt={video.title}
                              objectFit="cover"
                              borderRadius="md"
                              fallback={
                                <Box
                                  bg={isDarkTheme ? "gray.600" : "gray.200"}
                                  w="100%"
                                  h="100%"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  borderRadius="md"
                                >
                                  <Icon as={Play} color={mutedTextColor} size={20} />
                                </Box>
                              }
                            />
                          </AspectRatio>

                          {/* Play overlay for non-selected videos */}
                          {selectedVideo?.id !== video.id && (
                            <Flex
                              position="absolute"
                              top={0}
                              left={0}
                              right={0}
                              bottom={0}
                              align="center"
                              justify="center"
                              bg="blackAlpha.500"
                              borderRadius="md"
                              opacity={0}
                              _groupHover={{ opacity: 1 }}
                              transition="opacity 0.2s"
                            >
                              <Icon as={Play} color="white" size={16} />
                            </Flex>
                          )}

                          {/* Duration badge */}
                          <Badge
                            position="absolute"
                            bottom={1}
                            right={1}
                            bg="blackAlpha.800"
                            color="white"
                            fontSize="xs"
                            borderRadius="sm"
                            px={1}
                          >
                            <HStack spacing={1}>
                              <Icon as={Clock} size={8} />
                              <Text>{getVideoDuration(video)}</Text>
                            </HStack>
                          </Badge>

                          {/* Currently playing indicator */}
                          {selectedVideo?.id === video.id && (
                            <Box
                              position="absolute"
                              top={1}
                              left={1}
                              bg={primaryColor}
                              color="white"
                              borderRadius="sm"
                              px={2}
                              py={1}
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              NOW PLAYING
                            </Box>
                          )}
                        </Box>

                        {/* Video Info */}
                        <VStack align="start" spacing={1} flex={1} minW={0}>
                          <Text
                            fontSize="sm"
                            fontWeight={selectedVideo?.id === video.id ? "bold" : "medium"}
                            noOfLines={2}
                            color={selectedVideo?.id === video.id ? primaryColor : textColor}
                            lineHeight="tight"
                          >
                            {video.title}
                          </Text>

                          {video.description && (
                            <Text fontSize="xs" color={mutedTextColor} noOfLines={2} lineHeight="tight">
                              {video.description}
                            </Text>
                          )}

                          <HStack spacing={2} flexWrap="wrap">
                            <Badge
                              size="xs"
                              colorScheme={selectedVideo?.id === video.id ? "blue" : "gray"}
                              variant={selectedVideo?.id === video.id ? "solid" : "subtle"}
                            >
                              {video.video_type || "highlight"}
                            </Badge>
                            <Text fontSize="xs" color={mutedTextColor}>
                              {new Date(video.created_at).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </VStack>

                        {/* Playlist number */}
                        <Box
                          bg={selectedVideo?.id === video.id ? primaryColor : isDarkTheme ? "gray.600" : "gray.300"}
                          color={selectedVideo?.id === video.id ? "white" : mutedTextColor}
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
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  )
}
