"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Badge,
  Grid,
  GridItem,
  Image,
  AspectRatio,
  Button,
  Flex,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Divider,
  Wrap,
  WrapItem,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Avatar,
} from "@chakra-ui/react"
import { MapPin, Calendar, Trophy, Star, Target, Award, Camera, Play, Mail, Phone, GraduationCap } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { VideoPlaylist } from "@/components/VideoPlaylist"
import type {
  AthleteProfile,
  AthletePhoto,
  AthleteVideo,
  AthleteAward,
  AthleteSchedule,
  AthleteReview,
} from "@/types/database"

interface PublicProfileClientProps {
  athlete: AthleteProfile
}

// Sport to hero image mapping
const SPORT_HERO_IMAGES: Record<string, string> = {
  Football: "/hero/football.jpg",
  Basketball: "/hero/basketball.jpg",
  Baseball: "/hero/baseball.jpg",
  Soccer: "/hero/soccer.jpg",
  "Track & Field": "/hero/track-field.jpg",
  Swimming: "/hero/swimming.jpg",
  Tennis: "/hero/tennis.jpg",
  Golf: "/hero/golf.jpg",
  Volleyball: "/hero/volleyball.jpg",
  Wrestling: "/hero/wrestling.jpg",
  Softball: "/hero/softball.jpg",
  "Cross Country": "/hero/cross-country.jpg",
  Lacrosse: "/hero/lacrosse.jpg",
  Hockey: "/hero/hockey.jpg",
  Other: "/hero/generic.jpg",
}

