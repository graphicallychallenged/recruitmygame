"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Spinner,
  Center,
  SimpleGrid,
  Avatar,
  Progress,
} from "@chakra-ui/react"
import { Trophy, Calendar, ImageIcon, Video, Star, User, TrendingUp, Lock, Zap, Eye, Users } from "lucide-react"
import Link from "next/link"
import { ReviewsSummary } from "@/components/ReviewsSummary"
import { getSubscriptionLimits, type SubscriptionTier } from "@/utils/subscription"
import { hasFeature, getTierColor, getTierDisplayName } from "@/utils/tierFeatures"

interface DashboardStats {
  totalAwards: number
  totalPhotos: number
  totalVideos: number
  totalEvents: number
  totalReviews: number
  totalTeams: number
  averageRating: number
  upcomingEvents: number
}

interface Review {
  id: string
  reviewer_name: string
  reviewer_title: string
  reviewer_organization: string
  review_text: string
  review_type: string
  rating: number
  created_at: string
  is_verified: boolean
}

interface AthleteProfile {
  id: string
  user_id: string
  username: string
  athlete_name: string
  first_name: string
  sport: string
  school: string
  profile_picture_url: string
  subscription_tier: SubscriptionTier
}

export default function DashboardPage() {
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalAwards: 0,
    totalPhotos: 0,
    totalVideos: 0,
    totalEvents: 0,
    totalReviews: 0,
    totalTeams: 0,
    averageRating: 0,
    upcomingEvents: 0,
  })
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [verifiedReviews, setVerifiedReviews] = useState<Review[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      // Fetch athlete profile
      const { data: athleteData } = await supabase.from("athletes").select("*").eq("user_id", session.user.id).single()

      if (athleteData) {
        setAthlete(athleteData)

        // Fetch all stats in parallel using correct table names
        const [
          awardsResult,
          photosResult,
          videosResult,
          scheduleResult,
          reviewsResult,
          teamsResult,
          upcomingEventsResult,
        ] = await Promise.all([
          // Only fetch awards if user has premium or pro
          hasFeature(athleteData.subscription_tier, "awards")
            ? supabase.from("athlete_awards").select("id").eq("athlete_id", athleteData.id)
            : Promise.resolve({ data: [] }),
          supabase.from("athlete_photos").select("id").eq("athlete_id", athleteData.id),
          // Only fetch videos if user has premium or pro
          athleteData.subscription_tier !== "free"
            ? supabase.from("athlete_videos").select("id").eq("athlete_id", athleteData.id)
            : Promise.resolve({ data: [] }),
          // Only fetch schedule if user has pro
          hasFeature(athleteData.subscription_tier, "schedule")
            ? supabase.from("athlete_schedule").select("id").eq("athlete_id", athleteData.id)
            : Promise.resolve({ data: [] }),
          // Only fetch reviews if user has premium or pro
          hasFeature(athleteData.subscription_tier, "reviews")
            ? supabase
                .from("athlete_reviews")
                .select("*, is_verified")
                .eq("athlete_id", athleteData.id)
                .order("created_at", { ascending: false })
            : Promise.resolve({ data: [] }),
          // Fetch teams (available for all tiers)
          supabase
            .from("athlete_teams")
            .select("id")
            .eq("athlete_id", athleteData.id),
          // Only fetch upcoming events if user has pro
          hasFeature(athleteData.subscription_tier, "schedule")
            ? supabase
                .from("athlete_schedule")
                .select("id")
                .eq("athlete_id", athleteData.id)
                .gte("event_date", new Date().toISOString().split("T")[0])
                .lte("event_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
            : Promise.resolve({ data: [] }),
        ])

        // Calculate average rating from verified reviews only
        const reviewData = reviewsResult.data || []
        const verifiedReviews = reviewData.filter((review) => review.is_verified)
        setVerifiedReviews(verifiedReviews)
        const averageRating =
          verifiedReviews.length > 0
            ? verifiedReviews.reduce((sum, review) => sum + review.rating, 0) / verifiedReviews.length
            : 0

        setStats({
          totalAwards: awardsResult.data?.length || 0,
          totalPhotos: photosResult.data?.length || 0,
          totalVideos: videosResult.data?.length || 0,
          totalEvents: scheduleResult.data?.length || 0,
          totalReviews: reviewData.length,
          totalTeams: teamsResult.data?.length || 0,
          averageRating: Math.round(averageRating * 10) / 10,
          upcomingEvents: upcomingEventsResult.data?.length || 0,
        })

        setReviews(reviewData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
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
      <Container maxW="4xl">
        <VStack spacing={8} textAlign="center" py={12}>
          <Box>
            <Heading size="xl" mb={4}>
              Welcome to RecruitMyGame
            </Heading>
            <Text fontSize="lg" color="gray.600" mb={6}>
              Create your athlete profile to start showcasing your achievements and connecting with coaches.
            </Text>
            <Link href="/dashboard/profile">
              <Button colorScheme="blue" size="lg" leftIcon={<User size={20} />}>
                Create Your Profile
              </Button>
            </Link>
          </Box>
        </VStack>
      </Container>
    )
  }

  const limits = getSubscriptionLimits(athlete.subscription_tier)
  const totalContent = stats.totalVideos + stats.totalPhotos + stats.totalAwards + stats.totalTeams

  const profileSections = [
    {
      title: "Photo Gallery",
      description: "Create a visual story of your athletic journey",
      icon: ImageIcon,
      usage: stats.totalPhotos,
      limit: limits.photos,
      color: "blue",
      features: ["High-quality images", "Gallery organization", "Mobile optimized"],
      href: "/dashboard/photos",
      available: true,
      requiredTier: "free" as SubscriptionTier,
    },
    {
      title: "Teams",
      description: "Showcase your team history and achievements",
      icon: Users,
      usage: stats.totalTeams,
      limit: 999, // No limit on teams
      color: "green",
      features: ["Team history", "Position tracking", "Statistics display"],
      href: "/dashboard/teams",
      available: true,
      requiredTier: "free" as SubscriptionTier,
    },
    {
      title: "Game Film Showcase",
      description: "Upload and organize your best game footage",
      icon: Video,
      usage: stats.totalVideos,
      limit: limits.videos,
      color: "orange",
      features: ["HD video streaming", "Custom thumbnails", "Easy sharing"],
      href: "/dashboard/videos",
      available: athlete.subscription_tier !== "free",
      requiredTier: "premium" as SubscriptionTier,
    },
    {
      title: "Awards & Achievements",
      description: "Showcase your athletic and academic accomplishments",
      icon: Trophy,
      usage: stats.totalAwards,
      limit: 999, // No limit on awards
      color: "yellow",
      features: ["Award certificates", "Achievement timeline", "Statistics tracking"],
      href: "/dashboard/awards",
      available: hasFeature(athlete.subscription_tier, "awards"),
      requiredTier: "premium" as SubscriptionTier,
    },
    {
      title: "Coach Reviews",
      description: "Collect testimonials from coaches and mentors",
      icon: Star,
      usage: stats.totalReviews,
      limit: 999, // No limit on reviews
      color: "purple",
      features: ["Review management", "Rating system", "Testimonial display"],
      href: "/dashboard/reviews",
      available: hasFeature(athlete.subscription_tier, "reviews"),
      requiredTier: "premium" as SubscriptionTier,
    },
    {
      title: "Schedule & Events",
      description: "Showcase upcoming games, volunteer work, or camps",
      icon: Calendar,
      usage: stats.totalEvents,
      limit: 999, // No limit on schedule events
      color: "red",
      features: ["Event management", "Calendar integration", "Upcoming reminders"],
      href: "/dashboard/schedule",
      available: hasFeature(athlete.subscription_tier, "schedule"),
      requiredTier: "pro" as SubscriptionTier,
    },
  ]

  const proFeatures = [
    {
      title: "Business Cards",
      description: "Generate professional business cards with QR codes",
      icon: User,
      available: hasFeature(athlete.subscription_tier, "business_cards"),
      requiredTier: "pro" as SubscriptionTier,
    },
    {
      title: "Verified Reviews",
      description: "Send secure review requests to coaches",
      icon: Star,
      available: hasFeature(athlete.subscription_tier, "reviews"),
      requiredTier: "premium" as SubscriptionTier,
    },
    {
      title: "Multiple Sports",
      description: "Add multiple sports to your profile",
      icon: Trophy,
      available: hasFeature(athlete.subscription_tier, "multiple_sports"),
      requiredTier: "pro" as SubscriptionTier,
    },
    {
      title: "Advanced Analytics",
      description: "Detailed insights and performance tracking",
      icon: TrendingUp,
      available: hasFeature(athlete.subscription_tier, "analytics"),
      requiredTier: "pro" as SubscriptionTier,
    },
  ]

  return (
    <Container maxW="6xl">
      <VStack spacing={8} align="stretch">
        {/* Welcome Header */}
        <Box>
          <HStack spacing={4} mb={4}>
            <Avatar src={athlete.profile_picture_url} name={athlete.athlete_name} size="lg" />
            <VStack align="start" spacing={1}>
              <HStack spacing={3}>
                <Heading size="xl">Welcome back, {athlete.first_name || athlete.athlete_name.split(" ")[0]}!</Heading>
                <Badge
                  colorScheme={getTierColor(athlete.subscription_tier)}
                  variant="subtle"
                  textTransform="uppercase"
                  fontSize="xs"
                >
                  {getTierDisplayName(athlete.subscription_tier)}
                </Badge>
              </HStack>
              <Text color="gray.600" fontSize="lg">
                Here's an overview of your athletic profile and recruitment progress.
              </Text>
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.500">
                  {athlete.sport} • {athlete.school}
                </Text>
                <Text fontSize="sm" color="blue.500">
                  Profile: {athlete.username}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <HStack spacing={4}>
            <Link href={`http://${athlete.username}.recruitmygame.com`} target="_blank">
              <Button leftIcon={<Eye size={16} />} variant="outline">
                View Public Profile
              </Button>
            </Link>
            {(athlete.subscription_tier === "free" || athlete.subscription_tier === "premium") && (
              <Link href="/subscription">
                <Button leftIcon={<Zap size={16} />} colorScheme="purple">
                  {athlete.subscription_tier === "free" ? "Upgrade to Premium" : "Upgrade to Pro"}
                </Button>
              </Link>
            )}
          </HStack>
        </Box>

        {/* Key Metrics */}
        <SimpleGrid columns={{ base: 2, md: 6 }} spacing={6}>
          <Card>
            <CardBody textAlign="center">
              <VStack spacing={2}>
                <Box color="blue.500">
                  <Eye size={32} />
                </Box>
                <Stat>
                  <StatNumber fontSize="2xl">-</StatNumber>
                  <StatLabel fontSize="sm">Profile Views</StatLabel>
                </Stat>
                <Text fontSize="xs" color="gray.500">
                  Coming soon
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <VStack spacing={2}>
                <Box color="green.500">
                  <Trophy size={32} />
                </Box>
                <Stat>
                  <StatNumber fontSize="2xl">{totalContent}</StatNumber>
                  <StatLabel fontSize="sm">Total Content</StatLabel>
                </Stat>
                <Text fontSize="xs" color="gray.500">
                  Videos, photos, awards & teams
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <VStack spacing={2}>
                <Box color="green.500">
                  <Users size={32} />
                </Box>
                <Stat>
                  <StatNumber fontSize="2xl">{stats.totalTeams}</StatNumber>
                  <StatLabel fontSize="sm">Teams</StatLabel>
                </Stat>
                <Text fontSize="xs" color="gray.500">
                  Current & past teams
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card opacity={hasFeature(athlete.subscription_tier, "reviews") ? 1 : 0.6}>
            <CardBody textAlign="center">
              <VStack spacing={2}>
                <Box color={hasFeature(athlete.subscription_tier, "reviews") ? "purple.500" : "gray.400"}>
                  {hasFeature(athlete.subscription_tier, "reviews") ? <Star size={32} /> : <Lock size={32} />}
                </Box>
                <Stat>
                  <StatNumber fontSize="2xl">
                    {hasFeature(athlete.subscription_tier, "reviews") ? stats.totalReviews : "-"}
                  </StatNumber>
                  <StatLabel fontSize="sm">Coach Reviews</StatLabel>
                </Stat>
                <Text fontSize="xs" color="gray.500">
                  {hasFeature(athlete.subscription_tier, "reviews")
                    ? stats.totalReviews > 0
                      ? `${verifiedReviews.length} verified of ${stats.totalReviews} total`
                      : "No reviews yet"
                    : "Premium feature"}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card opacity={hasFeature(athlete.subscription_tier, "schedule") ? 1 : 0.6}>
            <CardBody textAlign="center">
              <VStack spacing={2}>
                <Box color={hasFeature(athlete.subscription_tier, "schedule") ? "orange.500" : "gray.400"}>
                  {hasFeature(athlete.subscription_tier, "schedule") ? <Calendar size={32} /> : <Lock size={32} />}
                </Box>
                <Stat>
                  <StatNumber fontSize="2xl">
                    {hasFeature(athlete.subscription_tier, "schedule") ? stats.upcomingEvents : "-"}
                  </StatNumber>
                  <StatLabel fontSize="sm">Upcoming Events</StatLabel>
                </Stat>
                <Text fontSize="xs" color="gray.500">
                  {hasFeature(athlete.subscription_tier, "schedule") ? "Next 30 days" : "Pro feature"}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card opacity={hasFeature(athlete.subscription_tier, "schedule") ? 1 : 0.6}>
            <CardBody textAlign="center">
              <VStack spacing={2}>
                <Box color={hasFeature(athlete.subscription_tier, "schedule") ? "red.500" : "gray.400"}>
                  {hasFeature(athlete.subscription_tier, "schedule") ? <Calendar size={32} /> : <Lock size={32} />}
                </Box>
                <Stat>
                  <StatNumber fontSize="2xl">
                    {hasFeature(athlete.subscription_tier, "schedule") ? stats.totalEvents : "-"}
                  </StatNumber>
                  <StatLabel fontSize="sm">Total Events</StatLabel>
                </Stat>
                <Text fontSize="xs" color="gray.500">
                  {hasFeature(athlete.subscription_tier, "schedule") ? "All scheduled events" : "Pro feature"}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Profile Sections */}
        <Box>
          <Heading size="lg" mb={6}>
            Your Profile Sections
          </Heading>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
            {profileSections.map((section) => {
              const usagePercentage =
                section.limit > 0 && section.limit < 999 ? Math.round((section.usage / section.limit) * 100) : 0
              const isNearLimit = usagePercentage >= 80
              const hasLimit = section.limit < 999

              return (
                <Card
                  key={section.title}
                  variant="outline"
                  opacity={section.available ? 1 : 0.7}
                  borderColor={section.available ? "gray.200" : "gray.100"}
                >
                  <CardHeader pb={2}>
                    <HStack spacing={3}>
                      <Box color={section.available ? `${section.color}.500` : "gray.400"}>
                        {section.available ? <section.icon size={24} /> : <Lock size={24} />}
                      </Box>
                      <VStack align="start" spacing={0} flex={1}>
                        <HStack spacing={2}>
                          <Text fontWeight="bold" fontSize="lg">
                            {section.title}
                          </Text>
                          {!section.available && (
                            <Badge
                              colorScheme={getTierColor(section.requiredTier)}
                              variant="solid"
                              textTransform="uppercase"
                              fontSize="xs"
                            >
                              {getTierDisplayName(section.requiredTier)}
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {section.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      {section.available ? (
                        <>
                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" color="gray.600">
                                {hasLimit ? `Usage: ${section.usage} / ${section.limit}` : `Total: ${section.usage}`}
                              </Text>
                              {hasLimit && (
                                <Text fontSize="sm" fontWeight="bold" color={isNearLimit ? "red.500" : "gray.700"}>
                                  {usagePercentage}%
                                </Text>
                              )}
                            </HStack>
                            {hasLimit && (
                              <Progress
                                value={usagePercentage}
                                colorScheme={isNearLimit ? "red" : section.color}
                                size="sm"
                                borderRadius="full"
                              />
                            )}
                            {!hasLimit && (
                              <Box h="2px" bg="gray.100" borderRadius="full">
                                <Box h="full" bg={`${section.color}.500`} borderRadius="full" w="100%" />
                              </Box>
                            )}
                          </Box>

                          <VStack spacing={1} align="start">
                            {section.features.map((feature, index) => (
                              <HStack key={index} spacing={2}>
                                <Box color="green.500" fontSize="xs">
                                  ✓
                                </Box>
                                <Text fontSize="xs" color="gray.600">
                                  {feature}
                                </Text>
                              </HStack>
                            ))}
                          </VStack>

                          <Link href={section.href}>
                            <Button size="sm" colorScheme={section.color} variant="outline" w="full">
                              Manage {section.title}
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <VStack spacing={3}>
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            This feature requires {getTierDisplayName(section.requiredTier)} subscription
                          </Text>
                          <Link href="/subscription">
                            <Button size="sm" colorScheme="purple" variant="outline" w="full">
                              Upgrade to {getTierDisplayName(section.requiredTier)}
                            </Button>
                          </Link>
                        </VStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )
            })}
          </SimpleGrid>
        </Box>

        {/* Pro Features */}
        <Box>
          <Heading size="lg" mb={6}>
            Advanced Features
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {proFeatures.map((feature) => (
              <Card
                key={feature.title}
                variant="outline"
                opacity={feature.available ? 1 : 0.7}
                borderColor={feature.available ? "green.200" : "gray.200"}
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Box color={feature.available ? "green.500" : "gray.400"}>
                      {feature.available ? <feature.icon size={24} /> : <Lock size={24} />}
                    </Box>
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack spacing={2}>
                        <Text fontWeight="bold">{feature.title}</Text>
                        {!feature.available && (
                          <Badge
                            colorScheme={getTierColor(feature.requiredTier)}
                            variant="solid"
                            textTransform="uppercase"
                            fontSize="xs"
                          >
                            {getTierDisplayName(feature.requiredTier)}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {feature.description}
                      </Text>
                      {!feature.available && (
                        <Link href="/subscription">
                          <Button size="xs" colorScheme="purple" variant="outline" mt={2}>
                            Upgrade to {getTierDisplayName(feature.requiredTier)}
                          </Button>
                        </Link>
                      )}
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* Recent Reviews - Only show if user has reviews feature */}
        {hasFeature(athlete.subscription_tier, "reviews") && stats.totalReviews > 0 && (
          <ReviewsSummary reviews={reviews} maxDisplay={3} />
        )}
      </VStack>
    </Container>
  )
}
