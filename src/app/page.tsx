"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client"
import { Box, Button, Container, Heading, Text, VStack, HStack, Card, CardBody, Grid, GridItem } from "@chakra-ui/react"
import { User, Video, Award, Calendar, MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // If user is already authenticated, redirect to dashboard
      if (session) {
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [router])

  const features = [
    {
      icon: User,
      title: "Professional Profiles",
      description: "Create stunning athlete profiles with your stats, achievements, and highlights",
    },
    {
      icon: Video,
      title: "Game Film Showcase",
      description: "Upload and organize your best game footage for coaches to review",
    },
    {
      icon: Award,
      title: "Awards & Recognition",
      description: "Display your achievements, honors, and academic accomplishments",
    },
    {
      icon: Calendar,
      title: "Schedule Management",
      description: "Keep coaches updated with your upcoming games and events",
    },
    {
      icon: MessageSquare,
      title: "Coach Reviews",
      description: "Showcase testimonials and recommendations from your coaches",
    },
  ]

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Hero Section */}
      <Box bg="blue.600" color="white" py={20}>
        <Container maxW="6xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="2xl" fontWeight="bold">
              Recruit My Game
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              The complete platform for student-athletes to create professional recruitment profiles, showcase their
              talents, and connect with college coaches.
            </Text>
            <HStack spacing={4}>
              <Link href="/login">
                <Button size="lg" colorScheme="white" variant="solid" rightIcon={<ArrowRight size={20} />}>
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  color="white"
                  borderColor="white"
                  _hover={{ bg: "white", color: "blue.600" }}
                >
                  Sign In
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="6xl" py={20}>
        <VStack spacing={12}>
          <Box textAlign="center">
            <Heading size="xl" mb={4}>
              Everything You Need for Recruitment Success
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Our platform provides all the tools student-athletes need to create professional profiles and get noticed
              by college coaches.
            </Text>
          </Box>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={8}>
            {features.map((feature, index) => (
              <GridItem key={index}>
                <Card h="full">
                  <CardBody>
                    <VStack spacing={4} align="start">
                      <Box p={3} bg="blue.100" borderRadius="lg" color="blue.600">
                        <feature.icon size={24} />
                      </Box>
                      <Heading size="md">{feature.title}</Heading>
                      <Text color="gray.600">{feature.description}</Text>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </Container>

      {/* CTA Section */}
      <Box bg="blue.600" color="white" py={16}>
        <Container maxW="4xl">
          <VStack spacing={6} textAlign="center">
            <Heading size="lg">Ready to Get Recruited?</Heading>
            <Text fontSize="lg">
              Join thousands of student-athletes who are already using Recruit My Game to showcase their talents and
              connect with college coaches.
            </Text>
            <Link href="/login">
              <Button size="lg" colorScheme="white" variant="solid" rightIcon={<ArrowRight size={20} />}>
                Create Your Profile Today
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.800" color="white" py={8}>
        <Container maxW="6xl">
          <VStack spacing={4} textAlign="center">
            <Heading size="md">Recruit My Game</Heading>
            <Text color="gray.400">© 2024 Recruit My Game. All rights reserved.</Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}
