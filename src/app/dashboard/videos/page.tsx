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
  useToast,
  Spinner,
  Center,
  Badge,
  Progress,
  Alert,
  AlertIcon,
} from "@chakra-ui/react"
import { Plus, Edit, Trash2, Video } from "lucide-react"
import Link from "next/link"
import { VideoPlayer } from "@/components/VideoPlayer"
import type { AthleteVideo } from "@/types/database"
import { getSubscriptionLimits, canUploadMore, getUpgradeMessage, type SubscriptionTier } from "@/utils/subscription"

const VIDEO_TYPES = [
  { value: "highlight", label: "Highlight Reel" },
  { value: "game", label: "Game Footage" },
  { value: "training", label: "Training Session" },
  { value: "interview", label: "Interview" },
  { value: "other", label: "Other" },
]

export default function VideosPage() {
  const [athlete, setAthlete] = useState<any>(null)
  const [videos, setVideos] = useState<AthleteVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingVideo, setEditingVideo] = useState<AthleteVideo | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    video_type: "",
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
    if (!athlete) return

    setSaving(true)
    try {
      const videoData = {
        ...formData,
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

  const handleDelete = async (video: AthleteVideo) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const { error } = await supabase.from("athlete_videos").delete().eq("id", video.id)
      if (error) throw error

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

  const handleEdit = (video: AthleteVideo) => {
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

  const handleCloseModal = () => {
    setEditingVideo(null)
    setFormData({
      title: "",
      description: "",
      video_url: "",
      video_type: "",
      thumbnail_url: "",
    })
    onClose()
  }

  const getVideoTypeInfo = (type: string) => {
    return VIDEO_TYPES.find((t) => t.value === type) || VIDEO_TYPES[4]
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
          <Button colorScheme="teal" size="lg">
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
              Video Library
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
            colorScheme="teal"
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
                  <Video size={48} />
                </Box>
                <Heading size="md" color="gray.600">
                  No videos yet
                </Heading>
                <Text color="gray.500" maxW="md">
                  Start building your video library by adding highlight reels, game footage, and training sessions.
                </Text>
                <Button leftIcon={<Plus size={16} />} colorScheme="teal" onClick={onOpen} isDisabled={!canAddMore}>
                  Add Your First Video
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            {videos.map((video) => {
              const typeInfo = getVideoTypeInfo(video.video_type)
              return (
                <Card key={video.id} overflow="hidden">
                  <CardBody p={0}>
                    <VideoPlayer
                      videoUrl={video.video_url}
                      title={video.title}
                      description={video.description || undefined}
                      thumbnailUrl={video.thumbnail_url || undefined}
                    />
                    <Box p={4}>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1} flex={1}>
                            <Heading size="sm" noOfLines={2}>
                              {video.title}
                            </Heading>
                            <Badge colorScheme="teal" variant="subtle" fontSize="xs">
                              {typeInfo.label}
                            </Badge>
                          </VStack>
                          <HStack spacing={1}>
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
                        </HStack>
                        {video.description && (
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {video.description}
                          </Text>
                        )}
                        <Text fontSize="xs" color="gray.500">
                          Added {new Date(video.created_at).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </Box>
                  </CardBody>
                </Card>
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
                    <FormLabel>Video Title</FormLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Game highlights, training session, etc."
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Video URL</FormLabel>
                    <Input
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="YouTube, Vimeo, or direct video URL"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Video Type</FormLabel>
                    <Select
                      value={formData.video_type}
                      onChange={(e) => setFormData({ ...formData, video_type: e.target.value })}
                      placeholder="Select video type"
                    >
                      {VIDEO_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the video content..."
                      rows={3}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Custom Thumbnail URL (Optional)</FormLabel>
                    <Input
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="Custom thumbnail image URL"
                    />
                  </FormControl>

                  <HStack spacing={3} w="full" pt={4}>
                    <Button variant="ghost" onClick={handleCloseModal} flex={1}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="teal"
                      isLoading={saving}
                      loadingText={editingVideo ? "Updating..." : "Adding..."}
                      flex={1}
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
