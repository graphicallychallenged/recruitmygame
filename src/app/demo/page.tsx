"use client"

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Icon,
  Avatar,
  Flex,
  Alert,
  AlertIcon,
  Code,
} from "@chakra-ui/react"
import {
  ExternalLink,
  Trophy,
  Calendar,
  Video,
  Star,
  Users,
  Award,
  MapPin,
  Play,
  ArrowRight,
  Key,
  User,
} from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"

export default function DemoPage() {
  // Real demo accounts - update these based on actual database query results
  const demoProfiles = [
    {
      name: "Alex Johnson", // Update with actual data from query
      sport: "Basketball", // Update with actual data
      position: "Point Guard", // Update with actual data
      school: "Central High School", // Update with actual data
      location: "Sacramento, CA", // Update with actual data
      classOf: "2027", // Update with actual data
      image: "https://fuvapddevwtiftgysikn.supabase.co/storage/v1/object/public/profile-pictures/c60a57b2-ca32-4b53-805a-45a6ff649062/profile_1754158634224.png",
      profileUrl: "http://alexjohnson.recruitmygame.com",
      loginEmail: "alexjohnson@test.com",
      loginPassword: "TestPassword123!",
      stats: {
        videos: 0, // Update from query results
        photos: 0, // Update from query results
        awards: 0, // Update from query results
        events: 0, // Update from query results
        reviews: 0, // Update from query results
        avgRating: 0, // Update from query results
      },
      subscriptionTier: "free", // Update from query results
      highlights: [
        // Update with actual achievements from database
        "Demo Account - Basketball Player",
        "Available for Testing Platform Features",
        "Sample Profile for Coach Review",
      ],
      featuredTools: ["Basic Profile Management", "Photo Gallery", "Social Share", "Teams"],
    },
    {
      name: "Maria Rodriguez", // Update with actual data from query
      sport: "Soccer", // Update with actual data
      position: "Midfielder", // Update with actual data
      school: "Valley High School", // Update with actual data
      location: "Fresno, CA", // Update with actual data
      classOf: "2026", // Update with actual data
      image: "https://fuvapddevwtiftgysikn.supabase.co/storage/v1/object/public/profile-pictures/a1ebdabd-2a9c-4d8a-95f0-a74ef6e91fdb/profile_1754156923655.png",
      profileUrl: "http://mariarodriguez.recruitmygame.com",
      loginEmail: "mariarodriguez@test.com",
      loginPassword: "TestPassword123!",
      stats: {
        videos: 3, // Update from query results
        photos: 0, // Update from query results
        awards: 2, // Update from query results
        events: 0, // Update from query results
        reviews: 1, // Update from query results
        avgRating: 0, // Update from query results
      },
      subscriptionTier: "premium", // Update from query results
      highlights: [
        // Update with actual achievements from database
        "Demo Account - Soccer Player",
        "Available for Testing Platform Features",
        "Sample Profile for Coach Review",
      ],
      featuredTools: ["Schedule Management", "Awards Timeline", "Video Showcase", "Standard Reviews"],
    },
    {
      name: "Marcus Thompson", // Update with actual data from query
      sport: "Football", // Update with actual data
      position: "Wide Receiver", // Update with actual data
      school: "Metro Academy", // Update with actual data
      location: "Los Angeles, CA", // Update with actual data
      classOf: "2026", // Update with actual data
      image: "https://fuvapddevwtiftgysikn.supabase.co/storage/v1/object/public/profile-pictures/6b13067f-da3a-4757-9989-842921f5cc9a/4ct609m0u24-1754023607314.png",
      profileUrl: "https://markymark.recruitmygame.com",
      loginEmail: "marcusthompson@test.com",
      loginPassword: "TestPassword123!",
      stats: {
        videos: 5, // Update from query results
        photos: 3, // Update from query results
        awards: 3, // Update from query results
        events: 8, // Update from query results
        reviews: 5, // Update from query results
        avgRating: 5.0, // Update from query results
      },
      subscriptionTier: "pro", // Update from query results
      highlights: [
        // Update with actual achievements from database
        "Demo Account - Football Player",
        "Available for Testing Platform Features",
        "Sample Profile for Coach Reviews",
      ],
      featuredTools: ["Analytics Dashboard", "Verified Reviews", "Business Cards", "Multiple Sports", "Schedule Management", "Custom Domain"],
    },
  ]

  return (
    <Box minH="100vh" bg="gray.50">
      <SiteHeader />

      {/* Hero Section with Gradient Background */}
      <Box
        bgGradient="linear(to-r, teal.400, blue.500, purple.600)"
        color="white"
        py={20}
        position="relative"
        overflow="hidden"
      >
        {/* Gradient overlay for better text readability */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-br, blackAlpha.200, blackAlpha.400)"
        />

        <Container maxW="7xl" position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <Badge
              bg="whiteAlpha.200"
              color="white"
              px={6}
              py={3}
              fontSize="md"
              borderRadius="full"
              backdropFilter="blur(10px)"
            >
              🎯 Live Demo Profiles
            </Badge>

            <Heading size="3xl" fontWeight="black" textShadow="2px 2px 4px rgba(0,0,0,0.3)">
              See RecruitMyGame in Action
            </Heading>

            <Text fontSize="xl" maxW="4xl" opacity={0.95} textShadow="1px 1px 2px rgba(0,0,0,0.2)">
              Dont just take our word for it! Try it out here - explore demo athlete profiles showcasing our complete platform features. Each demo profile highlights
              different aspects of our comprehensive recruitment system.
            </Text>

        
          </VStack>
        </Container>
      </Box>

      {/* Demo Login Information */}
      <Box bg="blue.50" py={12} borderBottom="1px" borderColor="blue.100">
        <Container maxW="7xl">
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center">
              <Heading size="lg" color="blue.800">
                Demo Account Login Information
              </Heading>
              <Text color="blue.600" maxW="4xl">
                Use these credentials to log in and test the platform from an athlete's perspective
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
              {demoProfiles.map((profile, index) => (
                <Card key={index} bg="white" shadow="md" borderRadius="lg" border="1px" borderColor="blue.200">
                  <CardBody p={6}>
                    <VStack spacing={4}>
                      <Avatar size="lg" src={profile.image} name={profile.name} />
                      <VStack spacing={2} textAlign="center">
                        <Heading size="md" color="gray.800">
                          {profile.name}
                        </Heading>
                        <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                          {profile.sport}
                        </Badge>
                      </VStack>

                      <VStack spacing={3} w="full" align="stretch">
                        <HStack spacing={2} p={3} bg="gray.50" borderRadius="md">
                          <Icon as={User} size={16} color="gray.600" />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                              EMAIL
                            </Text>
                            <Text fontSize="sm" fontFamily="mono" color="gray.700">
                              {profile.loginEmail}
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack spacing={2} p={3} bg="gray.50" borderRadius="md">
                          <Icon as={Key} size={16} color="gray.600" />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                              PASSWORD
                            </Text>
                            <Text fontSize="sm" fontFamily="mono" color="gray.700">
                              {profile.loginPassword}
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>

                      <HStack spacing={2} w="full">
                        <Link href={profile.profileUrl} style={{ flex: 1 }}>
                          <Button size="sm" colorScheme="blue" variant="outline" w="full">
                            View Profile
                          </Button>
                        </Link>
                        <Link href="/login" style={{ flex: 1 }}>
                          <Button size="sm" colorScheme="blue" w="full">
                            Login
                          </Button>
                        </Link>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Demo Profiles Section */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={16}>
          <VStack spacing={6} textAlign="center">
            <Heading size="2xl" fontWeight="black">
              Featured Demo Athlete Profiles
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="4xl">
              Each profile demonstrates different features and use cases. 
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} w="full">
            {demoProfiles.map((athlete, index) => (
              <Card
                key={index}
                shadow="2xl"
                borderRadius="2xl"
                overflow="hidden"
                _hover={{ transform: "translateY(-8px)", shadow: "3xl" }}
                transition="all 0.3s"
                border="1px"
                borderColor="gray.100"
                bg="white"
              >
                <CardBody p={8}>
                  <VStack spacing={6}>
                    {/* Profile Header */}
                    <VStack spacing={4}>
                      <Avatar
                        size="2xl"
                        src={athlete.image}
                        name={athlete.name}
                        border="4px solid"
                        borderColor="teal.100"
                      />
                      <VStack spacing={2} textAlign="center">
                        <Heading size="lg" color="gray.800">
                          {athlete.name}
                        </Heading>
                        <Badge colorScheme="teal" px={3} py={1} borderRadius="full" fontSize="sm">
                          {athlete.sport.toUpperCase()}
                        </Badge>
                        <Text color="gray.600" fontSize="md">
                          {athlete.position}
                        </Text>
                        <HStack spacing={2} color="gray.500" fontSize="sm">
                          <Icon as={MapPin} size={16} />
                          <Text>
                            {athlete.school} • {athlete.location}
                          </Text>
                        </HStack>
                        <Text color="gray.500" fontSize="sm">
                          Class of {athlete.classOf}
                        </Text>
                        <Badge
                          colorScheme={
                            athlete.subscriptionTier === "premium"
                              ? "blue"
                              : athlete.subscriptionTier === "pro"
                                ? "purple"
                                : "gray"
                          }
                          variant="subtle"
                        >
                          {athlete.subscriptionTier.toUpperCase()} TIER
                        </Badge>
                      </VStack>
                    </VStack>

                    {/* Profile Stats */}
                    <SimpleGrid columns={2} spacing={4} w="full">
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                          {athlete.stats.videos}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Videos
                        </Text>
                      </VStack>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                          {athlete.stats.photos}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Photos
                        </Text>
                      </VStack>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                          {athlete.stats.awards}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Awards
                        </Text>
                      </VStack>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="cyan.500">
                          {athlete.stats.events}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Events
                        </Text>
                      </VStack>
                    </SimpleGrid>

                    {/* Reviews Stats */}
                    {athlete.stats.reviews > 0 && (
                      <HStack spacing={4} w="full" justify="center">
                        <VStack spacing={1}>
                          <HStack>
                            <Text fontSize="lg" fontWeight="bold" color="orange.500">
                              {athlete.stats.avgRating}
                            </Text>
                            <Icon as={Star} size={16} color="orange.500" />
                          </HStack>
                          <Text fontSize="xs" color="gray.600">
                            {athlete.stats.reviews} Reviews
                          </Text>
                        </VStack>
                      </HStack>
                    )}

                    {/* Key Highlights */}
                    <VStack spacing={3} align="stretch" w="full">
                      <Text fontWeight="semibold" color="gray.700" fontSize="sm">
                        PROFILE STATUS
                      </Text>
                      {athlete.highlights.map((highlight, idx) => (
                        <HStack key={idx} spacing={3}>
                          <Icon as={Star} size={16} color="lime.500" />
                          <Text fontSize="sm" color="gray.600">
                            {highlight}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>

                    {/* Featured Tools */}
                    <VStack spacing={3} align="stretch" w="full">
                      <Text fontWeight="semibold" color="gray.700" fontSize="sm">
                        TESTABLE FEATURES
                      </Text>
                      <Flex wrap="wrap" gap={2}>
                        {athlete.featuredTools.map((tool, idx) => (
                          <Badge
                            key={idx}
                            colorScheme="gray"
                            variant="subtle"
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                          >
                            {tool}
                          </Badge>
                        ))}
                      </Flex>
                    </VStack>

                    {/* View Profile Button */}
                    <VStack spacing={3} w="full">
                      <Link href={athlete.profileUrl} style={{ width: "100%" }}>
                        <Button
                          size="lg"
                          colorScheme="teal"
                          rightIcon={<ExternalLink size={18} />}
                          w="full"
                          _hover={{
                            transform: "translateY(-2px)",
                            shadow: "lg",
                          }}
                          transition="all 0.2s"
                        >
                          View Public Profile
                        </Button>
                      </Link>

                      <Text fontSize="xs" color="gray.500" textAlign="center">
                        Login credentials provided above
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Interactive Demo Section */}
      <Box bg="white" py={20}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Badge colorScheme="purple" px={4} py={2} borderRadius="full" fontSize="md">
                🎮 Interactive Experience
              </Badge>
              <Heading size="2xl" fontWeight="black">
                Try Our Platform Features
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="4xl">
                Experience the key features that make RecruitMyGame the most comprehensive athletic recruitment
                platform. Use the login credentials above to test from an athlete's perspective.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
              {/* Video Showcase Demo */}
              <Card
                shadow="lg"
                borderRadius="xl"
                overflow="hidden"
                _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                transition="all 0.3s"
                border="1px"
                borderColor="gray.100"
              >
                <CardBody p={6} textAlign="center">
                  <VStack spacing={4}>
                    <Box p={3} bg="teal.50" borderRadius="lg">
                      <Icon as={Video} size={32} color="teal.500" />
                    </Box>
                    <Heading size="md">Video Showcase</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Upload and organize game film with custom thumbnails and descriptions.
                    </Text>
                    <Link href="/dashboard/videos">
                      <Button size="sm" colorScheme="teal" variant="outline">
                        Test Feature
                      </Button>
                    </Link>
                  </VStack>
                </CardBody>
              </Card>

              {/* Schedule Management Demo */}
              <Card
                shadow="lg"
                borderRadius="xl"
                overflow="hidden"
                _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                transition="all 0.3s"
                border="1px"
                borderColor="gray.100"
              >
                <CardBody p={6} textAlign="center">
                  <VStack spacing={4}>
                    <Box p={3} bg="lime.50" borderRadius="lg">
                      <Icon as={Calendar} size={32} color="lime.500" />
                    </Box>
                    <Heading size="md">Schedule System</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Manage availability and upcoming events for coach visibility.
                    </Text>
                    <Link href="/dashboard/schedule">
                      <Button size="sm" colorScheme="lime" variant="outline">
                        Test Feature
                      </Button>
                    </Link>
                  </VStack>
                </CardBody>
              </Card>

              {/* Awards Timeline Demo */}
              <Card
                shadow="lg"
                borderRadius="xl"
                overflow="hidden"
                _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                transition="all 0.3s"
                border="1px"
                borderColor="gray.100"
              >
                <CardBody p={6} textAlign="center">
                  <VStack spacing={4}>
                    <Box p={3} bg="yellow.50" borderRadius="lg">
                      <Icon as={Trophy} size={32} color="yellow.500" />
                    </Box>
                    <Heading size="md">Awards Timeline</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Display achievements and awards in a professional timeline format.
                    </Text>
                    <Link href="/dashboard/awards">
                      <Button size="sm" colorScheme="yellow" variant="outline">
                        Test Feature
                      </Button>
                    </Link>
                  </VStack>
                </CardBody>
              </Card>

              {/* Coach Reviews Demo */}
              <Card
                shadow="lg"
                borderRadius="xl"
                overflow="hidden"
                _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                transition="all 0.3s"
                border="1px"
                borderColor="gray.100"
              >
                <CardBody p={6} textAlign="center">
                  <VStack spacing={4}>
                    <Box p={3} bg="purple.50" borderRadius="lg">
                      <Icon as={Users} size={32} color="purple.500" />
                    </Box>
                    <Heading size="md">Coach Reviews</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Request and manage verified coach reviews with detailed ratings.
                    </Text>
                    <Link href="/dashboard/reviews">
                      <Button size="sm" colorScheme="purple" variant="outline">
                        Test Feature
                      </Button>
                    </Link>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Platform Benefits Section */}
      <Box bg="gray.50" py={20}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Heading size="2xl" fontWeight="black">
                Why Coaches Love Our Platform
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="4xl">
                Our demo profiles showcase the comprehensive information coaches need to make informed recruitment
                decisions.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <Card shadow="lg" borderRadius="xl" bg="white" border="1px" borderColor="gray.100">
                <CardBody p={8} textAlign="center">
                  <VStack spacing={4}>
                    <Icon as={Play} size={40} color="teal.500" />
                    <Heading size="md">Complete Athletic Story</Heading>
                    <Text color="gray.600">
                      Beyond highlights - see character, availability, achievements, and potential all in one place.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card shadow="lg" borderRadius="xl" bg="white" border="1px" borderColor="gray.100">
                <CardBody p={8} textAlign="center">
                  <VStack spacing={4}>
                    <Icon as={Award} size={40} color="lime.500" />
                    <Heading size="md">Verified Information</Heading>
                    <Text color="gray.600">
                      Authenticated coach reviews and verified achievements provide credible recruitment insights.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card shadow="lg" borderRadius="xl" bg="white" border="1px" borderColor="gray.100">
                <CardBody p={8} textAlign="center">
                  <VStack spacing={4}>
                    <Icon as={Calendar} size={40} color="purple.500" />
                    <Heading size="md">Real-Time Availability</Heading>
                    <Text color="gray.600">
                      Know exactly when and where to see athletes compete with up-to-date schedule information.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action with Gradient Background */}
      <Box
        bgGradient="linear(to-r, purple.500, pink.500, red.500)"
        color="white"
        py={16}
        position="relative"
        overflow="hidden"
      >
        {/* Gradient overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-br, blackAlpha.200, blackAlpha.400)"
        />

        <Container maxW="4xl" position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" fontWeight="black" textShadow="2px 2px 4px rgba(0,0,0,0.3)">
              Ready to Create Your Profile?
            </Heading>
            <Text fontSize="lg" opacity={0.95} textShadow="1px 1px 2px rgba(0,0,0,0.2)">
              Join the athletes who are already using RecruitMyGame to showcase their complete story to college coaches.
            </Text>
            <HStack spacing={4}>
              <Link href="/subscription">
                <Button
                  size="lg"
                  bg="white"
                  color="purple.600"
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  rightIcon={<ArrowRight size={20} />}
                  _hover={{
                    transform: "translateY(-2px)",
                    shadow: "xl",
                    bg: "gray.50",
                  }}
                  transition="all 0.3s"
                >
                  Get Started Today
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="white"
                  color="white"
                  px={8}
                  py={6}
                  fontSize="lg"
                  _hover={{
                    bg: "whiteAlpha.200",
                    transform: "translateY(-2px)",
                    shadow: "xl",
                  }}
                  transition="all 0.3s"
                >
                  Contact Us
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <SiteFooter />
    </Box>
  )
}
