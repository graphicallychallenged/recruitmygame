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
import { SocialMediaSection } from "@/components/profile/SocialMediaSection"
import { TeamsSection } from "@/components/profile/TeamsSection"
import type {
  AthleteProfile,
  AthletePhoto,
  AthleteVideo,
  AthleteAward,
  AthleteSchedule,
  AthleteReview,
  AthleteTeam,
} from "@/types/database"
import { ReviewsSection } from "@/components/profile/ReviewsSection"
import { ScheduleSection } from "@/components/profile/ScheduleSection"
import { getSubscriptionLimits, type SubscriptionTier } from "@/utils/tierFeatures"

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

// Female versions of sport images
const SPORT_HERO_IMAGES_FEMALE: Record<string, string> = {
  Football: "/hero/football-g.jpg",
  Basketball: "/hero/basketball-g.jpg",
  Baseball: "/hero/baseball-g.jpg",
  Soccer: "/hero/soccer-g.jpg",
  "Track & Field": "/hero/track-field-g.jpg",
  Swimming: "/hero/swimming-g.jpg",
  Tennis: "/hero/tennis-g.jpg",
  Golf: "/hero/golf-g.jpg",
  Volleyball: "/hero/volleyball-g.jpg",
  Wrestling: "/hero/wrestling-g.jpg",
  Softball: "/hero/softball-g.jpg",
  "Cross Country": "/hero/cross-country-g.jpg",
  Lacrosse: "/hero/lacrosse-g.jpg",
  Hockey: "/hero/hockey-g.jpg",
  Other: "/hero/generic-g.jpg",
}

