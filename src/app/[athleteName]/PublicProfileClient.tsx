"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Avatar,
  Badge,
  Grid,
  GridItem,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
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
  useDisclosure,
  useToast,
  Spinner,
} from "@chakra-ui/react"
import { Mail, MapPin, GraduationCap, Calendar, CheckCircle, Star } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { filterContentByTier, hasFeature, type SubscriptionTier } from "@/utils/tierFeatures"
import type { Profile } from "@/types/database"

interface AthleteVideo {
  id: string
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  is_public: boolean
  created_at: string
}

interface AthletePhoto {
  id: string
  title?: string
  description?: string
  photo_url: string
  is_public: boolean
  created_at: string
}

interface AthleteAward {
  id: string
  title: string
  organization?: string
  award_date?: string
  date_received?: string
  description?: string
  is_public: boolean
}

interface AthleteReview {
  id: string
  reviewer_name: string
  reviewer_title?: string
  reviewer_organization?: string
  rating: number
  review_text: string
  is_verified: boolean
  is_public: boolean
  created_at: string
}

interface AthleteSchedule {
  id: string
  event_name: string
  event_type: string
  event_date: string
  location?: string
  is_public: boolean
}

interface PublicProfileClientProps {
  athlete: Profile & {
    subscription_tier: SubscriptionTier
    sports?: string[]
  }
}

