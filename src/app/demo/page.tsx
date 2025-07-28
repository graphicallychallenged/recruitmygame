"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Button,
  Badge,
  Avatar,
  Card,
  CardBody,
  SimpleGrid,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react"
import { MapPin, Calendar, GraduationCap, Trophy, Star, Mail, Clock, QrCode, Share2 } from "lucide-react"
import Link from "next/link"

export default function DemoProfile() {
  const demoAthlete = {
    name: "Alex Johnson",
    sport: "Basketball",
    position: "Point Guard",
    graduationYear: "2025",
    location: "Austin, Texas",
    gpa: "3.8",
    height: "6'1\"",
    weight: "175 lbs",
    email: "alex.johnson@email.com",
    phone: "(555) 123-4567",
    bio: "Dedicated point guard with strong leadership skills and a passion for community service. Looking to continue my basketball career at the collegiate level while pursuing a degree in Sports Management.",
  }

  const stats = [
    { label: "Points Per Game", value: "18.5", color: "blue" },
    { label: "Assists Per Game", value: "7.2", color: "green" },
    { label: "Field Goal %", value: "45.8%", color: "purple" },
    { label: "Free Throw %", value: "82.1%", color: "orange" },
  ]

  const awards = [
    {
      title: "All-District First Team",
      organization: "District 25-6A",
      year: "2024",
      type: "Athletic",
      level: "District",
    },
    {
      title: "Academic All-State",
      organization: "Texas High School Basketball",
      year: "2024",
      type: "Academic",
      level: "State",
    },
    {
      title: "Team Captain",
      organization: "Austin High School",
      year: "2023-2024",
      type: "Leadership",
      level: "School",
    },
    {
      title: "Community Service Award",
      organization: "Austin Youth Foundation",
      year: "2023",
      type: "Character",
      level: "Community",
    },
  ]

  const schedule = [
    {
      event: "District Championship",
      date: "Feb 15, 2025",
      time: "7:00 PM",
      location: "Austin Convention Center",
      type: "Game",
    },
    {
      event: "Regional Tournament",
      date: "Feb 22, 2025",
      time: "6:00 PM",
      location: "San Antonio Sports Complex",
      type: "Tournament",
    },
    {
      event: "Community Food Drive",
      date: "Feb 28, 2025",
      time: "10:00 AM",
      location: "Austin Food Bank",
      type: "Community Service",
    },
  ]

  const reviews = [
    {
      reviewer: "Coach Martinez",
      organization: "Austin High School",
      rating: 5,
      comment: "Alex is an exceptional leader on and off the court. His basketball IQ and work ethic are unmatched.",
      relationship: "Head Coach",
    },
    {
      reviewer: "Sarah Williams",
      organization: "Austin Youth Foundation",
      rating: 5,
      comment:
        "Alex has volunteered over 100 hours with our organization. His dedication to helping others is inspiring.",
      relationship: "Program Director",
    },
  ]

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Demo Banner */}
      <Box bg="blue.500" color="white" py={3}>
        <Container maxW="6xl">
          <HStack justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={QrCode} />
              <Text fontWeight="semibold">Demo Profile</Text>
              <Badge colorScheme="yellow" color="black">
                PREVIEW
              </Badge>
            </HStack>
            <HStack spacing={4}>
              <Button as={Link} href="/getting-started" size="sm" variant="outline" colorScheme="whiteAlpha">
                Learn How to Create This
              </Button>
              <Button as={Link} href="/login" size="sm" bg="white" color="blue.500">
                Create Your Profile
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box bgGradient="linear(to-r, blue.600, purple.600)" color="white" py={16} position="relative" overflow="hidden">
        <Container maxW="6xl">
          <HStack spacing={8} align="start">
            <Avatar size="2xl" name={demoAthlete.name} src="/placeholder.svg?height=120&width=120" />
            <VStack align="start" spacing={4} flex={1}>
              <VStack align="start" spacing={2}>
                <Heading size="2xl">{demoAthlete.name}</Heading>
                <HStack spacing={4} flexWrap="wrap">
                  <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                    {demoAthlete.sport} • {demoAthlete.position}
                  </Badge>
                  <HStack spacing={1}>
                    <Icon as={GraduationCap} size={16} />
                    <Text>Class of {demoAthlete.graduationYear}</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Icon as={MapPin} size={16} />
                    <Text>{demoAthlete.location}</Text>
                  </HStack>
                </HStack>
              </VStack>

              <Text fontSize="lg" maxW="2xl" opacity={0.9}>
                {demoAthlete.bio}
              </Text>

              <HStack spacing={4}>
                <Button leftIcon={<Icon as={Mail} />} variant="outline" colorScheme="whiteAlpha">
                  Contact Alex
                </Button>
                <Button leftIcon={<Icon as={Share2} />} variant="outline" colorScheme="whiteAlpha">
                  Share Profile
                </Button>
                <Button leftIcon={<Icon as={QrCode} />} variant="outline" colorScheme="whiteAlpha">
                  QR Code
                </Button>
              </HStack>
            </VStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="6xl" py={12}>
        <VStack spacing={12} align="stretch">
          {/* Stats */}
          <Box>
            <Heading size="lg" mb={6}>
              Season Statistics
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              {stats.map((stat, index) => (
                <Card key={index} textAlign="center">
                  <CardBody>
                    <Text fontSize="3xl" fontWeight="bold" color={`${stat.color}.500`}>
                      {stat.value}
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      {stat.label}
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Main Content Tabs */}
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>Photos & Videos</Tab>
              <Tab>Awards & Achievements</Tab>
              <Tab>Schedule</Tab>
              <Tab>Reviews</Tab>
            </TabList>

            <TabPanels>
              {/* Photos & Videos */}
              <TabPanel px={0}>
                <VStack spacing={8} align="stretch">
                  <Box>
                    <Heading size="md" mb={4}>
                      Game Highlights
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Card>
                        <CardBody p={0}>
                          <Box position="relative">
                            <Image
                              src="/placeholder.svg?height=200&width=300"
                              alt="Game highlight"
                              w="full"
                              h="200px"
                              objectFit="cover"
                              rounded="md"
                            />
                            <Badge position="absolute" top={2} left={2} colorScheme="red">
                              VIDEO
                            </Badge>
                          </Box>
                          <Box p={4}>
                            <Text fontWeight="semibold">District Championship Highlights</Text>
                            <Text fontSize="sm" color="gray.600">
                              25 points, 8 assists in victory
                            </Text>
                          </Box>
                        </CardBody>
                      </Card>

                      <Card>
                        <CardBody p={0}>
                          <Box position="relative">
                            <Image
                              src="/placeholder.svg?height=200&width=300"
                              alt="Skills video"
                              w="full"
                              h="200px"
                              objectFit="cover"
                              rounded="md"
                            />
                            <Badge position="absolute" top={2} left={2} colorScheme="red">
                              VIDEO
                            </Badge>
                          </Box>
                          <Box p={4}>
                            <Text fontWeight="semibold">Skills Demonstration</Text>
                            <Text fontSize="sm" color="gray.600">
                              Ball handling and shooting drills
                            </Text>
                          </Box>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Heading size="md" mb={4}>
                      Photo Gallery
                    </Heading>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Image
                          key={i}
                          src={`/placeholder.svg?height=150&width=150&query=basketball photo ${i}`}
                          alt={`Photo ${i}`}
                          aspectRatio={1}
                          objectFit="cover"
                          rounded="md"
                          cursor="pointer"
                          _hover={{ transform: "scale(1.05)" }}
                          transition="transform 0.2s"
                        />
                      ))}
                    </SimpleGrid>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Awards */}
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  {awards.map((award, index) => (
                    <Card key={index}>
                      <CardBody>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="semibold" fontSize="lg">
                              {award.title}
                            </Text>
                            <Text color="gray.600">{award.organization}</Text>
                            <HStack spacing={2}>
                              <Badge colorScheme="blue" variant="subtle">
                                {award.type}
                              </Badge>
                              <Badge colorScheme="green" variant="outline">
                                {award.level}
                              </Badge>
                            </HStack>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Icon as={Trophy} color="gold" size={24} />
                            <Text fontWeight="semibold" color="gray.600">
                              {award.year}
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>

              {/* Schedule */}
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  {schedule.map((event, index) => (
                    <Card key={index}>
                      <CardBody>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={2} flex={1}>
                            <Text fontWeight="semibold" fontSize="lg">
                              {event.event}
                            </Text>
                            <HStack spacing={4} flexWrap="wrap">
                              <HStack spacing={1}>
                                <Icon as={Calendar} size={14} color="gray.500" />
                                <Text fontSize="sm" color="gray.600">
                                  {event.date}
                                </Text>
                              </HStack>
                              <HStack spacing={1}>
                                <Icon as={Clock} size={14} color="gray.500" />
                                <Text fontSize="sm" color="gray.600">
                                  {event.time}
                                </Text>
                              </HStack>
                              <HStack spacing={1}>
                                <Icon as={MapPin} size={14} color="gray.500" />
                                <Text fontSize="sm" color="gray.600">
                                  {event.location}
                                </Text>
                              </HStack>
                            </HStack>
                          </VStack>
                          <Badge colorScheme={event.type === "Community Service" ? "pink" : "blue"} variant="solid">
                            {event.type}
                          </Badge>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>

              {/* Reviews */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  {reviews.map((review, index) => (
                    <Card key={index}>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <HStack justify="space-between" w="full">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold">{review.reviewer}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {review.relationship}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {review.organization}
                              </Text>
                            </VStack>
                            <HStack>
                              {[...Array(5)].map((_, i) => (
                                <Icon
                                  key={i}
                                  as={Star}
                                  size={16}
                                  color={i < review.rating ? "gold" : "gray.300"}
                                  fill={i < review.rating ? "gold" : "none"}
                                />
                              ))}
                            </HStack>
                          </HStack>
                          <Text color="gray.700">"{review.comment}"</Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* CTA Section */}
          <Box bg="blue.50" p={8} rounded="lg" textAlign="center">
            <Heading size="lg" mb={4}>
              Ready to Create Your Own Profile?
            </Heading>
            <Text mb={6} color="gray.600">
              Join Alex and thousands of other student-athletes showcasing their complete story
            </Text>
            <HStack spacing={4} justify="center">
              <Button as={Link} href="/login" colorScheme="blue" size="lg">
                Get Started Free
              </Button>
              <Button as={Link} href="/subscription" variant="outline" size="lg">
                View Pricing
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Container>

      {/* Footer */}
      <Box bg="gray.800" color="white" py={8}>
        <Container maxW="6xl">
          <VStack spacing={4}>
            <Text textAlign="center">This is a demo profile showcasing RecruitMyGame's features</Text>
            <HStack spacing={6}>
              <Link href="/" style={{ textDecoration: "underline" }}>
                Home
              </Link>
              <Link href="/getting-started" style={{ textDecoration: "underline" }}>
                Getting Started
              </Link>
              <Link href="/contact" style={{ textDecoration: "underline" }}>
                Contact
              </Link>
              <Link href="/login" style={{ textDecoration: "underline" }}>
                Sign Up
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}
