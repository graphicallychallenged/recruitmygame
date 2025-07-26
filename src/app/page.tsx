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
  useColorModeValue,
} from "@chakra-ui/react"
import {
  Trophy,
  Users,
  Video,
  Camera,
  Calendar,
  MessageSquare,
  CheckCircle,
  CreditCard,
  Shield,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/Logo"

export default function HomePage() {
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, blue.900, purple.900, pink.900)",
  )

  return (
    <Box minH="100vh">
      {/* Navigation */}
      <Box as="nav" py={4} px={6} borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <Logo />
            <HStack spacing={4}>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/subscription">
                <Button colorScheme="blue">Get Started</Button>
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box bgGradient={bgGradient} py={20}>
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Badge colorScheme="purple" variant="subtle" px={4} py={2} fontSize="sm">
              🚀 New: Pro Features Now Available
            </Badge>

            <Heading size="3xl" maxW="4xl">
              Get Recruited with Your
              <Text as="span" color="blue.500">
                {" "}
                Professional Athletic Profile
              </Text>
            </Heading>

            <Text fontSize="xl" color="gray.600" maxW="3xl">
              Create a stunning recruitment profile that showcases your athletic achievements, game film, and gets you
              noticed by college coaches and recruiters.
            </Text>

            <HStack spacing={4}>
              <Link href="/subscription">
                <Button size="lg" colorScheme="blue" rightIcon={<ArrowRight size={20} />}>
                  Start Building Your Profile
                </Button>
              </Link>
              <Button size="lg" variant="outline" leftIcon={<Video size={20} />}>
                Watch Demo
              </Button>
            </HStack>

            {/* Quick Stats */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} pt={8}>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  10K+
                </Text>
                <Text color="gray.600">Athletes</Text>
              </VStack>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                  500+
                </Text>
                <Text color="gray.600">Colleges</Text>
              </VStack>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                  2K+
                </Text>
                <Text color="gray.600">Scholarships</Text>
              </VStack>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                  95%
                </Text>
                <Text color="gray.600">Success Rate</Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={16}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl">Everything You Need to Get Recruited</Heading>
            <Text fontSize="lg" color="gray.600" maxW="3xl">
              Our platform provides all the tools and features you need to create a professional athletic profile that
              stands out to college coaches and recruiters.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {/* Core Features */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="start">
                  <Icon as={Video} size={40} color="blue.500" />
                  <Heading size="md">Game Film Showcase</Heading>
                  <Text color="gray.600">
                    Upload and organize your best game footage with professional video player and descriptions.
                  </Text>
                  <List spacing={2} fontSize="sm">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      HD video streaming
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Custom thumbnails
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Easy sharing
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={4} align="start">
                  <Icon as={Trophy} size={40} color="gold" />
                  <Heading size="md">Awards & Achievements</Heading>
                  <Text color="gray.600">
                    Showcase your athletic accomplishments, awards, and recognition in a professional format.
                  </Text>
                  <List spacing={2} fontSize="sm">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Award certificates
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Achievement timeline
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Statistics tracking
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={4} align="start">
                  <Icon as={Camera} size={40} color="purple.500" />
                  <Heading size="md">Photo Gallery</Heading>
                  <Text color="gray.600">
                    Create a visual story of your athletic journey with action shots and team photos.
                  </Text>
                  <List spacing={2} fontSize="sm">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      High-quality images
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Gallery organization
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Mobile optimized
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={4} align="start">
                  <Icon as={Calendar} size={40} color="green.500" />
                  <Heading size="md">Schedule Management</Heading>
                  <Text color="gray.600">Keep coaches updated on your upcoming games, tournaments, and showcases.</Text>
                  <List spacing={2} fontSize="sm">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Event calendar
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Location details
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Automatic reminders
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={4} align="start">
                  <Icon as={MessageSquare} size={40} color="blue.500" />
                  <Heading size="md">Coach Reviews</Heading>
                  <Text color="gray.600">Collect and display testimonials from coaches who have worked with you.</Text>
                  <List spacing={2} fontSize="sm">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Star ratings
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Written testimonials
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Coach verification
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={4} align="start">
                  <Icon as={Users} size={40} color="orange.500" />
                  <Heading size="md">Direct Coach Contact</Heading>
                  <Text color="gray.600">
                    Make it easy for college coaches to reach out to you with built-in contact forms.
                  </Text>
                  <List spacing={2} fontSize="sm">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Secure messaging
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Contact tracking
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Response management
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Pro Features Highlight */}
      <Box bg="purple.50" py={20}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Badge colorScheme="purple" variant="solid" px={4} py={2} fontSize="md">
                🚀 NEW: Pro Features
              </Badge>
              <Heading size="xl">Take Your Profile to the Next Level</Heading>
              <Text fontSize="lg" color="gray.600" maxW="3xl">
                Unlock advanced features designed for serious athletes who want to maximize their recruitment
                opportunities and stand out from the competition.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              <Card bg="white" shadow="md">
                <CardBody textAlign="center">
                  <VStack spacing={4}>
                    <Icon as={CreditCard} size={40} color="purple.500" />
                    <Heading size="md">Business Cards</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Generate professional business cards with QR codes linking to your profile
                    </Text>
                    <Badge colorScheme="purple" variant="outline">
                      250 cards included
                    </Badge>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="white" shadow="md">
                <CardBody textAlign="center">
                  <VStack spacing={4}>
                    <Icon as={Shield} size={40} color="green.500" />
                    <Heading size="md">Verified Reviews</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Send secure review requests to coaches with verified response links
                    </Text>
                    <Badge colorScheme="green" variant="outline">
                      Verified badge
                    </Badge>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="white" shadow="md">
                <CardBody textAlign="center">
                  <VStack spacing={4}>
                    <Icon as={Target} size={40} color="blue.500" />
                    <Heading size="md">Multiple Sports</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Showcase expertise in multiple sports on a single profile
                    </Text>
                    <Badge colorScheme="blue" variant="outline">
                      Multi-sport athlete
                    </Badge>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="white" shadow="md">
                <CardBody textAlign="center">
                  <VStack spacing={4}>
                    <Icon as={Zap} size={40} color="orange.500" />
                    <Heading size="md">Priority Support</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Get dedicated support and faster response times
                    </Text>
                    <Badge colorScheme="orange" variant="outline">
                      24/7 support
                    </Badge>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Link href="/subscription">
              <Button size="lg" colorScheme="purple" rightIcon={<ArrowRight size={20} />}>
                Upgrade to Pro
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>

      {/* Pricing Teaser */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl">Choose Your Plan</Heading>
            <Text fontSize="lg" color="gray.600">
              Start free and upgrade as your recruitment journey progresses
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="5xl">
            {/* Free Plan */}
            <Card>
              <CardBody textAlign="center">
                <VStack spacing={4}>
                  <Heading size="lg">Free</Heading>
                  <Text fontSize="3xl" fontWeight="bold">
                    $0
                    <Text as="span" fontSize="lg" color="gray.500">
                      /month
                    </Text>
                  </Text>
                  <List spacing={2} fontSize="sm">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />3 videos
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      10 photos
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Basic profile
                    </ListItem>
                  </List>
                  <Button w="full" variant="outline">
                    Get Started
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Premium Plan */}
            <Card borderColor="blue.500" borderWidth="2px">
              <CardBody textAlign="center">
                <VStack spacing={4}>
                  <Badge colorScheme="blue" variant="solid">
                    Most Popular
                  </Badge>
                  <Heading size="lg">Premium</Heading>
                  <Text fontSize="3xl" fontWeight="bold">
                    $9.99
                    <Text as="span" fontSize="lg" color="gray.500">
                      /month
                    </Text>
                  </Text>
                  <List spacing={2} fontSize="sm">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      15 videos
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      50 photos
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Custom branding
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Analytics
                    </ListItem>
                  </List>
                  <Button w="full" colorScheme="blue">
                    Choose Premium
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Pro Plan */}
            <Card borderColor="purple.500" borderWidth="2px">
              <CardBody textAlign="center">
                <VStack spacing={4}>
                  <Badge colorScheme="purple" variant="solid">
                    🚀 New
                  </Badge>
                  <Heading size="lg">Pro</Heading>
                  <Text fontSize="3xl" fontWeight="bold">
                    $19.99
                    <Text as="span" fontSize="lg" color="gray.500">
                      /month
                    </Text>
                  </Text>
                  <List spacing={2} fontSize="sm">
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Unlimited content
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Business cards
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Verified reviews
                    </ListItem>
                    <ListItem display="flex" alignItems="center">
                      <ListIcon as={CheckCircle} color="green.500" />
                      Multiple sports
                    </ListItem>
                  </List>
                  <Button w="full" colorScheme="purple">
                    Choose Pro
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Link href="/subscription">
            <Button variant="ghost" rightIcon={<ArrowRight size={16} />}>
              View Full Pricing Details
            </Button>
          </Link>
        </VStack>
      </Container>

      {/* CTA Section */}
      <Box bg="blue.600" color="white" py={20}>
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="xl">Ready to Get Recruited?</Heading>
            <Text fontSize="lg" maxW="3xl">
              Join thousands of athletes who have already created their professional recruitment profiles and connected
              with college coaches.
            </Text>
            <HStack spacing={4}>
              <Link href="/subscription">
                <Button size="lg" colorScheme="whiteAlpha" variant="solid">
                  Start Your Profile Today
                </Button>
              </Link>
              <Button size="lg" variant="outline" colorScheme="whiteAlpha">
                Contact Sales
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" color="white" py={12}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <VStack align="start" spacing={4}>
              <Logo />
              <Text fontSize="sm" color="gray.400">
                The premier platform for athletic recruitment profiles.
              </Text>
            </VStack>
            <VStack align="start" spacing={3}>
              <Heading size="sm">Product</Heading>
              <Link href="/features">
                <Text fontSize="sm" color="gray.400" _hover={{ color: "white" }}>
                  Features
                </Text>
              </Link>
              <Link href="/subscription">
                <Text fontSize="sm" color="gray.400" _hover={{ color: "white" }}>
                  Pricing
                </Text>
              </Link>
            </VStack>
            <VStack align="start" spacing={3}>
              <Heading size="sm">Support</Heading>
              <Link href="/help">
                <Text fontSize="sm" color="gray.400" _hover={{ color: "white" }}>
                  Help Center
                </Text>
              </Link>
              <Link href="/contact">
                <Text fontSize="sm" color="gray.400" _hover={{ color: "white" }}>
                  Contact Us
                </Text>
              </Link>
            </VStack>
            <VStack align="start" spacing={3}>
              <Heading size="sm">Legal</Heading>
              <Link href="/privacy">
                <Text fontSize="sm" color="gray.400" _hover={{ color: "white" }}>
                  Privacy Policy
                </Text>
              </Link>
              <Link href="/terms">
                <Text fontSize="sm" color="gray.400" _hover={{ color: "white" }}>
                  Terms of Service
                </Text>
              </Link>
            </VStack>
          </SimpleGrid>
          <Box borderTop="1px" borderColor="gray.700" mt={8} pt={8} textAlign="center">
            <Text fontSize="sm" color="gray.400">
              © 2024 RecruitMyGame. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