export default function PublicProfileClient({ athlete: initialAthlete }: PublicProfileClientProps) {
  const [athlete, setAthlete] = useState<AthleteProfile>(initialAthlete)
  const [photos, setPhotos] = useState<AthletePhoto[]>([])
  const [videos, setVideos] = useState<AthleteVideo[]>([])
  const [awards, setAwards] = useState<AthleteAward[]>([])
  const [schedule, setSchedule] = useState<AthleteSchedule[]>([])
  const [reviews, setReviews] = useState<AthleteReview[]>([])
  const [teams, setTeams] = useState<AthleteTeam[]>([])
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
        console.log("Sport positions data:", athleteData.sport_positions)

        // Transform athlete data
        const transformedAthlete: AthleteProfile = {
          id: athleteData.id,
          user_id: athleteData.user_id,
          athlete_name: athleteData.athlete_name,
          username: athleteData.username,
          sport: athleteData.sport,
          sports: athleteData.sports,
          sport_positions: athleteData.sport_positions,
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
          dominant_foot: athleteData.dominant_foot,
          dominant_hand: athleteData.dominant_hand,
          profile_picture_url: athleteData.profile_picture_url,
          primary_color: athleteData.primary_color,
          secondary_color: athleteData.secondary_color,
          subscription_tier: athleteData.subscription_tier,
          subscription_status: athleteData.subscription_status,
          stripe_customer_id: athleteData.stripe_customer_id,
          stripe_subscription_id: athleteData.stripe_subscription_id,
          is_profile_public: athleteData.is_profile_public,
          content_order: athleteData.content_order,
          email: athleteData.email,
          phone: athleteData.phone,
          show_email: athleteData.show_email,
          show_phone: athleteData.show_phone,
          theme_mode: athleteData.theme_mode || "light",
          created_at: athleteData.created_at,
          updated_at: athleteData.updated_at,
          hero_image_url: athleteData.hero_image_url,
          default_hero_gender: athleteData.default_hero_gender,
          instagram: athleteData.instagram,
          twitter: athleteData.twitter,
          tiktok: athleteData.tiktok,
          facebook: athleteData.facebook,
          youtube: athleteData.youtube,
          linkedin: athleteData.linkedin,
          website: athleteData.website,
          maxpreps_url: athleteData.maxpreps_url,
          ncsa_url: athleteData.ncsa_url,
          other_recruiting_profiles: athleteData.other_recruiting_profiles,
          profile_visibility: athleteData.profile_visibility,
        }

        setAthlete(transformedAthlete)

        // Get tier features for subscription enforcement - ensure proper typing
        const subscriptionTier = (athleteData.subscription_tier || "free") as SubscriptionTier
        const tierFeatures = getSubscriptionLimits(subscriptionTier)

        // Fetch schedule data with tier enforcement
        console.log("Fetching schedule for athlete_id:", athleteData.id)
        let scheduleData: any[] = []
        if (tierFeatures.schedule) {
          const { data: scheduleResult, error: scheduleError } = await supabase
            .from("athlete_schedule")
            .select("*")
            .eq("athlete_id", athleteData.id)
            .eq("is_public", true)
            .order("event_date", { ascending: true })

          console.log("Schedule query result:", { data: scheduleResult, error: scheduleError })
          scheduleData = scheduleResult || []
        }

        // Fetch all other related data in parallel with tier enforcement
        const [photosResult, videosResult, awardsResult, reviewsResult, teamsResult] = await Promise.all([
          // Photos - enforce tier limits
          supabase
            .from("athlete_photos")
            .select("*")
            .eq("athlete_id", athleteData.id)
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .limit(tierFeatures.photos > 0 ? tierFeatures.photos : 1000),

          // Videos - only if tier allows
          tierFeatures.videos > 0
            ? supabase
                .from("athlete_videos")
                .select("*")
                .eq("athlete_id", athleteData.id)
                .eq("is_public", true)
                .order("created_at", { ascending: false })
                .limit(tierFeatures.videos > 0 && tierFeatures.videos !== 999 ? tierFeatures.videos : 1000)
            : Promise.resolve({ data: [] }),

          // Awards - only if tier allows
          tierFeatures.awards
            ? supabase
                .from("athlete_awards")
                .select("*")
                .eq("athlete_id", athleteData.id)
                .eq("is_public", true)
                .order("award_date", { ascending: false })
            : Promise.resolve({ data: [] }),

          // Reviews - only if tier allows, now including verification status
          tierFeatures.reviews
            ? supabase
                .from("athlete_reviews")
                .select("*, is_verified, verified_at")
                .eq("athlete_id", athleteData.id)
                .order("is_verified", { ascending: false })
                .order("created_at", { ascending: false })
            : Promise.resolve({ data: [] }),

          // Teams - available for all tiers
          supabase
            .from("athlete_teams")
            .select("*")
            .eq("athlete_id", athleteData.id)
            .eq("is_public", true)
            .order("is_current", { ascending: false })
            .order("created_at", { ascending: false }),
        ])

        // Process schedule data - use event_name and map to AthleteSchedule type
        const processedSchedule: AthleteSchedule[] =
          scheduleData?.map((event) => ({
            id: event.id,
            athlete_id: event.athlete_id,
            event_name: event.event_name,
            event_date: event.event_date,
            event_time: event.event_time,
            location: event.location,
            event_type: event.event_type,
            description: event.description,
            is_public: event.is_public ?? true,
            created_at: event.created_at,
            updated_at: event.updated_at,
          })) || []

        console.log("Processed schedule data:", processedSchedule)
        setSchedule(processedSchedule)

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
            // Include verification fields
            is_verified: review.is_verified,
            verified_at: review.verified_at,
          })) || [],
        )
        setTeams(
          teamsResult.data?.map((team) => ({
            id: team.id,
            athlete_id: team.athlete_id,
            team_name: team.team_name,
            position: team.position,
            jersey_number: team.jersey_number,
            season: team.season,
            league: team.league,
            stats: team.stats,
            is_current: team.is_current,
            is_public: team.is_public,
            created_at: team.created_at,
            updated_at: team.updated_at,
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
    // If user has a custom hero image (Pro feature), use that first
    if (athlete.hero_image_url) {
      return athlete.hero_image_url
    }

    // Otherwise, use sport-based default images with gender consideration
    const isFemale = athlete.default_hero_gender === "female"
    const sportImages = isFemale ? SPORT_HERO_IMAGES_FEMALE : SPORT_HERO_IMAGES

    return sportImages[athlete.sport] || sportImages["Other"]
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

  // Check privacy settings - add this right after the loading check
  if (athlete.profile_visibility === ("private" as any)) {
    return (
      <Flex justify="center" align="center" h="100vh" bg={bgColor} direction="column">
        <Heading size="lg" color={textColor} mb={4}>
          Profile Not Available
        </Heading>
        <Text color={mutedTextColor}>This athlete's profile is set to private.</Text>
      </Flex>
    )
  }

  // Get tier features for conditional rendering - ensure proper typing
  const subscriptionTier = (athlete.subscription_tier || "free") as SubscriptionTier
  const tierFeatures = getSubscriptionLimits(subscriptionTier)

  console.log("Rendering with schedule:", schedule)

  const hasSocialMedia =
    athlete.instagram ||
    athlete.twitter ||
    athlete.tiktok ||
    athlete.facebook ||
    athlete.youtube ||
    athlete.linkedin ||
    athlete.website ||
    athlete.maxpreps_url ||
    athlete.ncsa_url ||
    athlete.other_recruiting_profiles

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <HeroSection
        athlete={athlete}
        heroImage={getHeroImage()}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        onContactClick={onOpen}
        showLocation={athlete.show_location !== false}
      />

      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Videos Section - only show if tier allows */}
          {tierFeatures.videos > 0 && videos.length > 0 && (
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

          {/* Awards and Photos Side by Side - but full width photos for free accounts */}
          {tierFeatures.awards && awards.length > 0 ? (
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
          ) : (
            // Full width photos for free accounts (no awards section)
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
          )}
          {/* Teams Section */}
          {teams.length > 0 && (
            <Card bg={cardBgColor} borderColor={borderColor}>
              <CardBody>
                <TeamsSection
                  teams={teams}
                  primaryColor={primaryColor}
                  textColor={textColor}
                  mutedTextColor={mutedTextColor}
                  cardBgColor={cardBgColor}
                  borderColor={borderColor}
                  isDarkTheme={isDarkTheme}
                />
              </CardBody>
            </Card>
          )}
          {/* Schedule Section - only show if tier allows */}
          {tierFeatures.schedule && schedule.length > 0 && (
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
          )}

          {/* Reviews Section - only show if tier allows AND privacy allows */}
          {tierFeatures.reviews && reviews.length > 0 && athlete.allow_coach_reviews !== false && (
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
                <Heading size="lg" mb={4} color={textColor}>
                  About {athlete.athlete_name}
                </Heading>
                <Text lineHeight="tall" color={textColor}>
                  {athlete.bio}
                </Text>
              </CardBody>
            </Card>
          )}

          {/* Social Media Section */}
          {hasSocialMedia && (
            <SocialMediaSection
              athlete={athlete}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              textColor={textColor}
              mutedTextColor={mutedTextColor}
              cardBgColor={cardBgColor}
              borderColor={borderColor}
              isDarkTheme={isDarkTheme}
            />
          )}
        </VStack>
      </Container>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isOpen}
        onClose={onClose}
        athleteName={athlete.athlete_name}
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
