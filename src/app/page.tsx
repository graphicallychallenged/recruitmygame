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
  List,
  ListItem,
  ListIcon,
  Flex,
  Icon,
  Avatar,
  Image,
} from "@chakra-ui/react"
import {
  Trophy,
  Video,
  MessageSquare,
  CheckCircle,
  Shield,
  ArrowRight,
  Star,
  Play,
  Globe,
  Calendar,
  QrCode,
  Heart,
  Bell,
  Share2,
} from "lucide-react"
import { keyframes } from "@emotion/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"
import { SubscriptionPlans } from "@/components/SubscriptionPlans"

const float = keyframes`
  0%, 100% { transform: translateY(0px) }
  50% { transform: translateY(-20px) }
`

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      name: "Alex Rodriguez",
      sport: "Basketball",
      school: "High School Senior",
      image: "/placeholder.svg?height=60&width=60&text=AR",
      quote:
        "Finally, a platform that lets me showcase everything - my game film, community service, and upcoming games all in one place!",
      rating: 5,
    },
    {
      name: "Sarah Chen",
      sport: "Soccer",
      school: "Junior Athlete",
      image: "/placeholder.svg?height=60&width=60&text=SC",
      quote:
        "The business card feature with QR codes is genius - coaches can instantly access my profile at tournaments!",
      rating: 5,
    },
    {
      name: "Marcus Thompson",
      sport: "Track & Field",
      school: "Senior Athlete",
      image: "/placeholder.svg?height=60&width=60&text=MT",
      quote:
        "Love how I can highlight my volunteer work alongside my athletic achievements. It shows who I am as a person.",
      rating: 5,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box minH="100vh" position="relative">
      {/* Navigation */}
      <SiteHeader />
      {/* Hero Section with Background */}
      <Box
        position="relative"
        minH="100vh"
        bgImage="url('/landing/landing.png')"
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
      >
        {/* Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(135deg, rgba(132, 204, 22, 0.9) 0%, rgba(20, 184, 166, 0.8) 50%, rgba(6, 182, 212, 0.9) 100%)"
        />

        {/* Hero Content */}
        <Container maxW="7xl" position="relative" zIndex={2}>
          <Flex align="center" justify="center" minH="100vh" py={20}>
            <VStack spacing={8} textAlign="center" maxW="4xl">
              <Badge
                colorScheme="whiteAlpha"
                variant="solid"
                px={6}
                py={3}
                fontSize="md"
                borderRadius="full"
                animation={`${float} 3s ease-in-out infinite`}
              >
                🚀 The Future of Athletic Recruitment
              </Badge>

              <Heading
                as="h1"
                size="4xl"
                color="white"
                fontWeight="black"
                lineHeight="shorter"
                animation={`${fadeInUp} 1s ease-out`}
              >
                Showcase Your Complete
                <Text as="span" color="lime.300" display="block">
                  Athletic Story
                </Text>
              </Heading>

              <Text
                fontSize="2xl"
                color="whiteAlpha.900"
                maxW="3xl"
                fontWeight="medium"
                animation={`${fadeInUp} 1s ease-out 0.2s both`}
              >
                More than just highlights - showcase your game film, community service, upcoming schedule, and character
                in one professional profile that coaches will remember.
              </Text>

              <HStack spacing={6} flexWrap="wrap" justify="center" animation={`${fadeInUp} 1s ease-out 0.4s both`}>
                <Link href="/subscription">
                  <Button
                    size="xl"
                    bg="lime.400"
                    color="gray.900"
                    rightIcon={<ArrowRight size={24} />}
                    px={12}
                    py={8}
                    fontSize="xl"
                    fontWeight="bold"
                    _hover={{
                      transform: "translateY(-4px)",
                      shadow: "2xl",
                      bg: "lime.300",
                    }}
                    transition="all 0.3s"
                  >
                    Create Your Profile
                  </Button>
                </Link>
                  <Link href="/demo">
                <Button
                  
                  size="xl"
                  variant="outline"
                  color="white"
                  borderColor="white"
                  leftIcon={<Play size={24} />}
                  px={12}
                  py={8}
                  fontSize="xl"
                  _hover={{
                    bg: "whiteAlpha.200",
                    transform: "translateY(-4px)",
                    shadow: "2xl",
                  }}
                  transition="all 0.3s"
                >
                  See Demo
                </Button>
                </Link>
              </HStack>

              {/* Product Stats */}
              <SimpleGrid
                columns={{ base: 2, md: 4 }}
                spacing={8}
                pt={12}
                animation={`${fadeInUp} 1s ease-out 0.6s both`}
              >
                <VStack>
                  <Text fontSize="4xl" fontWeight="black" color="lime.300">
                    15+
                  </Text>
                  <Text color="whiteAlpha.900" fontWeight="semibold">
                    Video Uploads
                  </Text>
                </VStack>
                <VStack>
                  <Text fontSize="4xl" fontWeight="black" color="teal.300">
                    50+
                  </Text>
                  <Text color="whiteAlpha.900" fontWeight="semibold">
                    Photo Gallery
                  </Text>
                </VStack>
                <VStack>
                  <Text fontSize="4xl" fontWeight="black" color="cyan.300">
                    ∞
                  </Text>
                  <Text color="whiteAlpha.900" fontWeight="semibold">
                    Schedule Events
                  </Text>
                </VStack>
                <VStack>
                  <Text fontSize="4xl" fontWeight="black" color="lime.300">
                    24/7
                  </Text>
                  <Text color="whiteAlpha.900" fontWeight="semibold">
                    Profile Access
                  </Text>
                </VStack>
              </SimpleGrid>
            </VStack>
          </Flex>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="7xl" py={24}>
        <VStack spacing={20}>
          <VStack spacing={6} textAlign="center">
            <Badge colorScheme="teal" px={4} py={2} borderRadius="full" fontSize="md">
              ⚡ Complete Athletic Profile
            </Badge>
            <Heading size="2xl" fontWeight="black">
              Everything Coaches Want to See
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="4xl">
              Go beyond highlights. Show coaches your athletic ability, character, availability, and commitment all in
              one professional platform.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
            {/* Game Film */}
            <Card
              shadow="xl"
              borderRadius="2xl"
              overflow="hidden"
              _hover={{ transform: "translateY(-8px)", shadow: "2xl" }}
              transition="all 0.3s"
              border="1px"
              borderColor="gray.100"
            >
              <CardBody p={8}>
                <VStack spacing={6} align="start">
                  <Box p={4} bg="teal.50" borderRadius="xl">
                    <Icon as={Video} size={32} color="teal.500" />
                  </Box>
                  <Heading size="lg">Game Film Showcase</Heading>
                  <Text color="gray.600" fontSize="lg">
                    Upload up to 15 videos with custom thumbnails. Organize by position, season, or highlight type for
                    easy coach viewing.
                  </Text>
                  <List spacing={3} fontSize="md">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      HD video streaming
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Custom thumbnails
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      YouTube & Vimeo support
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            {/* Schedule & Availability */}
            <Card
              shadow="xl"
              borderRadius="2xl"
              overflow="hidden"
              _hover={{ transform: "translateY(-8px)", shadow: "2xl" }}
              transition="all 0.3s"
              border="1px"
              borderColor="gray.100"
            >
              <CardBody p={8}>
                <VStack spacing={6} align="start">
                  <Box p={4} bg="lime.50" borderRadius="xl">
                    <Icon as={Calendar} size={32} color="lime.500" />
                  </Box>
                  <Heading size="lg">Schedule & Availability</Heading>
                  <Text color="gray.600" fontSize="lg">
                    Let coaches know when and where you're playing. Add games, tournaments, camps, and showcases with
                    locations and times.
                  </Text>
                  <List spacing={3} fontSize="md">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Upcoming games & events
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Tournament schedules
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Location & time details
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            {/* Community Service */}
            <Card
              shadow="xl"
              borderRadius="2xl"
              overflow="hidden"
              _hover={{ transform: "translateY(-8px)", shadow: "2xl" }}
              transition="all 0.3s"
              border="1px"
              borderColor="gray.100"
            >
              <CardBody p={8}>
                <VStack spacing={6} align="start">
                  <Box p={4} bg="pink.50" borderRadius="xl">
                    <Icon as={Heart} size={32} color="pink.500" />
                  </Box>
                  <Heading size="lg">Character & Service</Heading>
                  <Text color="gray.600" fontSize="lg">
                    Highlight your volunteer work, community service, and leadership activities. Show coaches your
                    character off the field.
                  </Text>
                  <List spacing={3} fontSize="md">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Community service hours
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Leadership roles
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Volunteer activities
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            {/* Business Cards & QR Codes */}
            <Card
              shadow="xl"
              borderRadius="2xl"
              overflow="hidden"
              _hover={{ transform: "translateY(-8px)", shadow: "2xl" }}
              transition="all 0.3s"
              border="1px"
              borderColor="gray.100"
            >
              <CardBody p={8}>
                <VStack spacing={6} align="start">
                  <Box p={4} bg="cyan.50" borderRadius="xl">
                    <Icon as={QrCode} size={32} color="cyan.500" />
                  </Box>
                  <Heading size="lg">Business Cards & QR Codes</Heading>
                  <Text color="gray.600" fontSize="lg">
                    Generate professional business cards with QR codes that link directly to your profile. Perfect for
                    tournaments and showcases.
                  </Text>
                  <List spacing={3} fontSize="md">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Instant QR code access
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Professional design
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Pro account receives 250 cards
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            {/* Awards & Achievements */}
            <Card
              shadow="xl"
              borderRadius="2xl"
              overflow="hidden"
              _hover={{ transform: "translateY(-8px)", shadow: "2xl" }}
              transition="all 0.3s"
              border="1px"
              borderColor="gray.100"
            >
              <CardBody p={8}>
                <VStack spacing={6} align="start">
                  <Box p={4} bg="yellow.50" borderRadius="xl">
                    <Icon as={Trophy} size={32} color="yellow.600" />
                  </Box>
                  <Heading size="lg">Awards & Achievements</Heading>
                  <Text color="gray.600" fontSize="lg">
                    Showcase your athletic accomplishments, academic awards, and recognition in a professional timeline
                    format.
                  </Text>
                  <List spacing={3} fontSize="md">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Athletic awards
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Academic honors
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Achievement timeline
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            {/* Coach Reviews */}
            <Card
              shadow="xl"
              borderRadius="2xl"
              overflow="hidden"
              _hover={{ transform: "translateY(-8px)", shadow: "2xl" }}
              transition="all 0.3s"
              border="1px"
              borderColor="gray.100"
            >
              <CardBody p={8}>
                <VStack spacing={6} align="start">
                  <Box p={4} bg="teal.50" borderRadius="xl">
                    <Icon as={MessageSquare} size={32} color="teal.500" />
                  </Box>
                  <Heading size="lg">Coach Testimonials</Heading>
                  <Text color="gray.600" fontSize="lg">
                    Request and display testimonials from coaches who have worked with you. Build credibility with
                    verified reviews.
                  </Text>
                  <List spacing={3} fontSize="md">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Verified coach reviews
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Star ratings
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="lime.500" />
                      Easy request system
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Testimonials Section */}
      <Box bg="gray.50" py={24}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Badge colorScheme="lime" px={4} py={2} borderRadius="full" fontSize="md">
                💬 Early User Feedback
              </Badge>
              <Heading size="2xl" fontWeight="black">
                What Athletes Are Saying
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="3xl">
                Student-athletes are already discovering the power of showcasing their complete story, not just their
                highlights.
              </Text>
            </VStack>

            <Card maxW="4xl" shadow="2xl" borderRadius="2xl" bg="white" p={8} border="1px" borderColor="gray.100">
              <CardBody>
                <VStack spacing={8}>
                  <HStack spacing={2}>
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} as={Star} color="yellow.400" fill="currentColor" />
                    ))}
                  </HStack>

                  <Text fontSize="2xl" textAlign="center" fontStyle="italic" color="gray.700" lineHeight="tall">
                    "{testimonials[currentTestimonial].quote}"
                  </Text>

                  <HStack spacing={4}>
                    <Avatar
                      size="lg"
                      src={testimonials[currentTestimonial].image}
                      name={testimonials[currentTestimonial].name}
                    />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">
                        {testimonials[currentTestimonial].name}
                      </Text>
                      <Text color="gray.600">
                        {testimonials[currentTestimonial].sport} • {testimonials[currentTestimonial].school}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={2}>
                    {testimonials.map((_, index) => (
                      <Box
                        key={index}
                        w={3}
                        h={3}
                        borderRadius="full"
                        bg={index === currentTestimonial ? "teal.500" : "gray.300"}
                        cursor="pointer"
                        onClick={() => setCurrentTestimonial(index)}
                        transition="all 0.3s"
                      />
                    ))}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>

      {/* Feature Section 1: Video Management System */}
      <Box bg="white" py={24}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            <VStack spacing={8} align="start">
              <Badge colorScheme="teal" px={4} py={2} borderRadius="full" fontSize="md">
                🎬 Video Showcase
              </Badge>
              <Heading size="2xl" fontWeight="black" color="gray.900">
                Professional Video Management System
              </Heading>
              <Text fontSize="xl" color="gray.600" lineHeight="tall">
                Upload up to 15 high-definition videos with our advanced video management system. Each video supports
                custom thumbnails, detailed descriptions, and categorization by position, season, or highlight type.
                Coaches can easily browse your game film organized exactly how they want to see it.
              </Text>
              <List spacing={4} fontSize="lg">
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="teal.500" />
                  HD video streaming with adaptive quality
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="teal.500" />
                  Custom thumbnail generation and upload
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="teal.500" />
                  YouTube and Vimeo integration support
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="teal.500" />
                  Video categorization and tagging system
                </ListItem>
              </List>
            
            </VStack>
            <Box>
              <Image
                src="/placeholder.svg?height=400&width=600&text=Video+Management+System"
                alt="Video Management System"
                borderRadius="2xl"
                shadow="2xl"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Feature Section 2: Verified Coach Reviews */}
      <Box bg="gray.50" py={24}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            <Box order={{ base: 2, lg: 1 }}>
              <Image
                src="/placeholder.svg?height=400&width=600&text=Verified+Coach+Reviews"
                alt="Verified Coach Reviews System"
                borderRadius="2xl"
                shadow="2xl"
              />
            </Box>
            <VStack spacing={8} align="start" order={{ base: 1, lg: 2 }}>
              <Badge colorScheme="purple" px={4} py={2} borderRadius="full" fontSize="md">
                ⭐ Verified Reviews
              </Badge>
              <Heading size="2xl" fontWeight="black" color="gray.900">
                Build Credibility with Verified Coach Testimonials
              </Heading>
              <Text fontSize="xl" color="gray.600" lineHeight="tall">
                Request and display verified testimonials from coaches who have worked with you. Our email verification
                system ensures authenticity and builds credibility with recruiting coaches. Each review includes
                detailed ratings for athleticism, character, work ethic, leadership, coachability, and teamwork.
              </Text>
              <List spacing={4} fontSize="lg">
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="purple.500" />
                  Email verification system for coaches
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="purple.500" />
                  Detailed rating categories with 5-star system
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="purple.500" />
                  Automated review request workflow
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="purple.500" />
                  Professional review display with coach credentials
                </ListItem>
              </List>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Feature Section 3: Business Card Generator */}
      <Box bg="white" py={24}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            <VStack spacing={8} align="start">
              <Badge colorScheme="cyan" px={4} py={2} borderRadius="full" fontSize="md">
                📱 QR Codes
              </Badge>
              <Heading size="2xl" fontWeight="black" color="gray.900">
                Professional Business Cards with QR Codes
              </Heading>
              <Text fontSize="xl" color="gray.600" lineHeight="tall">
                Generate professional business cards with QR codes that link directly to your profile. Perfect for
                tournaments, showcases, and networking events with coaches and recruiters. Pro accounts receive 250
                professionally printed cards delivered to your door.
              </Text>
              <List spacing={4} fontSize="lg">
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="cyan.500" />
                  Instant QR code generation linking to your profile
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="cyan.500" />
                  Professional design templates with your photo
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="cyan.500" />
                  Print-ready PDF download for local printing
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="cyan.500" />
                  Pro accounts get 250 cards professionally printed
                </ListItem>
              </List>
            
            </VStack>
            <Box>
              <Image
                src="/placeholder.svg?height=400&width=600&text=Business+Card+Generator"
                alt="Business Card Generator"
                borderRadius="2xl"
                shadow="2xl"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Feature Section 4: Analytics Dashboard */}
      <Box bg="gray.50" py={24}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            <Box order={{ base: 2, lg: 1 }}>
              <Image
                src="/placeholder.svg?height=400&width=600&text=Analytics+Dashboard"
                alt="Analytics Dashboard"
                borderRadius="2xl"
                shadow="2xl"
              />
            </Box>
            <VStack spacing={8} align="start" order={{ base: 1, lg: 2 }}>
              <Badge colorScheme="orange" px={4} py={2} borderRadius="full" fontSize="md">
                📊 Analytics
              </Badge>
              <Heading size="2xl" fontWeight="black" color="gray.900">
                Track Your Profile Performance
              </Heading>
              <Text fontSize="xl" color="gray.600" lineHeight="tall">
                Monitor your profile's performance with detailed analytics including page views, visitor demographics,
                device types, and engagement metrics. Understand which coaches are viewing your profile and optimize
                your recruitment strategy with data-driven insights.
              </Text>
              <List spacing={4} fontSize="lg">
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="orange.500" />
                  Real-time visitor tracking and page views
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="orange.500" />
                  Geographic visitor data and device analytics
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="orange.500" />
                  Profile completeness scoring and recommendations
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="orange.500" />
                  Engagement metrics and optimization tips
                </ListItem>
              </List>
            
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Feature Section 5: Schedule Management */}
      <Box bg="white" py={24}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            <VStack spacing={8} align="start">
              <Badge colorScheme="green" px={4} py={2} borderRadius="full" fontSize="md">
                📅 Schedule
              </Badge>
              <Heading size="2xl" fontWeight="black" color="gray.900">
                Smart Schedule Management System
              </Heading>
              <Text fontSize="xl" color="gray.600" lineHeight="tall">
                Keep coaches informed about your availability with our comprehensive schedule system. Add unlimited
                games, tournaments, camps, showcases, and training sessions with detailed location and timing
                information. Coaches can see exactly when and where you'll be playing.
              </Text>
              <List spacing={4} fontSize="lg">
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="green.500" />
                  Unlimited event creation and management
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="green.500" />
                  Detailed venue and location information
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="green.500" />
                  Event categorization (games, tournaments, camps)
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="green.500" />
                  Automatic chronological sorting and notifications
                </ListItem>
              </List>
              
            </VStack>
            <Box>
              <Image
                src="/placeholder.svg?height=400&width=600&text=Schedule+Management"
                alt="Schedule Management System"
                borderRadius="2xl"
                shadow="2xl"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Feature Section 6: Subscribe to Athlete Updates */}
      <Box bg="gray.50" py={24}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            <Box order={{ base: 2, lg: 1 }}>
              <Image
                src="/placeholder.svg?height=400&width=600&text=Subscribe+to+Updates"
                alt="Subscribe to Athlete Updates"
                borderRadius="2xl"
                shadow="2xl"
              />
            </Box>
            <VStack spacing={8} align="start" order={{ base: 1, lg: 2 }}>
              <Badge colorScheme="blue" px={4} py={2} borderRadius="full" fontSize="md">
                🔔 Notifications
              </Badge>
              <Heading size="2xl" fontWeight="black" color="gray.900">
                Stay Connected with Athlete Updates
              </Heading>
              <Text fontSize="xl" color="gray.600" lineHeight="tall">
                Coaches and fans can subscribe to receive notifications when athletes update their profiles with new
                videos, schedule changes, awards, or achievements. Our smart notification system ensures coaches never
                miss important updates from their top prospects.
              </Text>
              <List spacing={4} fontSize="lg">
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="blue.500" />
                  Email notifications for profile updates
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="blue.500" />
                  Customizable notification preferences
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="blue.500" />
                  New video and achievement alerts
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="blue.500" />
                  Schedule change notifications
                </ListItem>
              </List>
            
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Feature Section 7: Social Share */}
      <Box bg="white" py={24}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            <VStack spacing={8} align="start">
              <Badge colorScheme="pink" px={4} py={2} borderRadius="full" fontSize="md">
                📢 Social Sharing
              </Badge>
              <Heading size="2xl" fontWeight="black" color="gray.900">
                Amplify Your Reach with Social Sharing
              </Heading>
              <Text fontSize="xl" color="gray.600" lineHeight="tall">
                Expand your visibility with built-in social media sharing capabilities. Athletes can easily share their
                profiles across all major social platforms with custom messages and hashtags. Privacy controls allow you
                to manage who can share your profile and when.
              </Text>
              <List spacing={4} fontSize="lg">
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="pink.500" />
                  One-click sharing to all major social platforms
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="pink.500" />
                  Custom share messages and hashtags
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="pink.500" />
                  Privacy controls for sharing permissions
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="pink.500" />
                  Track social engagement and reach
                </ListItem>
              </List>
            
            </VStack>
            <Box>
              <Image
                src="/placeholder.svg?height=400&width=600&text=Social+Sharing"
                alt="Social Sharing Features"
                borderRadius="2xl"
                shadow="2xl"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Container maxW="7xl" py={24}>
        <VStack spacing={16}>
          <VStack spacing={6} textAlign="center">
            <Badge colorScheme="cyan" px={4} py={2} borderRadius="full" fontSize="md">
              💰 Simple Pricing
            </Badge>
          </VStack>
          <SubscriptionPlans variant="landing" />
        </VStack>
      </Container>

      {/* CTA Section */}
      <Box
        color="white"
        py={24}
        bg="linear-gradient(135deg, rgba(132, 204, 22, 0.9) 0%, rgba(20, 184, 166, 0.8) 50%, rgba(6, 182, 212, 0.9) 100%)"
      >
        <Container maxW="7xl">
          <VStack spacing={12} textAlign="center">
            <Heading size="2xl" fontWeight="black">
              Ready to Stand Out?
            </Heading>
            <Text fontSize="2xl" maxW="4xl" fontWeight="medium">
              Create a comprehensive athletic profile that showcases not just your skills, but your character,
              availability, and commitment to excellence.
            </Text>
            <HStack spacing={6} flexWrap="wrap" justify="center">
              <Link href="/subscription">
                <Button
                  size="xl"
                  bg="lime.400"
                  color="gray.900"
                  px={12}
                  py={8}
                  fontSize="xl"
                  fontWeight="bold"
                  rightIcon={<ArrowRight size={20} />}
                  _hover={{
                    transform: "translateY(-4px)",
                    shadow: "2xl",
                    bg: "lime.300",
                  }}
                  transition="all 0.3s"
                >
                  Start Your Profile Today
                </Button>
              </Link>
              <Button
                size="xl"
                variant="outline"
                color="white"
                borderColor="white"
                px={12}
                py={8}
                fontSize="xl"
                _hover={{
                  bg: "whiteAlpha.200",
                  transform: "translateY(-4px)",
                  shadow: "2xl",
                }}
                transition="all 0.3s"
              >
                Contact Us
              </Button>
            </HStack>

            {/* Trust Indicators */}
            <HStack spacing={12} pt={8} opacity={0.8}>
              <VStack>
                <Icon as={Shield} size={24} />
                <Text fontSize="sm">Secure & Private</Text>
              </VStack>
              <VStack>
                <Icon as={Globe} size={24} />
                <Text fontSize="sm">Mobile Friendly</Text>
              </VStack>
              <VStack>
                <Icon as={QrCode} size={24} />
                <Text fontSize="sm">QR Code Ready</Text>
              </VStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <SiteFooter />
    </Box>
  )
}
