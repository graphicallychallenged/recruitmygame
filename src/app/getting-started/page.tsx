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
  Card,
  CardBody,
  Badge,
  UnorderedList,
  ListItem,
  Divider,
} from "@chakra-ui/react"
import { UserPlus, Upload, Calendar, Award, Share2, CheckCircle, Camera, Video, Star, QrCode } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"

export default function GettingStarted() {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Your Account",
      description: "Sign up with email or social login to get started",
      time: "2 minutes",
      color: "teal",
    },
    {
      icon: Upload,
      title: "Build Your Profile",
      description: "Add your basic info, sport, position, and contact details",
      time: "5 minutes",
      color: "lime",
    },
    {
      icon: Camera,
      title: "Upload Photos & Videos",
      description: "Showcase your best game film and action shots",
      time: "10 minutes",
      color: "cyan",
    },
    {
      icon: Award,
      title: "Add Achievements",
      description: "List your awards, stats, and academic accomplishments",
      time: "5 minutes",
      color: "orange",
    },
    {
      icon: Calendar,
      title: "Set Your Schedule",
      description: "Let coaches know when and where you're playing",
      time: "3 minutes",
      color: "teal",
    },
    {
      icon: QrCode,
      title: "Generate Business Card",
      description: "Create QR codes and digital business cards for networking",
      time: "1 minute",
      color: "pink",
    },
  ]

  const tips = [
    {
      icon: Star,
      title: "Highlight Character",
      description: "Include community service and leadership activities - coaches value character as much as skill",
    },
    {
      icon: Video,
      title: "Quality Over Quantity",
      description: "Upload your best 3-5 videos rather than everything. Make each one count",
    },
    {
      icon: Calendar,
      title: "Keep Schedule Updated",
      description: "Regularly update your schedule so coaches know where to find you",
    },
    {
      icon: Share2,
      title: "Share Your Profile",
      description: "Use your QR code at tournaments and include your profile link in emails",
    },
  ]

  return (
    <Box minH="100vh">
      <SiteHeader />

      <Box bg="gray.50" py={12}>
        <Container maxW="6xl">
          <VStack spacing={12} align="stretch">
            {/* Header */}
            <Box textAlign="center">
              <Heading size="2xl" mb={4}>
                Getting Started with RecruitMyGame
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
                Follow these simple steps to create a compelling athlete profile that gets you noticed by college
                coaches
              </Text>
            </Box>

            {/* Steps */}
            <Box>
              <Heading size="xl" mb={8} textAlign="center">
                6 Simple Steps to Success
              </Heading>
              <VStack spacing={6}>
                {steps.map((step, index) => (
                  <Card key={index} w="full" shadow="sm" _hover={{ shadow: "md" }} transition="all 0.2s">
                    <CardBody>
                      <HStack spacing={6} align="start">
                        <Box bg={`${step.color}.100`} p={3} rounded="full" flexShrink={0}>
                          <Icon as={step.icon} size={24} color={`${step.color}.600`} />
                        </Box>
                        <VStack align="start" spacing={2} flex={1}>
                          <HStack>
                            <Badge colorScheme="gray" variant="outline">
                              Step {index + 1}
                            </Badge>
                            <Badge colorScheme={step.color} variant="subtle">
                              {step.time}
                            </Badge>
                          </HStack>
                          <Heading size="md">{step.title}</Heading>
                          <Text color="gray.600">{step.description}</Text>
                        </VStack>
                        <Icon as={CheckCircle} size={20} color="lime.500" />
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </Box>

            {/* Pro Tips */}
            <Box>
              <Heading size="xl" mb={8} textAlign="center">
                Pro Tips for Success
              </Heading>
              <VStack spacing={6}>
                {tips.map((tip, index) => (
                  <Card key={index} w="full" shadow="sm">
                    <CardBody>
                      <HStack spacing={4} align="start">
                        <Icon as={tip.icon} size={20} color="teal.500" flexShrink={0} />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="semibold">{tip.title}</Text>
                          <Text color="gray.600" fontSize="sm">
                            {tip.description}
                          </Text>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </Box>

            {/* What Makes a Great Profile */}
            <Box bg="white" p={8} rounded="lg" shadow="sm">
              <Heading size="lg" mb={6} textAlign="center">
                What Makes a Great Profile?
              </Heading>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    📸 Professional Photos
                  </Text>
                  <UnorderedList spacing={1} ml={6}>
                    <ListItem>High-quality action shots during games</ListItem>
                    <ListItem>Team photos and individual portraits</ListItem>
                    <ListItem>Community service and leadership photos</ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    🎥 Compelling Videos
                  </Text>
                  <UnorderedList spacing={1} ml={6}>
                    <ListItem>Game highlights showing your best plays</ListItem>
                    <ListItem>Skills demonstrations and training footage</ListItem>
                    <ListItem>Keep videos under 3 minutes for best engagement</ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    🏆 Complete Achievement List
                  </Text>
                  <UnorderedList spacing={1} ml={6}>
                    <ListItem>Athletic awards and recognitions</ListItem>
                    <ListItem>Academic achievements and GPA</ListItem>
                    <ListItem>Leadership roles and community service</ListItem>
                  </UnorderedList>
                </Box>
              </VStack>
            </Box>

            {/* CTA */}
            <Box textAlign="center" bg="teal.50" p={8} rounded="lg">
              <Heading size="lg" mb={4}>
                Ready to Get Started?
              </Heading>
              <Text mb={6} color="gray.600">
                Join thousands of student-athletes who are already showcasing their talents
              </Text>
              <HStack spacing={4} justify="center">
                <Button as={Link} href="/login" bg="teal.500" color="white" _hover={{ bg: "teal.600" }} size="lg">
                  Create Your Profile
                </Button>
                <Button as={Link} href="/demo" variant="outline" size="lg">
                  View Demo Profile
                </Button>
              </HStack>
            </Box>
          </VStack>
        </Container>
      </Box>

      <SiteFooter />
    </Box>
  )
}
