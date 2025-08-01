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
  Input,
  Textarea,
  Select,
  Alert,
  AlertIcon,
  Badge,
  useToast,
  Spinner,
  Center,
  Progress,
  AspectRatio,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react"
import { Plus, Edit, Trash2, Play, Eye } from "lucide-react"
import { VideoUpload } from "@/components/VideoUpload"
import { VideoPlayer } from "@/components/VideoPlayer"
import { getSubscriptionLimits, canUploadMore, getUpgradeMessage, type SubscriptionTier } from "@/utils/subscription"
import { deleteFile, extractStoragePath } from "@/utils/supabase/storage"
import { extractVideoId, getVideoThumbnail } from "@/utils/videoThumbnails"
import Link from "next/link"

interface VideoItem {
  id: string
  title: string
  description: string | null
  video_url: string
  video_type: "youtube" | "vimeo" | "upload"
  thumbnail_url: string | null
  is_featured: boolean
  created_at: string
}

export default function VideosPage() {
  const [athlete, setAthlete] = useState<any>(null)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isViewerOpen, onOpen: onViewerOpen, onClose: onViewerClose } = useDisclosure()
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null)
  const [viewingVideo, setViewingVideo] = useState<VideoItem | null>(null)
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
      // Generate thumbnail for YouTube/Vimeo videos
      let thumbnailUrl = formData.thumbnail_url
      if (!thumbnailUrl && formData.video_type !== "upload") {
        const videoId = extractVideoId(formData.video_url, formData.video_type)
        if (videoId) {
          thumbnailUrl = getVideoThumbnail(videoId, formData.video_type)
        }
      }

      const videoData = {
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url,
        video_type: formData.video_type,
        thumbnail_url: thumbnailUrl,
        athlete_id: athlete.id,
        updated_at: new Date().toISOString(),
      }

      if (editingVideo) {
        // Update existing video
        const { error } = await supabase.from("athlete_videos").update(videoData).eq("id", editingVideo.id)
        if (error) throw error
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
          is_featured: false,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
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

  const handleDelete = async (video: VideoItem) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      // Delete from database
      const { error } = await supabase.from("athlete_videos").delete().eq("id", video.id)
      if (error) throw error

      // Delete file from storage if it's an uploaded video
      if (video.video_type === "upload" && video.video_url.includes("supabase")) {
        const pathInfo = extractStoragePath(video.video_url)
        if (pathInfo) {
          await deleteFile(pathInfo.bucket, pathInfo.path)
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

  const handleEdit = (video: VideoItem) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description || "",
      video_url: video.video_url,
      video_type: video.video_type,
      thumbnail_url: video.thumbnail_url || "",
    })
    onOpen()
  }

  const handleView = (video: VideoItem) => {
    setViewingVideo(video)
    onViewerOpen()
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

  const handleVideoUpload = () => {
    // Refresh data after upload
    fetchData()
  }

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, video_url: url })

    // Auto-detect video type and generate thumbnail
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      setFormData((prev) => ({ ...prev, video_type: "youtube" }))
      const videoId = extractVideoId(url, "youtube")
      if (videoId) {
        const thumbnail = getVideoThumbnail(videoId, "youtube")
        setFormData((prev) => ({ ...prev, thumbnail_url: thumbnail }))
      }
    } else if (url.includes("vimeo.com")) {
      setFormData((prev) => ({ ...prev, video_type: "vimeo" }))
      const videoId = extractVideoId(url, "vimeo")
      if (videoId) {
        const thumbnail = getVideoThumbnail(videoId, "vimeo")
        setFormData((prev) => ({ ...prev, thumbnail_url: thumbnail }))
      }
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
              Video Gallery
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
                colorScheme={videos.length >= limits.videos ? "red" : "green"}
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
                  <video size={48} />
                </Box>
                <Heading size="md" color="gray.600">
                  No videos yet
                </Heading>
                <Text color="gray.500" maxW="md">
                  Add your first videos to showcase your skills, highlights, and athletic performances.
                </Text>
                <Button leftIcon={<Plus size={16} />} colorScheme="blue" onClick={onOpen} isDisabled={!canAddMore}>
                  Add Your First Video
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {videos.map((video) => (
              <Card key={video.id} overflow="hidden" _hover={{ transform: "scale(1.02)" }} transition="all 0.2s">
                <CardBody p={0}>
                  <VStack spacing={0} align="stretch">
                    {/* Video Thumbnail */}
                    <AspectRatio ratio={16 / 9}>
                      <Box
                        position="relative"
                        bg="gray.100"
                        cursor="pointer"
                        onClick={() => handleView(video)}
                        backgroundImage={video.thumbnail_url ? `url(${video.thumbnail_url})` : undefined}
                        backgroundSize="cover"
                        backgroundPosition="center"
                      >
                        {!video.thumbnail_url && (
                          <Box
                            w="full"
                            h="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="gray.400"
                          >
                            <video size={48} />
                          </Box>
                        )}
                        {/* Play button overlay */}
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          bg="blackAlpha.700"
                          borderRadius="full"
                          p={3}
                          color="white"
                          _hover={{ bg: "blackAlpha.800" }}
                          transition="all 0.2s"
                        >
                          <Play size={24} fill="currentColor" />
                        </Box>
                        {/* Video type badge */}
                        <Badge
                          position="absolute"
                          top={2}
                          right={2}
                          colorScheme={
                            video.video_type === "youtube" ? "red" : video.video_type === "vimeo" ? "blue" : "green"
                          }
                          textTransform="uppercase"
                        >
                          {video.video_type}
                        </Badge>
                      </Box>
                    </AspectRatio>

                    {/* Video Info & Actions */}
                    <Box p={4}>
                      <VStack align="stretch" spacing={3}>
                        <Heading size="sm" noOfLines={2}>
                          {video.title}
                        </Heading>

                        {video.description && (
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {video.description}
                          </Text>
                        )}

                        <Text fontSize="xs" color="gray.500">
                          Added {new Date(video.created_at).toLocaleDateString()}
                        </Text>

                        {/* Actions */}
                        <HStack spacing={2} justify="center">
                          <IconButton
                            aria-label="View video"
                            icon={<Eye size={16} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(video)}
                          />
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
                        </HStack>
                      </VStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
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
                      placeholder="Enter video title..."
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe this video..."
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
                            <Select
                              value={formData.video_type}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  video_type: e.target.value as "youtube" | "vimeo" | "upload",
                                })
                              }
                            >
                              <option value="youtube">YouTube</option>
                              <option value="vimeo">Vimeo</option>
                            </Select>
                          </VStack>
                        </TabPanel>
                        <TabPanel px={0}>
                          <VideoUpload
                            onUploadComplete={handleVideoUpload}
                            athleteId={athlete.id}
                            currentVideoUrl={formData.video_type === "upload" ? formData.video_url : ""}
                            onDelete={() => setFormData({ ...formData, video_url: "", video_type: "youtube" })}
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

        {/* Video Viewer Modal */}
        <Modal isOpen={isViewerOpen} onClose={onViewerClose} size="6xl">
          <ModalOverlay bg="blackAlpha.900" />
          <ModalContent bg="transparent" shadow="none" maxW="90vw" maxH="90vh">
            <ModalCloseButton color="white" size="lg" zIndex={2} />
            <ModalBody p={0} display="flex" alignItems="center" justifyContent="center">
              {viewingVideo && (
                <VStack spacing={4} w="full" h="full" justify="center">
                  <Box maxW="full" maxH="80vh" w="full">
                    <VideoPlayer
                      url={viewingVideo.video_url}
                      type={viewingVideo.video_type}
                      title={viewingVideo.title}
                      thumbnail={viewingVideo.thumbnail_url}
                    />
                  </Box>

                  <VStack spacing={2} textAlign="center" maxW="2xl">
                    <Heading size="md" color="white">
                      {viewingVideo.title}
                    </Heading>
                    {viewingVideo.description && (
                      <Text color="gray.300" fontSize="sm">
                        {viewingVideo.description}
                      </Text>
                    )}
                    <Text color="gray.400" fontSize="xs">
                      Added {new Date(viewingVideo.created_at).toLocaleDateString()}
                    </Text>
                  </VStack>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  )
}
