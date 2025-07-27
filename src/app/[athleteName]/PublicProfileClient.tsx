"use client"

import type React from "react"
import { HStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import {
  Box,
  Container,
  VStack,
  Grid,
  GridItem,
  Heading,
  Text,
  Card,
  CardBody,
  Spinner,
  Flex,
  Icon,
  useDisclosure,
  useToast,
} from "@chakra-ui/react"
import { Play } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { VideoPlaylist } from "@/components/VideoPlaylist"
import { HeroSection } from "@/components/profile/HeroSection"
import { AthleteStats } from "@/components/profile/AthleteStats"
import { PhotoGallerySection } from "@/components/profile/PhotoGallerySection"
import { AwardsSection } from "@/components/profile/AwardsSection"
import { ContactModal } from "@/components/profile/ContactModal"
import type {
  AthleteProfile,
  AthletePhoto,
  AthleteVideo,
  AthleteAward,
  AthleteSchedule,
  AthleteReview,
} from "@/types/database"
import { ReviewsSection } from "@/components/profile/ReviewsSection"
import { ScheduleSection } from "@/components/profile/ScheduleSection"

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
        console.log("Fetching data for athlete:", initialAthlete.username)

        // Fetch fresh athlete data
        const { data: athleteData, error: athleteError } = await supabase
          .from("athletes")
          .select("*")
          .eq("username", initialAthlete.username)
          .eq("is_profile_public", true)
          .single()

        if (athleteError || !athleteData) {
          console.error("Athlete error:", athleteError)
          throw new Error("Athlete not found")
        }

        console.log("Found athlete:", athleteData)

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

        // Fetch schedule data with detailed logging
        console.log("Fetching schedule for athlete_id:", athleteData.id)
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("athlete_schedule")
          .select("*")
          .eq("athlete_id", athleteData.id)
          .order("event_date", { ascending: true })

        console.log("Schedule query result:", { data: scheduleData, error: scheduleError })

        // Fetch all other related data in parallel
        const [photosResult, videosResult, awardsResult, reviewsResult] = await Promise.all([
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
            .from("athlete_reviews")
            .select("*")
            .eq("athlete_id", athleteData.id)
            .order("created_at", { ascending: false }),
        ])

        // Transform data with all required fields
        setPhotos(
          photosResult.data?.map((photo) => ({
            id: photo.id,
            athlete_id: photo.athlete_id,
            photo_url: photo.photo_url,
            caption: photo.caption,
            is_public: photo.is_public,
            created_at: photo.created_at,
          })) || [],
        )

        setVideos(
          videosResult.data?.map((video) => ({
            id: video.id,
            athlete_id: video.athlete_id,
            title: video.title,
            description: video.description,
            video_url: video.video_url,
            video_type: video.video_type,
            thumbnail_url: video.thumbnail_url,
            is_public: video.is_public,
            created_at: video.created_at,
            updated_at: video.updated_at,
          })) || [],
        )

        setAwards(
          awardsResult.data?.map((award) => ({
            id: award.id,
            athlete_id: award.athlete_id,
            title: award.title,
            organization: award.organization,
            award_date: award.award_date,
            award_type: award.award_type,
            level: award.level,
            description: award.description,
            is_public: award.is_public,
            created_at: award.created_at,
          })) || [],
        )

        // Process schedule data - use event_name not event_title
        const processedSchedule =
          scheduleData?.map((event) => ({
            id: event.id,
            athlete_id: event.athlete_id,
            event_name: event.event_name, // This is the correct field name
            event_date: event.event_date,
            event_time: event.event_time,
            location: event.location,
            event_type: event.event_type,
            description: event.description,
            is_public: event.is_public ?? true, // Default to true if null
            created_at: event.created_at,
            updated_at: event.updated_at,
          })) || []

        console.log("Processed schedule data:", processedSchedule)

        // Filter for public events only
        const publicSchedule = processedSchedule.filter((event) => event.is_public)
        console.log("Public schedule events:", publicSchedule)

        setSchedule(publicSchedule)

        setReviews(
          reviewsResult.data?.map((review) => ({
            id: review.id,
            athlete_id: review.athlete_id,
            reviewer_name: review.reviewer_name,
            reviewer_title: review.reviewer_title,
            reviewer_organization: review.reviewer_organization,
            reviewer_email: review.reviewer_email,
            reviewer_phone: review.reviewer_phone,
            reviewer_image_url: review.reviewer_image_url,
            review_text: review.review_text,
            review_type: review.review_type,
            rating: review.rating,
            relationship_duration: review.relationship_duration,
            can_contact_reviewer: review.can_contact_reviewer,
            created_at: review.created_at,
            updated_at: review.updated_at,
          })) || [],
        )
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

  const handleFormChange = (field: string, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoClick = (index: number) => {
    // Photo modal functionality can be added here
    console.log("Photo clicked:", index)
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px" bg={bgColor}>
        <Spinner size="xl" color={primaryColor} />
      </Flex>
    )
  }

  console.log("Rendering with schedule:", schedule)

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <HeroSection
        athlete={athlete}
        heroImage={getHeroImage()}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        onContactClick={onOpen}
      />

      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Videos Section */}
          {videos.length > 0 && (
            <Box>
              <Heading size="lg" mb={4} color={textColor}>
                <HStack spacing={2}>
                  <Icon as={Play} color={primaryColor} />
                  <Text>Game Film & Highlights</Text>
                </HStack>
              </Heading>
              <VideoPlaylist
                videos={videos}
                isDarkTheme={isDarkTheme}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            </Box>
          )}

          {/* Athlete Stats */}
          <AthleteStats
            athlete={athlete}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            isDarkTheme={isDarkTheme}
            textColor={textColor}
            mutedTextColor={mutedTextColor}
            cardBgColor={cardBgColor}
          />

          {/* Awards and Photos Side by Side */}
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
            <GridItem>
              <AwardsSection
                awards={awards}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                textColor={textColor}
                mutedTextColor={mutedTextColor}
                cardBgColor={cardBgColor}
                borderColor={borderColor}
                isDarkTheme={isDarkTheme}
              />
            </GridItem>
            <GridItem>
              <PhotoGallerySection
                photos={photos}
                showAllPhotos={showAllPhotos}
                onToggleShowAll={() => setShowAllPhotos(!showAllPhotos)}
                onPhotoClick={handlePhotoClick}
                primaryColor={primaryColor}
                textColor={textColor}
                cardBgColor={cardBgColor}
                borderColor={borderColor}
              />
            </GridItem>
          </Grid>

          {/* Schedule Section - Always show, even if empty */}
          <Card bg={cardBgColor} borderColor={borderColor}>
            <CardBody>
              <ScheduleSection
                schedule={schedule}
                primaryColor={primaryColor}
                textColor={textColor}
                mutedTextColor={mutedTextColor}
                cardBgColor={cardBgColor}
                borderColor={borderColor}
              />
            </CardBody>
          </Card>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <Card bg={cardBgColor} borderColor={borderColor}>
              <CardBody>
                <ReviewsSection
                  reviews={reviews}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  textColor={textColor}
                  mutedTextColor={mutedTextColor}
                  cardBgColor={cardBgColor}
                  borderColor={borderColor}
                  isDarkTheme={isDarkTheme}
                />
              </CardBody>
            </Card>
          )}

          {/* Bio Section */}
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
      <ContactModal
        isOpen={isOpen}
        onClose={onClose}
        athleteName={athlete.athlete_name}
        formData={contactForm}
        onFormChange={handleFormChange}
        onSubmit={handleContactSubmit}
        isSubmitting={submittingContact}
        primaryColor={primaryColor}
        textColor={textColor}
        cardBgColor={cardBgColor}
        borderColor={borderColor}
        isDarkTheme={isDarkTheme}
      />
    </Box>
  )
}