export default function PublicProfileClient({ athlete: initialAthlete }: PublicProfileClientProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [athlete, setAthlete] = useState(initialAthlete)
  const [videos, setVideos] = useState<AthleteVideo[]>([])
  const [photos, setPhotos] = useState<AthletePhoto[]>([])
  const [awards, setAwards] = useState<AthleteAward[]>([])
  const [schedule, setSchedule] = useState<AthleteSchedule[]>([])
  const [reviews, setReviews] = useState<AthleteReview[]>([])
  const [loading, setLoading] = useState(true)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchAthleteData()
  }, [athlete.id])

  // Set up real-time subscription for athlete updates
  useEffect(() => {
    const channel = supabase
      .channel("public-athlete-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "athletes",
          filter: `id=eq.${athlete.id}`,
        },
        (payload) => {
          console.log("Public profile athlete updated:", payload.new)
          setAthlete(payload.new as typeof athlete)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [athlete.id, supabase])

  const fetchAthleteData = async () => {
    try {
      const [videosRes, photosRes, awardsRes, scheduleRes, reviewsRes] = await Promise.all([
        supabase.from("athlete_videos").select("*").eq("athlete_id", athlete.id).eq("is_public", true),
        supabase.from("athlete_photos").select("*").eq("athlete_id", athlete.id).eq("is_public", true),
        supabase.from("athlete_awards").select("*").eq("athlete_id", athlete.id).eq("is_public", true),
        supabase.from("athlete_schedule").select("*").eq("athlete_id", athlete.id).eq("is_public", true),
        supabase.from("athlete_reviews").select("*").eq("athlete_id", athlete.id).eq("is_public", true),
      ])

      // Filter content based on subscription tier
      const filteredVideos = filterContentByTier(videosRes.data || [], athlete.subscription_tier, "videos")
      const filteredPhotos = filterContentByTier(photosRes.data || [], athlete.subscription_tier, "photos")
      const filteredAwards = filterContentByTier(awardsRes.data || [], athlete.subscription_tier, "awards")
      const filteredSchedule = filterContentByTier(scheduleRes.data || [], athlete.subscription_tier, "schedule")
      const filteredReviews = filterContentByTier(reviewsRes.data || [], athlete.subscription_tier, "reviews")

      setVideos(filteredVideos as AthleteVideo[])
      setPhotos(filteredPhotos as AthletePhoto[])
      setAwards(filteredAwards as AthleteAward[])
      setSchedule(filteredSchedule as AthleteSchedule[])
      setReviews(filteredReviews as AthleteReview[])
    } catch (error) {
      console.error("Error fetching athlete data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleContactSubmit = async () => {
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast({
        title: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        athlete_id: athlete.id,
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        organization: contactForm.organization.trim() || null,
        message: contactForm.message.trim(),
      })

      if (error) throw error

      toast({
        title: "Message sent successfully!",
        description: "The athlete will receive your message.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      setContactForm({ name: "", email: "", organization: "", message: "" })
      onClose()
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!athlete.is_profile_public) {
    return (
      <Container maxW="4xl" py={20}>
        <VStack spacing={8} textAlign="center">
          <Heading size="lg">Profile Not Available</Heading>
          <Text color="gray.600">This athlete profile is currently private.</Text>
        </VStack>
      </Container>
    )
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" />
      </Box>
    )
  }

  // Determine which sports to display
  const displaySports =
    hasFeature(athlete.subscription_tier, "multiple_sports") && athlete.sports?.length
      ? athlete.sports
      : [athlete.sport]

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Hero Section */}
      <Box
        bgGradient={`linear(to-r, ${athlete.primary_color || "#1a202c"}, ${athlete.secondary_color || "#2d3748"})`}
        color="white"
        py={20}
      >
        <Container maxW="7xl">
          <VStack spacing={6} textAlign="center">
            <Avatar
              size="2xl"
              src={athlete.profile_picture_url || undefined}
              name={athlete.athlete_name}
              key={`public-avatar-${athlete.profile_picture_url}`}
              border="4px solid white"
            />
            <VStack spacing={2}>
              <Heading size="2xl">{athlete.athlete_name}</Heading>

              {/* Sports Display */}
              <HStack spacing={3} flexWrap="wrap" justify="center">
                {displaySports.map((sport, index) => (
                  <Badge key={index} colorScheme="whiteAlpha" variant="solid" fontSize="md" px={3} py={1}>
                    {sport}
                  </Badge>
                ))}
                {hasFeature(athlete.subscription_tier, "multiple_sports") && displaySports.length > 1 && (
                  <Badge colorScheme="purple" variant="solid" fontSize="md" px={3} py={1}>
                    Multi-Sport
                  </Badge>
                )}
              </HStack>

              {/* School and Location */}
              <VStack spacing={1}>
                {athlete.school && (
                  <HStack spacing={2}>
                    <GraduationCap size={16} />
                    <Text fontSize="lg">{athlete.school}</Text>
                  </HStack>
                )}
                {athlete.location && (
                  <HStack spacing={2}>
                    <MapPin size={16} />
                    <Text fontSize="lg">{athlete.location}</Text>
                  </HStack>
                )}
                {athlete.graduation_year && (
                  <HStack spacing={2}>
                    <Calendar size={16} />
                    <Text fontSize="lg">Class of {athlete.graduation_year}</Text>
                  </HStack>
                )}
              </VStack>

              {/* Grade Badge */}
              {athlete.grade && (
                <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                  {athlete.grade}
                </Badge>
              )}
            </VStack>

            {/* Bio */}
            {athlete.bio && (
              <Text fontSize="lg" maxW="3xl" textAlign="center">
                {athlete.bio}
              </Text>
            )}

            <Button size="lg" colorScheme="whiteAlpha" onClick={onOpen} leftIcon={<Mail size={20} />}>
              Contact {athlete.athlete_name.split(" ")[0]}
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxW="7xl" py={10}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Stat textAlign="center">
            <StatLabel>Videos</StatLabel>
            <StatNumber>{videos.length}</StatNumber>
          </Stat>
          <Stat textAlign="center">
            <StatLabel>Awards</StatLabel>
            <StatNumber>{awards.length}</StatNumber>
          </Stat>
          <Stat textAlign="center">
            <StatLabel>Photos</StatLabel>
            <StatNumber>{photos.length}</StatNumber>
          </Stat>
          <Stat textAlign="center">
            <StatLabel>Reviews</StatLabel>
            <StatNumber>{reviews.length}</StatNumber>
          </Stat>
        </SimpleGrid>
      </Container>

      {/* Content Sections */}
      <Container maxW="7xl" pb={20}>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          <GridItem>
            <VStack spacing={8} align="stretch">
              {/* Videos Section */}
              {videos.length > 0 && (
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>
                      Game Film ({videos.length})
                    </Heading>
                    {athlete.subscription_tier === "free" && videos.length >= 3 && (
                      <Text fontSize="sm" color="gray.500" mb={4}>
                        Showing {videos.length} videos (Free tier limit)
                      </Text>
                    )}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {videos.map((video) => (
                        <Box key={video.id} bg="gray.100" rounded="md" p={4}>
                          <Text fontWeight="bold">{video.title}</Text>
                          {video.description && (
                            <Text fontSize="sm" color="gray.600">
                              {video.description}
                            </Text>
                          )}
                        </Box>
                      ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>
              )}

              {/* Awards Section */}
              {awards.length > 0 && (
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>
                      Awards & Achievements ({awards.length})
                    </Heading>
                    <VStack spacing={4} align="stretch">
                      {awards.map((award) => (
                        <Box key={award.id} p={4} bg="gray.50" rounded="md">
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{award.title}</Text>
                              {award.organization && (
                                <Text fontSize="sm" color="gray.600">
                                  {award.organization}
                                </Text>
                              )}
                              {award.description && (
                                <Text fontSize="sm" color="gray.700">
                                  {award.description}
                                </Text>
                              )}
                            </VStack>
                            <Text fontSize="sm" color="gray.500">
                              {new Date(award.award_date || award.date_received || "").getFullYear()}
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Photos Section */}
              {photos.length > 0 && (
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>
                      Photos ({photos.length})
                    </Heading>
                    {athlete.subscription_tier === "free" && photos.length >= 10 && (
                      <Text fontSize="sm" color="gray.500" mb={4}>
                        Showing {photos.length} photos (Free tier limit)
                      </Text>
                    )}
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                      {photos.map((photo) => (
                        <Box key={photo.id} bg="gray.100" rounded="md" aspectRatio={1}>
                          <Text p={2} fontSize="sm" fontWeight="medium">
                            {photo.title || "Photo"}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>

          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Athlete Info */}
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>
                    Athlete Info
                  </Heading>
                  <VStack spacing={3} align="stretch">
                    {athlete.height && (
                      <HStack justify="space-between">
                        <Text>Height:</Text>
                        <Text fontWeight="bold">{athlete.height}</Text>
                      </HStack>
                    )}
                    {athlete.weight && (
                      <HStack justify="space-between">
                        <Text>Weight:</Text>
                        <Text fontWeight="bold">{athlete.weight}</Text>
                      </HStack>
                    )}
                    {athlete.positions_played && athlete.positions_played.length > 0 && (
                      <VStack align="stretch" spacing={2}>
                        <Text>Positions:</Text>
                        <HStack wrap="wrap">
                          {athlete.positions_played.map((position, index) => (
                            <Badge key={index} colorScheme="blue">
                              {position}
                            </Badge>
                          ))}
                        </HStack>
                      </VStack>
                    )}
                    {athlete.gpa && (
                      <HStack justify="space-between">
                        <Text>GPA:</Text>
                        <Text fontWeight="bold">{athlete.gpa}</Text>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Reviews Section */}
              {reviews.length > 0 && (
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>
                      Coach Reviews ({reviews.length})
                    </Heading>
                    <VStack spacing={4} align="stretch">
                      {reviews.slice(0, 3).map((review) => (
                        <Box key={review.id} p={4} bg="gray.50" rounded="md">
                          <VStack align="start" spacing={2}>
                            <HStack justify="space-between" w="full">
                              <HStack>
                                <Text fontWeight="bold">{review.reviewer_name}</Text>
                                {review.is_verified && (
                                  <Badge colorScheme="green" size="sm">
                                    <HStack spacing={1}>
                                      <CheckCircle size={12} />
                                      <Text>Verified</Text>
                                    </HStack>
                                  </Badge>
                                )}
                              </HStack>
                              <HStack spacing={1}>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    fill={i < review.rating ? "gold" : "none"}
                                    color={i < review.rating ? "gold" : "gray"}
                                  />
                                ))}
                              </HStack>
                            </HStack>
                            {review.reviewer_title && (
                              <Text fontSize="sm" color="gray.600">
                                {review.reviewer_title}
                                {review.reviewer_organization && ` • ${review.reviewer_organization}`}
                              </Text>
                            )}
                            <Text fontSize="sm">{review.review_text}</Text>
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Schedule Section */}
              {schedule.length > 0 && (
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>
                      Upcoming Events ({schedule.length})
                    </Heading>
                    <VStack spacing={3} align="stretch">
                      {schedule.slice(0, 5).map((event) => (
                        <Box key={event.id} p={3} bg="gray.50" rounded="md">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">
                              {event.event_name}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {event.event_type} • {new Date(event.event_date).toLocaleDateString()}
                            </Text>
                            {event.location && (
                              <Text fontSize="xs" color="gray.500">
                                📍 {event.location}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Subscription Tier Badge */}
              <Card>
                <CardBody textAlign="center">
                  <Badge
                    colorScheme={
                      athlete.subscription_tier === "pro"
                        ? "purple"
                        : athlete.subscription_tier === "premium"
                          ? "blue"
                          : "gray"
                    }
                    variant="outline"
                    px={4}
                    py={2}
                    fontSize="sm"
                  >
                    {athlete.subscription_tier.toUpperCase()} Profile
                  </Badge>
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Powered by RecruitMyGame
                  </Text>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Container>

      {/* Contact Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contact {athlete.athlete_name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Your full name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Organization</FormLabel>
                <Input
                  value={contactForm.organization}
                  onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                  placeholder="University, Team, or Organization"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={4}
                  placeholder="Tell the athlete about your interest, opportunities, or questions..."
                />
              </FormControl>
              <Button
                colorScheme="blue"
                onClick={handleContactSubmit}
                w="full"
                isLoading={submitting}
                loadingText="Sending..."
              >
                Send Message
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
