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
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
} from "@chakra-ui/react"
import { User, Video, Award, ImageIcon, Calendar, MessageSquare, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function DashboardOverview() {
  const [athlete, setAthlete] = useState<any>(null)
  const [stats, setStats] = useState({
    videos: 0,
    awards: 0,
    photos: 0,
    schedule: 0,
    reviews: 0,
  })
  const [loading, setLoading] = useState(true)

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
      <VStack spacing={6} textAlign="center" py={12}>
        <Heading size="lg">Welcome to Recruit My Game!</Heading>
        <Text color="gray.600">Let's create your athlete profile to get started.</Text>
        <Link href="/dashboard/profile">
          <Button colorScheme="blue" size="lg">
            Create Profile
          </Button>
        </Link>
      </VStack>
    )
  }

  const statCards = [
    { title: "Videos", count: stats.videos, icon: Video, href: "/dashboard/videos", color: "blue" },
    { title: "Awards", count: stats.awards, icon: Award, href: "/dashboard/awards", color: "yellow" },
    { title: "Photos", count: stats.photos, icon: ImageIcon, href: "/dashboard/photos", color: "green" },
    { title: "Schedule", count: stats.schedule, icon: Calendar, href: "/dashboard/schedule", color: "purple" },
    { title: "Reviews", count: stats.reviews, icon: MessageSquare, href: "/dashboard/reviews", color: "teal" },
  ]

  return (
    <VStack spacing={8} align="stretch">
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg">Welcome back, {athlete.athlete_name}!</Heading>
          <Text color="gray.600">
            {athlete.sport} • {athlete.school}
          </Text>
        </Box>
        <HStack>
          <Link href={`/${athlete.username}`} target="_blank">
            <Button variant="outline" leftIcon={<ExternalLink size={16} />}>
              View Profile
            </Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button colorScheme="blue">Edit Profile</Button>
          </Link>
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
        {statCards.map((card) => (
          <GridItem key={card.title}>
            <Card>
              <CardBody>
                <Flex justify="space-between" align="center">
                  <Stat>
                    <StatLabel>{card.title}</StatLabel>
                    <StatNumber>{card.count}</StatNumber>
                  </Stat>
                  <Box color={`${card.color}.500`}>
                    <card.icon size={24} />
                  </Box>
                </Flex>
                <Link href={card.href}>
                  <Button variant="link" size="sm" mt={2}>
                    Manage {card.title.toLowerCase()}
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <Card>
        <CardHeader>
          <Heading size="md">Quick Actions</Heading>
          <Text color="gray.600">Common tasks to improve your profile</Text>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
            <Link href="/dashboard/videos">
              <Button variant="outline" width="full" leftIcon={<Video size={16} />}>
                Add Game Film
              </Button>
            </Link>
            <Link href="/dashboard/photos">
              <Button variant="outline" width="full" leftIcon={<ImageIcon size={16} />}>
                Upload Photos
              </Button>
            </Link>
            <Link href="/dashboard/schedule">
              <Button variant="outline" width="full" leftIcon={<Calendar size={16} />}>
                Update Schedule
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" width="full" leftIcon={<User size={16} />}>
                Customize Design
              </Button>
            </Link>
          </Grid>
        </CardBody>
      </Card>
    </VStack>
  )
}
