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
  Grid,
  GridItem,
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
  Input,
  Textarea,
  Alert,
  AlertIcon,
  Badge,
  useToast,
  Spinner,
  Center,
  Progress,
  AspectRatio,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
} from "@chakra-ui/react"
import { Plus, Edit, Trash2, Play, ExternalLink } from "lucide-react"
import { VideoUpload } from "@/components/VideoUpload"
import { getSubscriptionLimits, canUploadMore, getUpgradeMessage, type SubscriptionTier } from "@/utils/subscription"
import { deleteFile, extractStoragePath } from "@/utils/supabase/storage"
import Link from "next/link"

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  video_type: "youtube" | "vimeo" | "upload"
  thumbnail_url?: string
  created_at: string
  updated_at: string
}

export default function VideosPage() {
  const [athlete, setAthlete] = useState<any>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    video_type: "youtube" as "youtube" | "vimeo" | "upload",
    thumbnail_url: "",
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

        // Fetch videos
        const { data: videosData, error } = await supabase
          .from("athlete_videos")
          .select("*")
          .eq("athlete_id", athleteData.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setVideos(videosData || [])
      }
    } catch (error: any) {
      toast({
        title: "Error loading videos",
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
    if (!athlete || !formData.video_url || !formData.title) return

    setSaving(true)
    try {
      const videoData = {
        title: formData.title,
        description: formData.description || null,
        video_url: formData.video_url,
        video_type: formData.video_type,
        thumbnail_url: formData.thumbnail_url || null,
        athlete_id: athlete.id,
        is_featured: false,
        updated_at: new Date().toISOString(),
      }

      if (editingVideo) {
        // Update existing video
        const { error } = await supabase.from("athlete_videos").update(videoData).eq("id", editingVideo.id)

        if (error) {
          console.error("Database update error:", error)
          throw error
        }

        toast({
          title: "Video updated",
          description: "Your video has been updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        // Create new video
        const { error } = await supabase.from("athlete_videos").insert({
          ...videoData,
          created_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Database insert error:", error)
          throw error
        }

        toast({
          title: "Video added",
          description: "Your video has been added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }

      // Refresh data and close modal
      await fetchData()
      handleCloseModal()
    } catch (error: any) {
      console.error("Error saving video:", error)
      toast({
        title: "Error saving video",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (video: Video) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      // Delete from database
      const { error } = await supabase.from("athlete_videos").delete().eq("id", video.id)
      if (error) throw error

      // Delete files from storage if it's a direct upload
      if (video.video_type === "upload" && video.video_url.includes("supabase")) {
        const pathInfo = extractStoragePath(video.video_url)
        if (pathInfo) {
          await deleteFile(pathInfo.bucket, pathInfo.path)
        }

        // Delete thumbnail if exists
        if (video.thumbnail_url && video.thumbnail_url.includes("supabase")) {
          const thumbnailPathInfo = extractStoragePath(video.thumbnail_url)
          if (thumbnailPathInfo) {
            await deleteFile(thumbnailPathInfo.bucket, thumbnailPathInfo.path)
          }
        }
      }

      toast({
        title: "Video deleted",
        description: "Your video has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      await fetchData()
    } catch (error: any) {
      toast({
        title: "Error deleting video",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      video_type: video.video_type,
      thumbnail_url: video.thumbnail_url || "",
    })
    onOpen()
  }

  const handleCloseModal = () => {
    setEditingVideo(null)
    setFormData({
      title: "",
      description: "",
      video_url: "",
      video_type: "youtube",
      thumbnail_url: "",
    })
    onClose()
  }

  const handleVideoUpload = (videoUrl: string, thumbnailUrl?: string) => {
    // When video is uploaded, set the URLs and let user add title/description
    setFormData({
      ...formData,
      video_url: videoUrl,
      video_type: "upload",
      thumbnail_url: thumbnailUrl || "",
    })

    // Auto-generate title from timestamp if empty
    if (!formData.title) {
      setFormData((prev) => ({
        ...prev,
        title: `Video ${new Date().toLocaleDateString()}`,
      }))
    }
  }

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, video_url: url })

    // Auto-detect video type
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      setFormData((prev) => ({ ...prev, video_type: "youtube" }))
    } else if (url.includes("vimeo.com")) {
      setFormData((prev) => ({ ...prev, video_type: "vimeo" }))
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  const getVimeoEmbedUrl = (url: string) => {
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0]?.split("/")[0]
      return `https://player.vimeo.com/video/${videoId}`
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
    return null
  }

  const getVimeoThumbnail = (url: string) => {
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0]?.split("/")[0]
      return `https://vumbnail.com/${videoId}.jpg`
    }
    return null
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
        <Text color="gray.600">You need to create your athlete profile before managing videos.</Text>
        <Link href="/dashboard/profile">
          <Button colorScheme="blue" size="lg">
            Create Profile
          </Button>
        </Link>
      </VStack>
    )
  }

  const limits = getSubscriptionLimits(subscriptionTier)
  const canAddMore = canUploadMore(videos.length, subscriptionTier, "videos")

  return (
    <Container maxW="6xl">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" mb={2}>
              Game Film & Videos
            </Heading>
            <HStack spacing={4}>
              <Text color="gray.600">
                {videos.length} of {limits.videos} videos used
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
            Add Video
          </Button>
        </Flex>

        {/* Usage Progress */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="medium">
                  Video Usage
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {videos.length} / {limits.videos}
                </Text>
              </Flex>
              <Progress
                value={(videos.length / limits.videos) * 100}
                colorScheme={videos.length >= limits.videos ? "red" : "blue"}
                size="sm"
              />
              {!canAddMore && (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">{getUpgradeMessage(subscriptionTier, "videos")}</Text>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <Card>
            <CardBody py={12} textAlign="center">
              <VStack spacing={4}>
                <Box color="gray.400">
                  <Play size={48} />
                </Box>
                <Heading size="md" color="gray.600">
                  No videos yet
                </Heading>
                <Text color="gray.500" maxW="md">
                  Add your first game film or highlight video to showcase your skills to college coaches.
                </Text>
                <Button leftIcon={<Plus size={16} />} colorScheme="blue" onClick={onOpen} isDisabled={!canAddMore}>
                  Add Your First Video
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            {videos.map((video) => {
              // Get thumbnail URL based on video type
              let thumbnailSrc = video.thumbnail_url
              if (!thumbnailSrc) {
                if (video.video_type === "youtube") {
                  thumbnailSrc = getYouTubeThumbnail(video.video_url)
                } else if (video.video_type === "vimeo") {
                  thumbnailSrc = getVimeoThumbnail(video.video_url)
                }
              }

              return (
                <GridItem key={video.id}>
                  <Card h="full">
                    <CardBody p={0}>
                      <VStack spacing={0} align="stretch">
                        {/* Video Thumbnail/Player */}
                        <AspectRatio ratio={16 / 9}>
                          <Box
                            bg="black"
                            borderTopRadius="md"
                            overflow="hidden"
                            position="relative"
                            cursor="pointer"
                            _hover={{ opacity: 0.8 }}
                          >
                            {video.video_type === "youtube" ? (
                              thumbnailSrc ? (
                                <Box position="relative" w="full" h="full">
                                  <Image
                                    src={thumbnailSrc || "/placeholder.svg"}
                                    alt={video.title}
                                    objectFit="cover"
                                    w="full"
                                    h="full"
                                  />
                                  <Box
                                    position="absolute"
                                    top="50%"
                                    left="50%"
                                    transform="translate(-50%, -50%)"
                                    bg="blackAlpha.700"
                                    borderRadius="full"
                                    p={3}
                                  >
                                    <Play size={24} color="white" fill="white" />
                                  </Box>
                                </Box>
                              ) : (
                                <iframe
                                  src={getYouTubeEmbedUrl(video.video_url)}
                                  title={video.title}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{ width: "100%", height: "100%" }}
                                />
                              )
                            ) : video.video_type === "vimeo" ? (
                              thumbnailSrc ? (
                                <Box position="relative" w="full" h="full">
                                  <Image
                                    src={thumbnailSrc || "/placeholder.svg"}
                                    alt={video.title}
                                    objectFit="cover"
                                    w="full"
                                    h="full"
                                  />
                                  <Box
                                    position="absolute"
                                    top="50%"
                                    left="50%"
                                    transform="translate(-50%, -50%)"
                                    bg="blackAlpha.700"
                                    borderRadius="full"
                                    p={3}
                                  >
                                    <Play size={24} color="white" fill="white" />
                                  </Box>
                                </Box>
                              ) : (
                                <iframe
                                  src={getVimeoEmbedUrl(video.video_url)}
                                  title={video.title}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{ width: "100%", height: "100%" }}
                                />
                              )
                            ) : thumbnailSrc ? (
                              <Box position="relative" w="full" h="full">
                                <Image
                                  src={thumbnailSrc || "/placeholder.svg"}
                                  alt={video.title}
                                  objectFit="cover"
                                  w="full"
                                  h="full"
                                />
                                <Box
                                  position="absolute"
                                  top="50%"
                                  left="50%"
                                  transform="translate(-50%, -50%)"
                                  bg="blackAlpha.700"
                                  borderRadius="full"
                                  p={3}
                                >
                                  <Play size={24} color="white" fill="white" />
                                </Box>
                              </Box>
                            ) : (
                              <video controls style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                                <source src={video.video_url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </Box>
                        </AspectRatio>

                        {/* Video Info */}
                        <Box p={4}>
                          <VStack align="stretch" spacing={3}>
                            <Box>
                              <Heading size="sm" mb={1} noOfLines={2}>
                                {video.title}
                              </Heading>
                              {video.description && (
                                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                  {video.description}
                                </Text>
                              )}
                            </Box>

                            <Text fontSize="xs" color="gray.500">
                              Added {new Date(video.created_at).toLocaleDateString()}
                            </Text>

                            {/* Actions */}
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Edit video"
                                icon={<Edit size={16} />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(video)}
                              />
                              <IconButton
                                aria-label="Delete video"
                                icon={<Trash2 size={16} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDelete(video)}
                              />
                              {(video.video_type === "youtube" || video.video_type === "vimeo") && (
                                <IconButton
                                  aria-label="Open in new tab"
                                  icon={<ExternalLink size={16} />}
                                  size="sm"
                                  variant="ghost"
                                  as="a"
                                  href={video.video_url}
                                  target="_blank"
                                />
                              )}
                            </HStack>
                          </VStack>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>
              )
            })}
          </Grid>
        )}

        {/* Add/Edit Video Modal */}
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{editingVideo ? "Edit Video" : "Add New Video"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Game vs. Lincoln High - Highlights"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what's shown in this video..."
                      rows={3}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Video</FormLabel>
                    <Tabs>
                      <TabList>
                        <Tab>URL (YouTube/Vimeo)</Tab>
                        <Tab>Upload File</Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel px={0}>
                          <VStack spacing={3}>
                            <Input
                              value={formData.video_url}
                              onChange={(e) => handleUrlChange(e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                            />
                          </VStack>
                        </TabPanel>
                        <TabPanel px={0}>
                          <VideoUpload
                            onUploadComplete={handleVideoUpload}
                            athleteId={athlete.id}
                            currentVideoUrl={formData.video_type === "upload" ? formData.video_url : ""}
                            currentThumbnailUrl={formData.video_type === "upload" ? formData.thumbnail_url : ""}
                            onDelete={() =>
                              setFormData({ ...formData, video_url: "", video_type: "youtube", thumbnail_url: "" })
                            }
                          />
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </FormControl>

                  <HStack spacing={3} w="full" pt={4}>
                    <Button variant="ghost" onClick={handleCloseModal} flex={1}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      isLoading={saving}
                      loadingText={editingVideo ? "Updating..." : "Adding..."}
                      flex={1}
                      isDisabled={!formData.video_url || !formData.title}
                    >
                      {editingVideo ? "Update Video" : "Add Video"}
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  )
}
