"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
  Stack,
  useBreakpointValue,
  Progress,
  Badge,
  HStack,
  Avatar,
} from "@chakra-ui/react"
import { User, Video, Award, ImageIcon, Calendar, MessageSquare, ExternalLink, TrendingUp, Eye } from "lucide-react"
import Link from "next/link"

export default function DashboardOverview() {
  const [athlete, setAthlete] = useState<any>(null)
  const [stats, setStats] = useState({
    videos: 0,
    awards: 0,
    photos: 0,
    schedule: 0,
    reviews: 0,
    profileViews: 0,
  })
  const [loading, setLoading] = useState(true)
  const [subscriptionTier, setSubscriptionTier] = useState<"free" | "premium" | "pro">("free")

  // Responsive icon size
  const iconSize = useBreakpointValue({ base: 16, md: 24 }) || 20

  // Subscription limits
  const tierLimits = {
    free: { videos: 3, photos: 10, customization: false },
    premium: { videos: 10, photos: 50, customization: true },
    pro: { videos: 25, photos: 100, customization: true },
  }

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      // Fetch athlete profile
      const { data: athleteData } = await supabase.from("athletes").select("*").eq("user_id", session.user.id).single()

      if (athleteData) {
        setAthlete(athleteData)
        setSubscriptionTier(athleteData.subscription_tier || "free")

        // Fetch stats
        const [videos, awards, photos, schedule, reviews] = await Promise.all([
          supabase.from("athlete_videos").select("id").eq("athlete_id", athleteData.id),
          supabase.from("athlete_awards").select("id").eq("athlete_id", athleteData.id),
          supabase.from("athlete_photos").select("id").eq("athlete_id", athleteData.id),
          supabase.from("athlete_schedule").select("id").eq("athlete_id", athleteData.id),
          supabase.from("athlete_reviews").select("id").eq("athlete_id", athleteData.id),
        ])

        setStats({
          videos: videos.data?.length || 0,
          awards: awards.data?.length || 0,
          photos: photos.data?.length || 0,
          schedule: schedule.data?.length || 0,
          reviews: reviews.data?.length || 0,
          profileViews: Math.floor(Math.random() * 150) + 25, // Mock data for now
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    )
  }

  if (!athlete) {
    return (
      <VStack spacing={6} textAlign="center" py={12} px={{ base: 4, md: 0 }}>
        <Heading size={{ base: "md", md: "lg" }}>Welcome to Recruit My Game!</Heading>
        <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
          Let's create your athlete profile to get started.
        </Text>
        <Link href="/dashboard/profile">
          <Button colorScheme="blue" size={{ base: "md", md: "lg" }}>
            Create Profile
          </Button>
        </Link>
      </VStack>
    )
  }

  const currentLimits = tierLimits[subscriptionTier]

  const statCards = [
    {
      title: "Profile Views",
      count: stats.profileViews,
      icon: Eye,
      href: "#",
      color: "purple",
      subtitle: "This month",
    },
    {
      title: "Videos",
      count: stats.videos,
      icon: Video,
      href: "/dashboard/videos",
      color: "blue",
      subtitle: `${stats.videos}/${currentLimits.videos} used`,
    },
    {
      title: "Photos",
      count: stats.photos,
      icon: ImageIcon,
      href: "/dashboard/photos",
      color: "green",
      subtitle: `${stats.photos}/${currentLimits.photos} used`,
    },
    {
      title: "Awards",
      count: stats.awards,
      icon: Award,
      href: "/dashboard/awards",
      color: "yellow",
      subtitle: "Achievements",
    },
    {
      title: "Reviews",
      count: stats.reviews,
      icon: MessageSquare,
      href: "/dashboard/reviews",
      color: "teal",
      subtitle: "Coach feedback",
    },
  ]

  const getSubscriptionBadgeColor = () => {
    switch (subscriptionTier) {
      case "premium":
        return "blue"
      case "pro":
        return "purple"
      default:
        return "gray"
    }
  }

  return (
    <VStack spacing={{ base: 6, md: 8 }} align="stretch">
      {/* Header Section with Profile Summary */}
      <Card>
        <CardBody>
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={{ base: 4, md: 0 }}
          >
            <HStack spacing={4}>
              <Avatar src={athlete.profile_picture_url} size={{ base: "lg", md: "xl" }} name={athlete.athlete_name} />
              <Box>
                <HStack spacing={2} mb={1}>
                  <Heading size={{ base: "md", md: "lg" }}>{athlete.athlete_name}</Heading>
                  <Badge colorScheme={getSubscriptionBadgeColor()} variant="subtle">
                    {subscriptionTier.toUpperCase()}
                  </Badge>
                </HStack>
                <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                  {athlete.sport} • {athlete.school}
                </Text>
                <Text color="gray.500" fontSize="sm">
                  Profile: {athlete.username}
                </Text>
              </Box>
            </HStack>
            <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
              <Link href={`/${athlete.username}`} target="_blank">
                <Button
                  variant="outline"
                  leftIcon={<ExternalLink size={16} />}
                  size={{ base: "sm", md: "md" }}
                  w={{ base: "full", sm: "auto" }}
                >
                  View Public Profile
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button colorScheme="blue" size={{ base: "sm", md: "md" }} w={{ base: "full", sm: "auto" }}>
                  Edit Profile
                </Button>
              </Link>
            </Stack>
          </Flex>
        </CardBody>
      </Card>

      {/* Usage & Limits */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <Card>
          <CardHeader pb={2}>
            <Heading size="sm">Video Usage</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <VStack align="stretch" spacing={3}>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm">Videos uploaded</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {stats.videos} / {currentLimits.videos}
                </Text>
              </Flex>
              <Progress
                value={(stats.videos / currentLimits.videos) * 100}
                colorScheme={stats.videos >= currentLimits.videos ? "red" : "blue"}
                size="sm"
              />
              {stats.videos >= currentLimits.videos && (
                <Text fontSize="xs" color="red.500">
                  Limit reached. Upgrade to add more videos.
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader pb={2}>
            <Heading size="sm">Photo Usage</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <VStack align="stretch" spacing={3}>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm">Photos uploaded</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {stats.photos} / {currentLimits.photos}
                </Text>
              </Flex>
              <Progress
                value={(stats.photos / currentLimits.photos) * 100}
                colorScheme={stats.photos >= currentLimits.photos ? "red" : "green"}
                size="sm"
              />
              {stats.photos >= currentLimits.photos && (
                <Text fontSize="xs" color="red.500">
                  Limit reached. Upgrade to add more photos.
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Stats Grid */}
      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)",
        }}
        gap={{ base: 3, md: 6 }}
      >
        {statCards.map((card) => (
          <GridItem key={card.title}>
            <Card size={{ base: "sm", md: "md" }}>
              <CardBody p={{ base: 3, md: 4 }}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Stat>
                    <StatLabel fontSize={{ base: "xs", md: "sm" }}>{card.title}</StatLabel>
                    <StatNumber fontSize={{ base: "lg", md: "2xl" }}>{card.count}</StatNumber>
                  </Stat>
                  <Box color={`${card.color}.500`}>
                    <card.icon size={iconSize} />
                  </Box>
                </Flex>
                <Text fontSize="xs" color="gray.500" mb={2}>
                  {card.subtitle}
                </Text>
                {card.href !== "#" && (
                  <Link href={card.href}>
                    <Button variant="link" size="xs" fontSize={{ base: "xs", md: "sm" }} p={0}>
                      Manage
                    </Button>
                  </Link>
                )}
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      {/* Subscription Upgrade CTA */}
      {subscriptionTier === "free" && (
        <Card bg="blue.50" borderColor="blue.200">
          <CardBody>
            <Flex
              justify="space-between"
              align={{ base: "start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={4}
            >
              <Box>
                <Heading size="sm" mb={1} color="blue.700">
                  Unlock Your Full Potential
                </Heading>
                <Text fontSize="sm" color="blue.600">
                  Upgrade to Premium for more videos, photos, and advanced customization options.
                </Text>
              </Box>
              <Button colorScheme="blue" size="sm" leftIcon={<TrendingUp size={16} />}>
                Upgrade Now
              </Button>
            </Flex>
          </CardBody>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader pb={{ base: 2, md: 4 }}>
          <Heading size={{ base: "sm", md: "md" }} mb={1}>
            Quick Actions
          </Heading>
          <Text color="gray.600" fontSize={{ base: "xs", md: "sm" }}>
            Common tasks to improve your profile
          </Text>
        </CardHeader>
        <CardBody pt={0}>
          <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={{ base: 3, md: 4 }}>
            <Link href="/dashboard/videos">
              <Button
                variant="outline"
                width="full"
                leftIcon={<Video size={16} />}
                size={{ base: "sm", md: "md" }}
                justifyContent="flex-start"
                isDisabled={stats.videos >= currentLimits.videos}
              >
                Add Game Film
              </Button>
            </Link>
            <Link href="/dashboard/photos">
              <Button
                variant="outline"
                width="full"
                leftIcon={<ImageIcon size={16} />}
                size={{ base: "sm", md: "md" }}
                justifyContent="flex-start"
                isDisabled={stats.photos >= currentLimits.photos}
              >
                Upload Photos
              </Button>
            </Link>
            <Link href="/dashboard/schedule">
              <Button
                variant="outline"
                width="full"
                leftIcon={<Calendar size={16} />}
                size={{ base: "sm", md: "md" }}
                justifyContent="flex-start"
              >
                Update Schedule
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button
                variant="outline"
                width="full"
                leftIcon={<User size={16} />}
                size={{ base: "sm", md: "md" }}
                justifyContent="flex-start"
              >
                Customize Design
              </Button>
            </Link>
          </Grid>
        </CardBody>
      </Card>
    </VStack>
  )
}
