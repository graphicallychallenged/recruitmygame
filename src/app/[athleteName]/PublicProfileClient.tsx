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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
} from "@chakra-ui/react"
import { keyframes } from "@emotion/react"
import {
  MapPin,
  Calendar,
  Trophy,
  Star,
  Target,
  Award,
  Camera,
  Play,
  Mail,
  Phone,
  GraduationCap,
  Clock,
  MapPinIcon,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
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

// Animation keyframes
const pulseRing = keyframes`
  0% {
    transform: scale(0.33);
  }
  40%, 50% {
    opacity: 0;
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
`

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`

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

  // Theme colors based on athlete preferences
  const isDarkTheme = athlete.theme_mode === "dark"
  const primaryColor = athlete.primary_color || "#1a202c"
  const secondaryColor = athlete.secondary_color || "#2d3748"

  // Dynamic theme colors
  const bgColor = isDarkTheme ? "gray.900" : "white"
  const textColor = isDarkTheme ? "white" : "gray.800"
  const cardBgColor = isDarkTheme ? "gray.800" : "white"
  const borderColor = isDarkTheme ? "gray.600" : "gray.200"
  const mutedTextColor = isDarkTheme ? "gray.300" : "gray.600"

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
          theme_mode: athleteData.theme_mode || "light",
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
            event_title: event.event_name || event.event_title || event.title,
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
      <Flex justify="center" align="center" h="400px" bg={bgColor}>
        <Spinner size="xl" color={primaryColor} />
      </Flex>
    )
  }

  const displayedPhotos = showAllPhotos ? photos : photos.slice(0, 6)

  // Enhanced stats with different visual representations
  const getGPAColor = (gpa: number | undefined | null) => {
    if (!gpa) return "gray"
    if (gpa >= 3.7) return "green"
    if (gpa >= 3.0) return "blue"
    if (gpa >= 2.5) return "yellow"
    return "red"
  }

  const getGPAPercentage = (gpa: number | undefined | null) => {
    if (!gpa) return 0
    return Math.min((gpa / 4.0) * 100, 100)
  }

  const getSATPercentage = (score: number | undefined | null) => {
    if (!score) return 0
    return Math.min((score / 1600) * 100, 100)
  }

  const getACTPercentage = (score: number | undefined | null) => {
    if (!score) return 0
    return Math.min((score / 36) * 100, 100)
  }

  const enhancedStats = [
    {
      label: "Primary Sport",
      value: athlete.sport || "N/A",
      icon: Target,
      type: "badge",
      color: "blue",
      description: "Main competitive sport",
    },
    {
      label: "Academic Year",
      value: athlete.grade || "N/A",
      icon: GraduationCap,
      type: "text",
      color: "purple",
      description: "Current grade level",
    },
    {
      label: "Graduation",
      value: athlete.graduation_year?.toString() || "N/A",
      icon: Calendar,
      type: "text",
      color: "green",
      description: "Expected graduation year",
    },
    {
      label: "Height",
      value: athlete.height || "N/A",
      icon: TrendingUp,
      type: "text",
      color: "orange",
      description: "Physical measurement",
    },
    {
      label: "Weight",
      value: athlete.weight || "N/A",
      icon: Zap,
      type: "text",
      color: "red",
      description: "Physical measurement",
    },
    {
      label: "GPA",
      value: athlete.gpa ? athlete.gpa.toFixed(2) : "N/A",
      icon: Star,
      type: "progress",
      color: getGPAColor(athlete.gpa),
      percentage: getGPAPercentage(athlete.gpa),
      description: "Grade Point Average (4.0 scale)",
    },
    {
      label: "SAT Score",
      value: athlete.sat_score?.toString() || "N/A",
      icon: Trophy,
      type: "circular",
      color: "blue",
      percentage: getSATPercentage(athlete.sat_score),
      description: "Standardized test score (1600 max)",
    },
    {
      label: "ACT Score",
      value: athlete.act_score?.toString() || "N/A",
      icon: Award,
      type: "circular",
      color: "green",
      percentage: getACTPercentage(athlete.act_score),
      description: "Standardized test score (36 max)",
    },
  ]

  // Helper functions to categorize schedule events
  const now = new Date()
  const upcomingEvents = schedule.filter((event) => new Date(event.event_date) >= now)
  const pastEvents = schedule.filter((event) => new Date(event.event_date) < now)

  const renderScheduleEvent = (event: AthleteSchedule, isPast = false) => {
    const eventDate = new Date(event.event_date)
    const isToday = eventDate.toDateString() === now.toDateString()

    return (
      <Box key={event.id} opacity={isPast ? 0.7 : 1}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="semibold" color={textColor}>
              {event.event_title}
            </Text>
            <HStack spacing={4} flexWrap="wrap">
              <HStack spacing={1}>
                <Icon as={Calendar} size={14} color={mutedTextColor} />
                <Text fontSize="sm" color={mutedTextColor}>
                  {eventDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: eventDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
                  })}
                </Text>
              </HStack>
              {event.event_time && (
                <HStack spacing={1}>
                  <Icon as={Clock} size={14} color={mutedTextColor} />
                  <Text fontSize="sm" color={mutedTextColor}>
                    {event.event_time}
                  </Text>
                </HStack>
              )}
              {event.location && (
                <HStack spacing={1}>
                  <Icon as={MapPinIcon} size={14} color={mutedTextColor} />
                  <Text fontSize="sm" color={mutedTextColor}>
                    {event.location}
                  </Text>
                </HStack>
              )}
            </HStack>
            {event.description && (
              <Text fontSize="sm" color={mutedTextColor}>
                {event.description}
              </Text>
            )}
          </VStack>
          <VStack align="end" spacing={1}>
            <Badge colorScheme={isPast ? "gray" : "green"} fontSize="xs" variant={isPast ? "outline" : "solid"}>
              {event.event_type}
            </Badge>
            {isPast && (
              <Badge colorScheme="gray" variant="subtle" fontSize="xs">
                Past
              </Badge>
            )}
            {isToday && (
              <Badge colorScheme="orange" variant="solid" fontSize="xs">
                Today
              </Badge>
            )}
          </VStack>
        </HStack>
        <Divider mt={3} borderColor={borderColor} />
      </Box>
    )
  }

  const renderStatCard = (stat: any, index: number) => {
    const isNA = stat.value === "N/A"

    return (
      <Tooltip key={index} label={stat.description} placement="top" hasArrow>
        <Card
          cursor="pointer"
          transition="all 0.3s ease"
          _hover={{
            transform: "translateY(-8px)",
            shadow: "xl",
            borderColor: primaryColor,
          }}
          border="2px solid"
          borderColor="transparent"
          bg={cardBgColor}
          position="relative"
          overflow="hidden"
          style={{
            animation: `${float} 6s ease-in-out infinite`,
            animationDelay: `${index * 0.2}s`,
          }}
        >
          {/* Animated background pulse for non-N/A values */}
          {!isNA && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              w="100px"
              h="100px"
              bg={`${stat.color}.100`}
              borderRadius="full"
              transform="translate(-50%, -50%)"
              style={{
                animation: `${pulseRing} 3s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite`,
                animationDelay: `${index * 0.3}s`,
                opacity: 0.3,
              }}
            />
          )}

          <CardBody position="relative" zIndex={1}>
            <VStack spacing={3} align="center">
              <Box
                p={3}
                borderRadius="full"
                bg={`${stat.color}.100`}
                color={`${stat.color}.600`}
                transition="all 0.3s ease"
                _groupHover={{
                  bg: `${stat.color}.200`,
                  transform: "scale(1.1)",
                }}
              >
                <Icon as={stat.icon} size={24} />
              </Box>

              <VStack spacing={1} align="center">
                <Text fontSize="sm" color={mutedTextColor} fontWeight="medium" textAlign="center">
                  {stat.label}
                </Text>

                {stat.type === "badge" && !isNA && (
                  <Badge colorScheme={stat.color} variant="solid" fontSize="md" px={3} py={1}>
                    {stat.value}
                  </Badge>
                )}

                {stat.type === "text" && (
                  <Text fontSize="xl" fontWeight="bold" color={isNA ? mutedTextColor : `${stat.color}.600`}>
                    {stat.value}
                  </Text>
                )}

                {stat.type === "progress" && (
                  <VStack spacing={2} w="full">
                    <Text fontSize="lg" fontWeight="bold" color={isNA ? mutedTextColor : `${stat.color}.600`}>
                      {stat.value}
                    </Text>
                    {!isNA && (
                      <Progress
                        value={stat.percentage}
                        colorScheme={stat.color}
                        size="md"
                        w="full"
                        borderRadius="full"
                        bg={isDarkTheme ? "gray.700" : "gray.100"}
                      />
                    )}
                  </VStack>
                )}

                {stat.type === "circular" && (
                  <VStack spacing={2}>
                    {!isNA ? (
                      <CircularProgress value={stat.percentage} color={`${stat.color}.400`} size="60px" thickness="8px">
                        <CircularProgressLabel fontSize="xs" fontWeight="bold" color={textColor}>
                          {Math.round(stat.percentage)}%
                        </CircularProgressLabel>
                      </CircularProgress>
                    ) : (
                      <Box w="60px" h="60px" display="flex" alignItems="center" justifyContent="center">
                        <Text fontSize="sm" color={mutedTextColor}>
                          N/A
                        </Text>
                      </Box>
                    )}
                    <Text fontSize="md" fontWeight="bold" color={isNA ? mutedTextColor : `${stat.color}.600`}>
                      {stat.value}
                    </Text>
                  </VStack>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Tooltip>
    )
  }

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section with Overlaid Content */}
      <Box
        position="relative"
        h={{ base: "400px", md: "500px" }}
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
                  <Badge variant="solid" fontSize="md" px={3} py={1} bg={primaryColor} color="white">
                    {athlete.sport}
                  </Badge>
                  {athlete.sports && athlete.sports.length > 0 && (
                    <>
                      {athlete.sports.map((sport) => (
                        <Badge
                          key={sport}
                          variant="solid"
                          fontSize="sm"
                          px={2}
                          py={1}
                          bg={secondaryColor}
                          color="white"
                        >
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
                      variant="solid"
                      bg={primaryColor}
                      color="white"
                      _hover={{ opacity: 0.8 }}
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
                      variant="solid"
                      bg={secondaryColor}
                      color="white"
                      _hover={{ opacity: 0.8 }}
                    >
                      Call
                    </Button>
                  )}
                  <Button
                    leftIcon={<Mail size={16} />}
                    size="md"
                    variant="outline"
                    borderColor="white"
                    color="white"
                    _hover={{ bg: "whiteAlpha.200" }}
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
          {/* Videos Section - First Section */}
          {videos.length > 0 && (
            <Box>
              <Heading size="lg" mb={4} color={textColor}>
                <HStack spacing={2}>
                  <Icon as={Play} color={primaryColor} />
                  <Text>Game Film & Highlights</Text>
                </HStack>
              </Heading>
              <VideoPlaylist videos={videos} />
            </Box>
          )}

          {/* Enhanced Interactive Stats Grid */}
          <Box>
            <Heading size="lg" mb={6} textAlign="center" color={textColor}>
              <HStack spacing={2} justify="center">
                <Icon as={Users} color={primaryColor} />
                <Text>Athlete Profile</Text>
              </HStack>
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              {enhancedStats.map((stat, index) => renderStatCard(stat, index))}
            </SimpleGrid>
          </Box>

          {/* Awards and Photos Side by Side */}
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
            {/* Awards Section */}
            {awards.length > 0 && (
              <GridItem>
                <Card h="fit-content" bg={cardBgColor} borderColor={borderColor}>
                  <CardBody>
                    <Heading size="md" mb={4} color={textColor}>
                      <HStack spacing={2}>
                        <Icon as={Trophy} color={primaryColor} />
                        <Text>Awards & Honors</Text>
                      </HStack>
                    </Heading>
                    <VStack spacing={4} align="stretch">
                      {awards.slice(0, 5).map((award) => (
                        <Box key={award.id}>
                          <HStack justify="space-between" align="start">
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="semibold" color={textColor}>
                                {award.title}
                              </Text>
                              <Text fontSize="sm" color={mutedTextColor}>
                                {award.organization}
                              </Text>
                              {award.description && (
                                <Text fontSize="sm" color={mutedTextColor}>
                                  {award.description}
                                </Text>
                              )}
                            </VStack>
                            <Badge colorScheme="blue" fontSize="xs">
                              {new Date(award.award_date).getFullYear()}
                            </Badge>
                          </HStack>
                          <Divider mt={3} borderColor={borderColor} />
                        </Box>
                      ))}
                      {awards.length > 5 && (
                        <Text fontSize="sm" color={mutedTextColor} textAlign="center">
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
                <Card h="fit-content" bg={cardBgColor} borderColor={borderColor}>
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md" color={textColor}>
                        <HStack spacing={2}>
                          <Icon as={Camera} color={primaryColor} />
                          <Text>Photo Gallery</Text>
                        </HStack>
                      </Heading>
                      {photos.length > 6 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowAllPhotos(!showAllPhotos)}
                          color={textColor}
                        >
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

          {/* Schedule Section with Tabs */}
          {schedule.length > 0 && (
            <Card bg={cardBgColor} borderColor={borderColor}>
              <CardBody>
                <Heading size="md" mb={4} color={textColor}>
                  <HStack spacing={2}>
                    <Icon as={Calendar} color={primaryColor} />
                    <Text>Schedule</Text>
                  </HStack>
                </Heading>
                <Tabs variant="enclosed" colorScheme="green">
                  <TabList>
                    <Tab color={textColor}>Upcoming ({upcomingEvents.length})</Tab>
                    <Tab color={textColor}>Past ({pastEvents.length})</Tab>
                    <Tab color={textColor}>All Events ({schedule.length})</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0}>
                      {upcomingEvents.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                          {upcomingEvents.map((event) => renderScheduleEvent(event, false))}
                        </VStack>
                      ) : (
                        <Text color={mutedTextColor} textAlign="center" py={4}>
                          No upcoming events scheduled
                        </Text>
                      )}
                    </TabPanel>
                    <TabPanel px={0}>
                      {pastEvents.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                          {pastEvents.reverse().map((event) => renderScheduleEvent(event, true))}
                        </VStack>
                      ) : (
                        <Text color={mutedTextColor} textAlign="center" py={4}>
                          No past events
                        </Text>
                      )}
                    </TabPanel>
                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        {schedule.map((event) => {
                          const isPast = new Date(event.event_date) < now
                          return renderScheduleEvent(event, isPast)
                        })}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          )}

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <Card bg={cardBgColor} borderColor={borderColor}>
              <CardBody>
                <Heading size="md" mb={4} color={textColor}>
                  <HStack spacing={2}>
                    <Icon as={Star} color={primaryColor} />
                    <Text>Coach Reviews</Text>
                  </HStack>
                </Heading>
                <VStack spacing={4} align="stretch">
                  {reviews.slice(0, 3).map((review) => (
                    <Box key={review.id} p={4} bg={isDarkTheme ? "gray.700" : "gray.50"} borderRadius="md">
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="semibold" color={textColor}>
                              {review.reviewer_name}
                            </Text>
                            {review.reviewer_title && review.reviewer_organization && (
                              <Text fontSize="sm" color={mutedTextColor}>
                                {review.reviewer_title} at {review.reviewer_organization}
                              </Text>
                            )}
                          </VStack>
                          <HStack spacing={1}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill={i < review.rating ? "currentColor" : "none"}
                                color={i < review.rating ? "#F6E05E" : "#E2E8F0"}
                                style={{ color: i < review.rating ? "#F6E05E" : "#E2E8F0" }}
                              />
                            ))}
                          </HStack>
                        </HStack>
                        <Text fontSize="sm" color={textColor}>
                          {review.review_text}
                        </Text>
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

          {/* Bio Section - Moved to Bottom */}
          {athlete.bio && (
            <Card bg={cardBgColor} borderColor={borderColor}>
              <CardBody>
                <Heading size="md" mb={4} color={textColor}>
                  About {athlete.athlete_name}
                </Heading>
                <Text lineHeight="tall" color={textColor}>
                  {athlete.bio}
                </Text>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>

      {/* Contact Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBgColor}>
          <ModalHeader color={textColor}>Contact {athlete.athlete_name}</ModalHeader>
          <ModalCloseButton color={textColor} />
          <form onSubmit={handleContactSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Your Name</FormLabel>
                  <Input
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter your full name"
                    bg={isDarkTheme ? "gray.700" : "white"}
                    color={textColor}
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Email Address</FormLabel>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Enter your email address"
                    bg={isDarkTheme ? "gray.700" : "white"}
                    color={textColor}
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>Organization</FormLabel>
                  <Input
                    value={contactForm.organization}
                    onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                    placeholder="School, team, or organization (optional)"
                    bg={isDarkTheme ? "gray.700" : "white"}
                    color={textColor}
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Message</FormLabel>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Enter your message..."
                    rows={4}
                    bg={isDarkTheme ? "gray.700" : "white"}
                    color={textColor}
                    borderColor={borderColor}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose} color={textColor}>
                Cancel
              </Button>
              <Button
                type="submit"
                bg={primaryColor}
                color="white"
                _hover={{ opacity: 0.8 }}
                isLoading={submittingContact}
                loadingText="Sending..."
              >
                Send Message
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  )
}