export default function PublicProfileClient({ athlete: initialAthlete }: PublicProfileClientProps) {
  const [athlete, setAthlete] = useState<AthleteProfile>(initialAthlete)
  const [photos, setPhotos] = useState<AthletePhoto[]>([])
  const [videos, setVideos] = useState<AthleteVideo[]>([])
  const [awards, setAwards] = useState<AthleteAward[]>([])
  const [schedule, setSchedule] = useState<AthleteSchedule[]>([])
  const [reviews, setReviews] = useState<AthleteReview[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  })
  const [submittingContact, setSubmittingContact] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  useEffect(() => {
    const fetchFreshData = async () => {
      try {
        // Fetch fresh athlete data
        const { data: athleteData, error: athleteError } = await supabase
          .from("athletes")
          .select("*")
          .eq("username", initialAthlete.username)
          .eq("is_public", true)
          .single()

        if (athleteError || !athleteData) {
          throw new Error("Athlete not found")
        }

        // Transform athlete data
        const transformedAthlete: AthleteProfile = {
          id: athleteData.id,
          user_id: athleteData.user_id,
          athlete_name: athleteData.athlete_name,
          username: athleteData.username,
          sport: athleteData.sport,
          sports: athleteData.sports,
          grade: athleteData.grade,
          graduation_year: athleteData.graduation_year,
          school: athleteData.school,
          location: athleteData.location,
          bio: athleteData.bio,
          height: athleteData.height,
          weight: athleteData.weight,
          gpa: athleteData.gpa,
          sat_score: athleteData.sat_score,
          act_score: athleteData.act_score,
          positions_played: athleteData.positions_played,
          profile_picture_url: athleteData.profile_picture_url,
          primary_color: athleteData.primary_color,
          secondary_color: athleteData.secondary_color,
          subscription_tier: athleteData.subscription_tier,
          is_profile_public: athleteData.is_profile_public,
          content_order: athleteData.content_order,
          email: athleteData.email,
          phone: athleteData.phone,
          show_email: athleteData.show_email,
          show_phone: athleteData.show_phone,
          created_at: athleteData.created_at,
          updated_at: athleteData.updated_at,
        }

        setAthlete(transformedAthlete)

        // Fetch all related data in parallel
        const [photosResult, videosResult, awardsResult, scheduleResult, reviewsResult] = await Promise.all([
          supabase
            .from("athlete_photos")
            .select("*")
            .eq("athlete_id", athleteData.id)
            .eq("is_public", true)
            .order("created_at", { ascending: false }),

          supabase
            .from("athlete_videos")
            .select("*")
            .eq("athlete_id", athleteData.id)
            .eq("is_public", true)
            .order("created_at", { ascending: false }),

          supabase
            .from("athlete_awards")
            .select("*")
            .eq("athlete_id", athleteData.id)
            .eq("is_public", true)
            .order("award_date", { ascending: false }),

          supabase
            .from("athlete_schedule")
            .select("*")
            .eq("athlete_id", athleteData.id)
            .eq("is_public", true)
            .gte("event_date", new Date().toISOString())
            .order("event_date", { ascending: true }),

          supabase
            .from("athlete_reviews")
            .select("*")
            .eq("athlete_id", athleteData.id)
            .eq("is_public", true)
            .order("created_at", { ascending: false }),
        ])

        // Transform photos data
        const transformedPhotos: AthletePhoto[] =
          photosResult.data?.map((photo) => ({
            id: photo.id,
            athlete_id: photo.athlete_id,
            photo_url: photo.photo_url,
            caption: photo.caption,
            created_at: photo.created_at,
          })) || []

        // Transform videos data
        const transformedVideos: AthleteVideo[] =
          videosResult.data?.map((video) => ({
            id: video.id,
            athlete_id: video.athlete_id,
            title: video.title,
            description: video.description,
            video_url: video.video_url,
            video_type: video.video_type,
            thumbnail_url: video.thumbnail_url,
            created_at: video.created_at,
          })) || []

        // Transform awards data
        const transformedAwards: AthleteAward[] =
          awardsResult.data?.map((award) => ({
            id: award.id,
            athlete_id: award.athlete_id,
            title: award.title,
            organization: award.organization,
            award_date: award.award_date || award.date_received,
            award_type: award.award_type_new || "other",
            level: award.level,
            description: award.description,
            created_at: award.created_at,
          })) || []

        // Transform schedule data
        const transformedSchedule: AthleteSchedule[] =
          scheduleResult.data?.map((event) => ({
            id: event.id,
            athlete_id: event.athlete_id,
            event_title: event.title,
            event_date: event.event_date,
            event_time: event.event_time,
            location: event.location,
            event_type: event.event_type || "other",
            description: event.description,
            created_at: event.created_at,
          })) || []

        // Transform reviews data
        const transformedReviews: AthleteReview[] =
          reviewsResult.data?.map((review) => ({
            id: review.id,
            athlete_id: review.athlete_id,
            reviewer_name: review.reviewer_name,
            reviewer_title: review.reviewer_title,
            reviewer_organization: review.reviewer_organization,
            rating: review.rating,
            review_text: review.review_text,
            is_verified: review.is_verified,
            created_at: review.created_at,
          })) || []

        setPhotos(transformedPhotos)
        setVideos(transformedVideos)
        setAwards(transformedAwards)
        setSchedule(transformedSchedule)
        setReviews(transformedReviews)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFreshData()
  }, [initialAthlete.username])

  const getHeroImage = () => {
    return SPORT_HERO_IMAGES[athlete.sport] || SPORT_HERO_IMAGES["Other"]
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingContact(true)

    try {
      const { error } = await supabase.from("contact_submissions").insert({
        athlete_id: athlete.id,
        name: contactForm.name,
        email: contactForm.email,
        organization: contactForm.organization,
        message: contactForm.message,
      })

      if (error) throw error

      toast({
        title: "Message sent!",
        description: "Your message has been sent to the athlete successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      setContactForm({ name: "", email: "", organization: "", message: "" })
      onClose()
    } catch (error: any) {
      console.error("Error submitting contact form:", error)
      toast({
        title: "Error sending message",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSubmittingContact(false)
    }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    )
  }

  const displayedPhotos = showAllPhotos ? photos : photos.slice(0, 6)

  const stats = [
    { label: "Sport", value: athlete.sport || "N/A", icon: Target },
    { label: "Grade", value: athlete.grade || "N/A", icon: GraduationCap },
    { label: "Class Year", value: athlete.graduation_year?.toString() || "N/A", icon: Calendar },
    { label: "Height", value: athlete.height || "N/A", icon: Award },
    { label: "Weight", value: athlete.weight || "N/A", icon: Award },
    { label: "GPA", value: athlete.gpa?.toString() || "N/A", icon: Star },
    { label: "SAT Score", value: athlete.sat_score?.toString() || "N/A", icon: Trophy },
    { label: "ACT Score", value: athlete.act_score?.toString() || "N/A", icon: Trophy },
  ]

  return (
    <Box>
      {/* Hero Section with Overlaid Content */}
      <Box
        position="relative"
        h={{ base: "500px", md: "600px" }}
        bgImage={`url('${getHeroImage()}')`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
      >
        {/* Overlay */}
        <Box
          position="absolute"
          inset={0}
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Container maxW="6xl">
            <VStack spacing={4} textAlign="center" color="white">
              <Avatar
                size="2xl"
                src={athlete.profile_picture_url}
                name={athlete.athlete_name}
                border="4px solid white"
              />
              <VStack spacing={2}>
                <Heading size="2xl" fontWeight="bold">
                  {athlete.athlete_name}
                </Heading>
                <HStack spacing={4} flexWrap="wrap" justify="center">
                  <Badge colorScheme="blue" variant="solid" fontSize="md" px={3} py={1}>
                    {athlete.sport}
                  </Badge>
                  {athlete.sports && athlete.sports.length > 0 && (
                    <>
                      {athlete.sports.map((sport) => (
                        <Badge key={sport} colorScheme="purple" variant="solid" fontSize="sm" px={2} py={1}>
                          {sport}
                        </Badge>
                      ))}
                    </>
                  )}
                </HStack>
                {athlete.positions_played && athlete.positions_played.length > 0 && (
                  <Wrap justify="center" mt={2}>
                    {athlete.positions_played.map((position) => (
                      <WrapItem key={position}>
                        <Badge
                          colorScheme="green"
                          variant="outline"
                          fontSize="sm"
                          px={2}
                          py={1}
                          color="white"
                          borderColor="white"
                        >
                          {position}
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
                <HStack spacing={6} fontSize="lg" flexWrap="wrap" justify="center">
                  {athlete.school && (
                    <HStack>
                      <GraduationCap size={20} />
                      <Text>{athlete.school}</Text>
                    </HStack>
                  )}
                  {athlete.location && (
                    <HStack>
                      <MapPin size={20} />
                      <Text>{athlete.location}</Text>
                    </HStack>
                  )}
                  {athlete.graduation_year && (
                    <HStack>
                      <Calendar size={20} />
                      <Text>Class of {athlete.graduation_year}</Text>
                    </HStack>
                  )}
                </HStack>
                {/* Contact Buttons */}
                <HStack spacing={4} mt={4}>
                  {athlete.email && athlete.show_email && (
                    <Button
                      as="a"
                      href={`mailto:${athlete.email}`}
                      leftIcon={<Mail size={16} />}
                      size="md"
                      colorScheme="blue"
                      variant="solid"
                      bg="blue.500"
                      _hover={{ bg: "blue.600" }}
                    >
                      Email
                    </Button>
                  )}
                  {athlete.phone && athlete.show_phone && (
                    <Button
                      as="a"
                      href={`tel:${athlete.phone}`}
                      leftIcon={<Phone size={16} />}
                      size="md"
                      colorScheme="green"
                      variant="solid"
                      bg="green.500"
                      _hover={{ bg: "green.600" }}
                    >
                      Call
                    </Button>
                  )}
                  <Button
                    leftIcon={<Mail size={16} />}
                    size="md"
                    colorScheme="purple"
                    variant="solid"
                    bg="purple.500"
                    _hover={{ bg: "purple.600" }}
                    onClick={onOpen}
                  >
                    Contact
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </Container>
        </Box>
      </Box>

      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Bio Section */}
          {athlete.bio && (
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  About {athlete.athlete_name}
                </Heading>
                <Text lineHeight="tall" color="gray.700">
                  {athlete.bio}
                </Text>
              </CardBody>
            </Card>
          )}

          {/* Stats Grid */}
          <Card>
            <CardBody>
              <Heading size="md" mb={6}>
                Athlete Stats
              </Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                {stats.map((stat, index) => (
                  <Stat key={index}>
                    <StatLabel>
                      <HStack spacing={2}>
                        <Icon as={stat.icon} size={16} color="blue.500" />
                        <Text>{stat.label}</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber fontSize="lg">{stat.value}</StatNumber>
                  </Stat>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Videos Section - Full Width */}
          {videos.length > 0 && (
            <Box>
              <Heading size="lg" mb={4}>
                <HStack spacing={2}>
                  <Icon as={Play} color="blue.500" />
                  <Text>Game Film & Highlights</Text>
                </HStack>
              </Heading>
              <VideoPlaylist videos={videos} />
            </Box>
          )}

          {/* Awards and Photos Side by Side */}
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
            {/* Awards Section */}
            {awards.length > 0 && (
              <GridItem>
                <Card h="fit-content">
                  <CardBody>
                    <Heading size="md" mb={4}>
                      <HStack spacing={2}>
                        <Icon as={Trophy} color="gold" />
                        <Text>Awards & Honors</Text>
                      </HStack>
                    </Heading>
                    <VStack spacing={4} align="stretch">
                      {awards.slice(0, 5).map((award) => (
                        <Box key={award.id}>
                          <HStack justify="space-between" align="start">
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="semibold">{award.title}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {award.organization}
                              </Text>
                              {award.description && (
                                <Text fontSize="sm" color="gray.500">
                                  {award.description}
                                </Text>
                              )}
                            </VStack>
                            <Badge colorScheme="blue" fontSize="xs">
                              {new Date(award.award_date).getFullYear()}
                            </Badge>
                          </HStack>
                          <Divider mt={3} />
                        </Box>
                      ))}
                      {awards.length > 5 && (
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          +{awards.length - 5} more awards
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            )}

            {/* Photos Section */}
            {photos.length > 0 && (
              <GridItem>
                <Card h="fit-content">
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">
                        <HStack spacing={2}>
                          <Icon as={Camera} color="purple.500" />
                          <Text>Photo Gallery</Text>
                        </HStack>
                      </Heading>
                      {photos.length > 6 && (
                        <Button size="sm" variant="ghost" onClick={() => setShowAllPhotos(!showAllPhotos)}>
                          {showAllPhotos ? "Show Less" : `View All (${photos.length})`}
                        </Button>
                      )}
                    </Flex>
                    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                      {displayedPhotos.map((photo) => (
                        <GridItem key={photo.id}>
                          <AspectRatio ratio={1}>
                            <Image
                              src={photo.photo_url || "/placeholder.svg"}
                              alt={photo.caption || "Athlete photo"}
                              objectFit="cover"
                              borderRadius="md"
                              cursor="pointer"
                              _hover={{ opacity: 0.8 }}
                              transition="opacity 0.2s"
                            />
                          </AspectRatio>
                        </GridItem>
                      ))}
                    </Grid>
                  </CardBody>
                </Card>
              </GridItem>
            )}
          </Grid>

          {/* Upcoming Schedule */}
          {schedule.length > 0 && (
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  <HStack spacing={2}>
                    <Icon as={Calendar} color="green.500" />
                    <Text>Upcoming Schedule</Text>
                  </HStack>
                </Heading>
                <VStack spacing={4} align="stretch">
                  {schedule.map((event) => (
                    <Box key={event.id}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="semibold">{event.event_title}</Text>
                          <HStack spacing={4}>
                            <Text fontSize="sm" color="gray.600">
                              {new Date(event.event_date).toLocaleDateString()}
                            </Text>
                            {event.event_time && (
                              <Text fontSize="sm" color="gray.600">
                                {event.event_time}
                              </Text>
                            )}
                            {event.location && (
                              <Text fontSize="sm" color="gray.600">
                                📍 {event.location}
                              </Text>
                            )}
                          </HStack>
                          {event.description && (
                            <Text fontSize="sm" color="gray.500">
                              {event.description}
                            </Text>
                          )}
                        </VStack>
                        <Badge colorScheme="green" fontSize="xs">
                          {event.event_type}
                        </Badge>
                      </HStack>
                      <Divider mt={3} />
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  <HStack spacing={2}>
                    <Icon as={Star} color="yellow.500" />
                    <Text>Coach Reviews</Text>
                  </HStack>
                </Heading>
                <VStack spacing={4} align="stretch">
                  {reviews.slice(0, 3).map((review) => (
                    <Box key={review.id} p={4} bg="gray.50" borderRadius="md">
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="semibold">{review.reviewer_name}</Text>
                            {review.reviewer_title && review.reviewer_organization && (
                              <Text fontSize="sm" color="gray.600">
                                {review.reviewer_title} at {review.reviewer_organization}
                              </Text>
                            )}
                          </VStack>
                          <HStack>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                              />
                            ))}
                          </HStack>
                        </HStack>
                        <Text fontSize="sm">{review.review_text}</Text>
                        {review.is_verified && (
                          <Badge colorScheme="green" size="sm">
                            Verified Review
                          </Badge>
                        )}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>

      {/* Contact Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contact {athlete.athlete_name}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleContactSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Your Name</FormLabel>
                  <Input
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Enter your email address"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Organization</FormLabel>
                  <Input
                    value={contactForm.organization}
                    onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                    placeholder="School, team, or organization (optional)"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Enter your message..."
                    rows={4}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="blue" isLoading={submittingContact} loadingText="Sending...">
                Send Message
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  )
}
