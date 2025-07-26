"use client"

import type React from "react"

import { useState } from "react"
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Badge,
  Avatar,
  Grid,
  Card,
  CardBody,
  VStack,
  HStack,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Center,
} from "@chakra-ui/react"
import { Mail, MapPin, GraduationCap, Calendar, Trophy, Camera, Video, Star } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface Athlete {
  id: string
  username: string
  athlete_name: string
  sport: string
  school?: string
  location?: string
  grade?: string
  gpa?: number
  graduation_year?: number
  positions_played?: string[]
  profile_picture_url?: string
  primary_color?: string
  secondary_color?: string
  content_order?: string[]
  subscription_tier?: string
  subscription_status?: string
}

interface PublicProfileClientProps {
  athlete: Athlete
}

export default function PublicProfileClient({ athlete }: PublicProfileClientProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    organization: "",
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("contact_submissions").insert({
        athlete_id: athlete.id,
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        message: formData.message,
      })

      if (error) throw error

      toast({
        title: "Message sent!",
        description: "Your message has been sent successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      setFormData({ name: "", email: "", message: "", organization: "" })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Hero Section */}
      <Box
        bgGradient={`linear(to-r, ${athlete.primary_color || "#1a202c"}, ${athlete.secondary_color || "#2d3748"})`}
        color="white"
        py={20}
      >
        <Container maxW="6xl">
          <Flex direction={{ base: "column", md: "row" }} align="center" gap={8}>
            <Avatar size="2xl" src={athlete.profile_picture_url} name={athlete.athlete_name} border="4px solid white" />
            <VStack align={{ base: "center", md: "start" }} spacing={4} flex={1}>
              <Heading size="2xl" textAlign={{ base: "center", md: "left" }}>
                {athlete.athlete_name}
              </Heading>
              <HStack spacing={4} flexWrap="wrap" justify={{ base: "center", md: "start" }}>
                <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                  {athlete.sport}
                </Badge>
                {athlete.positions_played && athlete.positions_played.length > 0 && (
                  <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                    {athlete.positions_played[0]}
                  </Badge>
                )}
              </HStack>
              <VStack align={{ base: "center", md: "start" }} spacing={2}>
                {athlete.school && (
                  <HStack>
                    <GraduationCap size={20} />
                    <Text>{athlete.school}</Text>
                  </HStack>
                )}
                {athlete.location && (
                  <HStack>
                    <MapPin size={20} />
                    <Text>{athlete.location}</Text>
                  </HStack>
                )}
                {athlete.graduation_year && (
                  <HStack>
                    <Calendar size={20} />
                    <Text>Class of {athlete.graduation_year}</Text>
                  </HStack>
                )}
              </VStack>
              <Button
                leftIcon={<Mail size={20} />}
                colorScheme="whiteAlpha"
                variant="solid"
                size="lg"
                onClick={onOpen}
                mt={4}
              >
                Contact Me
              </Button>
            </VStack>
          </Flex>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxW="6xl" py={12}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6} mb={12}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Grade</StatLabel>
                <StatNumber>{athlete.grade || "N/A"}</StatNumber>
                <StatHelpText>Current Grade</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>GPA</StatLabel>
                <StatNumber>{athlete.gpa || "N/A"}</StatNumber>
                <StatHelpText>Academic Performance</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Graduation</StatLabel>
                <StatNumber>{athlete.graduation_year || "N/A"}</StatNumber>
                <StatHelpText>Expected Year</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Sport</StatLabel>
                <StatNumber fontSize="lg">{athlete.sport}</StatNumber>
                <StatHelpText>Primary Sport</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Content Sections */}
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={8}>
          {/* Game Film */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Video size={24} />
                  <Heading size="lg">Game Film</Heading>
                </HStack>
                <Divider />
                <Center w="full" h="200px" bg="gray.100" borderRadius="md">
                  <VStack>
                    <Video size={48} color="gray.400" />
                    <Text color="gray.500">No videos uploaded yet</Text>
                  </VStack>
                </Center>
              </VStack>
            </CardBody>
          </Card>

          {/* Awards */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Trophy size={24} />
                  <Heading size="lg">Awards & Achievements</Heading>
                </HStack>
                <Divider />
                <Center w="full" h="200px" bg="gray.100" borderRadius="md">
                  <VStack>
                    <Trophy size={48} color="gray.400" />
                    <Text color="gray.500">No awards added yet</Text>
                  </VStack>
                </Center>
              </VStack>
            </CardBody>
          </Card>

          {/* Photos */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Camera size={24} />
                  <Heading size="lg">Photos</Heading>
                </HStack>
                <Divider />
                <Center w="full" h="200px" bg="gray.100" borderRadius="md">
                  <VStack>
                    <Camera size={48} color="gray.400" />
                    <Text color="gray.500">No photos uploaded yet</Text>
                  </VStack>
                </Center>
              </VStack>
            </CardBody>
          </Card>

          {/* Schedule */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Calendar size={24} />
                  <Heading size="lg">Schedule</Heading>
                </HStack>
                <Divider />
                <Center w="full" h="200px" bg="gray.100" borderRadius="md">
                  <VStack>
                    <Calendar size={48} color="gray.400" />
                    <Text color="gray.500">No events scheduled</Text>
                  </VStack>
                </Center>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Coach Reviews */}
        <Card mt={8}>
          <CardBody>
            <VStack align="start" spacing={4}>
              <HStack>
                <Star size={24} />
                <Heading size="lg">Coach Reviews</Heading>
              </HStack>
              <Divider />
              <Center w="full" h="200px" bg="gray.100" borderRadius="md">
                <VStack>
                  <Star size={48} color="gray.400" />
                  <Text color="gray.500">No reviews yet</Text>
                </VStack>
              </Center>
            </VStack>
          </CardBody>
        </Card>
      </Container>

      {/* Contact Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleContactSubmit}>
            <ModalHeader>Contact {athlete.athlete_name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Organization</FormLabel>
                  <Input
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="Your organization (optional)"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your interest in recruiting this athlete..."
                    rows={4}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="blue" isLoading={isSubmitting} loadingText="Sending...">
                Send Message
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  )
}
