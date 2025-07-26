"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  Divider,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Image,
  AspectRatio,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react"
import { MapPin, GraduationCap, Calendar, Trophy, Star, Video, ImageIcon, School, Target, Clock } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { filterContentByTier, getTierDisplayName, getTierColor } from "@/utils/tierFeatures"
import type {
  AthleteProfile,
  AthleteVideo,
  AthletePhoto,
  AthleteAward,
  AthleteSchedule,
  AthleteReview,
} from "@/types/database"

interface PublicProfileClientProps {
  athlete: AthleteProfile
}

export default function PublicProfileClient({ athlete: initialAthlete }: PublicProfileClientProps) {
  const [athlete, setAthlete] = useState<AthleteProfile>(initialAthlete)
  const [videos, setVideos] = useState<AthleteVideo[]>([])
  const [photos, setPhotos] = useState<AthletePhoto[]>([])
  const [awards, setAwards] = useState<AthleteAward[]>([])
  const [schedule, setSchedule] = useState<AthleteSchedule[]>([])
  const [reviews, setReviews] = useState<AthleteReview[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  // Check if profile is public (default to true if not explicitly set to false)
  const isProfilePublic = athlete.is_profile_public !== false
  const subscriptionTier = athlete.subscription_tier || "free"

  useEffect(() => {
    const fetchAthleteData = async () => {
      if (!isProfilePublic) {
        setLoading(false)
        return
      }

      try {
        // Fetch videos
        const { data: videosData } = await supabase
          .from("athlete_videos")
          .select("*")
          .eq("athlete_id", athlete.id)
          .eq("is_public", true)
          .order("created_at", { ascending: false })

        // Fetch photos
        const { data: photosData } = await supabase
          .from("athlete_photos")
          .select("*")
          .eq("athlete_id", athlete.id)
          .eq("is_public", true)
          .order("created_at", { ascending: false })

        // Fetch awards
        const { data: awardsData } = await supabase
          .from("athlete_awards")
          .select("*")
          .eq("athlete_id", athlete.id)
          .eq("is_public", true)
          .order("award_date", { ascending: false })

        // Fetch schedule (only if tier allows)
        let scheduleData: AthleteSchedule[] = []
        if (subscriptionTier === "premium" || subscriptionTier === "pro") {
          const { data } = await supabase
            .from("athlete_schedule")
            .select("*")
            .eq("athlete_id", athlete.id)
            .eq("is_public", true)
            .order("event_date", { ascending: true })
          scheduleData = data || []
        }

        // Fetch reviews (only if tier allows)
        let reviewsData: AthleteReview[] = []
        if (subscriptionTier === "premium" || subscriptionTier === "pro") {
          const { data } = await supabase
            .from("athlete_reviews")
            .select("*")
            .eq("athlete_id", athlete.id)
            .eq("is_public", true)
            .order("created_at", { ascending: false })
          reviewsData = data || []
        }

        // Apply tier-based filtering
        setVideos(filterContentByTier(videosData || [], subscriptionTier, "videos"))
        setPhotos(filterContentByTier(photosData || [], subscriptionTier, "photos"))
        setAwards(filterContentByTier(awardsData || [], subscriptionTier, "awards"))
        setSchedule(filterContentByTier(scheduleData, subscriptionTier, "schedule"))
        setReviews(filterContentByTier(reviewsData, subscriptionTier, "reviews"))
      } catch (error) {
        console.error("Error fetching athlete data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAthleteData()
  }, [athlete.id, isProfilePublic, subscriptionTier])
  console.log(athlete)
  const openPhotoModal = (photoUrl: string) => {
    setSelectedPhoto(photoUrl)
    onOpen()
  }

  if (!isProfilePublic) {
    return (
      <Container maxW="4xl" py={8}>
        <Center>
          <Alert status="info" borderRadius="lg" maxW="md">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold">Profile Private</Text>
              <Text fontSize="sm">This athlete's profile is currently set to private.</Text>
            </VStack>
          </Alert>
        </Center>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <Center>
          <Spinner size="xl" color="blue.500" />
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6}>
              {/* Profile Header */}
              <HStack spacing={6} align="start" w="full">
                <Avatar
                  src={athlete.profile_picture_url}
                  name={athlete.athlete_name}
                  size="2xl"
                  border="4px solid"
                  borderColor="blue.500"
                />
                <VStack align="start" spacing={3} flex={1}>
                  <HStack spacing={3} wrap="wrap">
                    <Heading size="xl">{athlete.athlete_name}</Heading>
                    <Badge
                      colorScheme={getTierColor(subscriptionTier)}
                      variant="subtle"
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {getTierDisplayName(subscriptionTier)}
                    </Badge>
                  </HStack>

                  {/* Basic Info */}
                  <Wrap spacing={4}>
                    {athlete.sport && (
                      <WrapItem>
                        <HStack spacing={2}>
                          <Icon as={Target} size={16} color="gray.500" />
                          <Text fontWeight="medium">{athlete.sport}</Text>
                        </HStack>
                      </WrapItem>
                    )}
                    {athlete.school && (
                      <WrapItem>
                        <HStack spacing={2}>
                          <Icon as={School} size={16} color="gray.500" />
                          <Text>{athlete.school}</Text>
                        </HStack>
                      </WrapItem>
                    )}
                    {athlete.location && (
                      <WrapItem>
                        <HStack spacing={2}>
                          <Icon as={MapPin} size={16} color="gray.500" />
                          <Text>{athlete.location}</Text>
                        </HStack>
                      </WrapItem>
                    )}
                    {athlete.graduation_year && (
                      <WrapItem>
                        <HStack spacing={2}>
                          <Icon as={GraduationCap} size={16} color="gray.500" />
                          <Text>Class of {athlete.graduation_year}</Text>
                        </HStack>
                      </WrapItem>
                    )}
                  </Wrap>

                  {/* Additional Stats */}
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                    {athlete.height && (
                      <VStack spacing={1}>
                        <Text fontSize="sm" color="gray.500">
                          Height
                        </Text>
                        <Text fontWeight="bold">{athlete.height}</Text>
                      </VStack>
                    )}
                    {athlete.weight && (
                      <VStack spacing={1}>
                        <Text fontSize="sm" color="gray.500">
                          Weight
                        </Text>
                        <Text fontWeight="bold">{athlete.weight}</Text>
                      </VStack>
                    )}
                       {/* Loop through positions_played for this athlete */}
                        {athlete.positions_played && athlete.positions_played.length > 0 ? (
                          <VStack spacing={1} align="start">
                            <Text fontSize="sm" color="gray.500">
                              Positions
                            </Text>
                            {athlete.positions_played.map((pos, idx) => (
                              <Text key={idx} fontWeight="bold">
                                {pos}
                              </Text>
                            ))}
                          </VStack>
                        ) : (
                          <Text color="gray.400" fontStyle="italic">
                            No positions listed
                          </Text>
                        )}
                    {athlete.gpa && (
                      <VStack spacing={1}>
                        <Text fontSize="sm" color="gray.500">
                          GPA
                        </Text>
                        <Text fontWeight="bold">{athlete.gpa}</Text>
                      </VStack>
                    )}
                  </SimpleGrid>
                </VStack>
              </HStack>

              {/* Bio */}
              {athlete.bio && (
                <>
                  <Divider />
                  <Box w="full">
                    <Text fontSize="lg" lineHeight="tall">
                      {athlete.bio}
                    </Text>
                  </Box>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Content Sections */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Videos Section */}
          {videos.length > 0 && (
            <Card bg={bgColor} borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2}>
                    <Icon as={Video} color="blue.500" />
                    <Heading size="md">Videos</Heading>
                    <Badge variant="subtle">{videos.length}</Badge>
                  </HStack>
                  <VStack spacing={3}>
                    {videos.map((video) => (
                      <Box key={video.id} w="full">
                        <AspectRatio ratio={16 / 9}>
                          {video.video_type === "youtube" && video.youtube_url ? (
                            <iframe
                              src={video.youtube_url.replace("watch?v=", "embed/")}
                              title={video.title}
                              allowFullScreen
                            />
                          ) : (
                            <video controls poster={video.thumbnail_url}>
                              <source src={video.video_url} type="video/mp4" />
                            </video>
                          )}
                        </AspectRatio>
                        <VStack align="start" spacing={1} mt={2}>
                          <Text fontWeight="bold">{video.title}</Text>
                          {video.description && (
                            <Text fontSize="sm" color="gray.600">
                              {video.description}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Photos Section */}
          {photos.length > 0 && (
            <Card bg={bgColor} borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2}>
                    <Icon as={ImageIcon} color="green.500" />
                    <Heading size="md">Photos</Heading>
                    <Badge variant="subtle">{photos.length}</Badge>
                  </HStack>
                  <SimpleGrid columns={2} spacing={3}>
                    {photos.map((photo) => (
                      <Box
                        key={photo.id}
                        cursor="pointer"
                        onClick={() => openPhotoModal(photo.photo_url)}
                        _hover={{ transform: "scale(1.05)" }}
                        transition="transform 0.2s"
                      >
                        <AspectRatio ratio={1}>
                          <Image
                            src={photo.photo_url || "/placeholder.svg"}
                            alt={photo.caption || "Athlete photo"}
                            objectFit="cover"
                            borderRadius="md"
                          />
                        </AspectRatio>
                      </Box>
                    ))}
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Awards Section */}
          {awards.length > 0 && (
            <Card bg={bgColor} borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2}>
                    <Icon as={Trophy} color="yellow.500" />
                    <Heading size="md">Awards & Achievements</Heading>
                    <Badge variant="subtle">{awards.length}</Badge>
                  </HStack>
                  <VStack spacing={3}>
                    {awards.map((award) => (
                      <Box key={award.id} w="full" p={3} bg="gray.50" borderRadius="md">
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="bold">{award.title}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {new Date(award.award_date).getFullYear()}
                            </Text>
                          </HStack>
                          {award.organization && (
                            <Text fontSize="sm" color="blue.600">
                              {award.organization}
                            </Text>
                          )}
                          {award.description && (
                            <Text fontSize="sm" color="gray.600">
                              {award.description}
                            </Text>
                          )}
                          {award.level && (
                            <Badge size="sm" colorScheme="purple">
                              {award.level}
                            </Badge>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Schedule Section */}
          {schedule.length > 0 && (
            <Card bg={bgColor} borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2}>
                    <Icon as={Calendar} color="purple.500" />
                    <Heading size="md">Upcoming Schedule</Heading>
                    <Badge variant="subtle">{schedule.length}</Badge>
                  </HStack>
                  <VStack spacing={3}>
                    {schedule.map((event) => (
                      <Box key={event.id} w="full" p={3} bg="gray.50" borderRadius="md">
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="bold">{event.event_title}</Text>
                            <Badge colorScheme="blue">{event.event_type}</Badge>
                          </HStack>
                          <HStack spacing={4}>
                            <HStack spacing={1}>
                              <Icon as={Calendar} size={14} color="gray.500" />
                              <Text fontSize="sm">{new Date(event.event_date).toLocaleDateString()}</Text>
                            </HStack>
                            {event.event_time && (
                              <HStack spacing={1}>
                                <Icon as={Clock} size={14} color="gray.500" />
                                <Text fontSize="sm">{event.event_time}</Text>
                              </HStack>
                            )}
                          </HStack>
                          {event.location && (
                            <HStack spacing={1}>
                              <Icon as={MapPin} size={14} color="gray.500" />
                              <Text fontSize="sm">{event.location}</Text>
                            </HStack>
                          )}
                          {event.description && (
                            <Text fontSize="sm" color="gray.600">
                              {event.description}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <Card bg={bgColor} borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2}>
                    <Icon as={Star} color="orange.500" />
                    <Heading size="md">Reviews</Heading>
                    <Badge variant="subtle">{reviews.length}</Badge>
                  </HStack>
                  <VStack spacing={4}>
                    {reviews.map((review) => (
                      <Box key={review.id} w="full" p={4} bg="gray.50" borderRadius="md">
                        <VStack align="start" spacing={3}>
                          <HStack justify="space-between" w="full">
                            <VStack align="start" spacing={1}>
                              <HStack spacing={2}>
                                <Text fontWeight="bold">{review.reviewer_name}</Text>
                                {review.is_verified && (
                                  <Badge colorScheme="green" size="sm">
                                    Verified
                                  </Badge>
                                )}
                              </HStack>
                              {review.reviewer_title && (
                                <Text fontSize="sm" color="gray.600">
                                  {review.reviewer_title}
                                  {review.reviewer_organization && ` at ${review.reviewer_organization}`}
                                </Text>
                              )}
                            </VStack>
                            <HStack spacing={1}>
                              {[...Array(5)].map((_, i) => (
                                <Icon
                                  key={i}
                                  as={Star}
                                  size={16}
                                  color={i < review.rating ? "yellow.400" : "gray.300"}
                                  fill={i < review.rating ? "yellow.400" : "none"}
                                />
                              ))}
                            </HStack>
                          </HStack>
                          <Text fontSize="sm" lineHeight="tall">
                            {review.review_text}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </Text>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          )}
        </SimpleGrid>
      </VStack>

      {/* Photo Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Photo</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedPhoto && (
              <Image src={selectedPhoto || "/placeholder.svg"} alt="Full size photo" w="full" borderRadius="md" />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
}
