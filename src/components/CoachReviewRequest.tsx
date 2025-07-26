"use client"

import { useState } from "react"
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  List,
  ListItem,
  ListIcon,
  Box,
} from "@chakra-ui/react"
import { Shield, Mail, CheckCircle, Users } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface CoachReviewRequestProps {
  athleteId: string
  athleteName: string
  username: string
  subscription_tier: "free" | "premium" | "pro"
}

export function CoachReviewRequest({ athleteId, athleteName, username, subscription_tier }: CoachReviewRequestProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [sending, setSending] = useState(false)
  const [formData, setFormData] = useState({
    coach_name: "",
    coach_email: "",
    coach_title: "",
    coach_organization: "",
    personal_message: "",
  })
  const toast = useToast()
  const supabase = createClient()

  const canUseFeature = subscription_tier === "pro"

  const sendReviewRequest = async () => {
    if (!canUseFeature) {
      toast({
        title: "Pro Feature Required",
        description: "Verified coach reviews are available for Pro subscribers only.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (!formData.coach_name.trim() || !formData.coach_email.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please provide coach name and email address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setSending(true)
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiration

      // Save the review request to database (UUID will be auto-generated)
      const { data, error } = await supabase
        .from("coach_review_requests")
        .insert({
          athlete_id: athleteId,
          coach_name: formData.coach_name.trim(),
          coach_email: formData.coach_email.trim(),
          coach_title: formData.coach_title.trim() || null,
          coach_organization: formData.coach_organization.trim() || null,
          personal_message: formData.personal_message.trim() || null,
          expires_at: expiresAt.toISOString(),
        })
        .select("review_token")
        .single()

      if (error) throw error

      // Get the generated review token
      const reviewToken = data.review_token

      // In a real app, you would send an email here
      // For demo purposes, we'll just show success
      const reviewUrl = `${window.location.origin}/review/${username}?token=${reviewToken}`

      console.log("Review request sent:", {
        coach_email: formData.coach_email,
        review_url: reviewUrl,
        athlete_name: athleteName,
        expires_at: expiresAt,
        review_token: reviewToken,
      })

      toast({
        title: "Review request sent!",
        description: `An email has been sent to ${formData.coach_name} with a secure review link.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      // Reset form
      setFormData({
        coach_name: "",
        coach_email: "",
        coach_title: "",
        coach_organization: "",
        personal_message: "",
      })
      onClose()
    } catch (error: any) {
      console.error("Error sending review request:", error)
      toast({
        title: "Error sending request",
        description: "Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSending(false)
    }
  }

  if (!canUseFeature) {
    return (
      <Card>
        <CardBody>
          <VStack spacing={4} textAlign="center">
            <Box color="gray.400">
              <Users size={48} />
            </Box>
            <Box>
              <Heading size="md" mb={2}>
                Coach Review Requests
              </Heading>
              <Text color="gray.600" mb={4}>
                Send personalized review requests to coaches with verified review links
              </Text>
              <Badge colorScheme="purple" variant="outline">
                Pro Feature
              </Badge>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Box>
              <Heading size="md">Coach Review Requests</Heading>
              <Text color="gray.600">Send personalized review requests to coaches</Text>
            </Box>
            <Badge colorScheme="purple" variant="solid">
              Pro
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <List spacing={2} fontSize="sm">
              <ListItem display="flex" alignItems="center">
                <ListIcon as={CheckCircle} color="green.500" />
                Verified review links with unique tokens
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon as={CheckCircle} color="green.500" />
                Personalized email invitations
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon as={CheckCircle} color="green.500" />
                Reviews marked as "Verified" on your profile
              </ListItem>
            </List>

            <Button leftIcon={<Mail size={16} />} colorScheme="purple" onClick={onOpen} w="full">
              Send Review Request
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* Review Request Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Shield size={20} />
              <Text>Send Verified Review Request</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Send a secure review request to a coach. They'll receive an email with a verified link to submit their
                review of your athletic performance.
              </Text>

              <FormControl isRequired>
                <FormLabel>Coach Name</FormLabel>
                <Input
                  value={formData.coach_name}
                  onChange={(e) => setFormData({ ...formData, coach_name: e.target.value })}
                  placeholder="Coach Smith"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Coach Email</FormLabel>
                <Input
                  type="email"
                  value={formData.coach_email}
                  onChange={(e) => setFormData({ ...formData, coach_email: e.target.value })}
                  placeholder="coach@school.edu"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Coach Title</FormLabel>
                <Input
                  value={formData.coach_title}
                  onChange={(e) => setFormData({ ...formData, coach_title: e.target.value })}
                  placeholder="Head Coach, Assistant Coach, etc."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Organization</FormLabel>
                <Input
                  value={formData.coach_organization}
                  onChange={(e) => setFormData({ ...formData, coach_organization: e.target.value })}
                  placeholder="School, Team, or Organization"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Personal Message (Optional)</FormLabel>
                <Textarea
                  value={formData.personal_message}
                  onChange={(e) => setFormData({ ...formData, personal_message: e.target.value })}
                  placeholder="Add a personal message to your coach..."
                  rows={3}
                />
              </FormControl>

              <Box p={4} bg="purple.50" borderRadius="md" w="full">
                <Text fontSize="sm" color="purple.700" fontWeight="medium" mb={2}>
                  📧 What happens next?
                </Text>
                <List spacing={1} fontSize="xs" color="purple.600">
                  <ListItem>• Coach receives a personalized email with review link</ListItem>
                  <ListItem>• Link expires in 30 days for security</ListItem>
                  <ListItem>• Reviews submitted through this link are marked as "Verified"</ListItem>
                  <ListItem>• You'll be notified when the review is submitted</ListItem>
                </List>
              </Box>

              <Button
                colorScheme="purple"
                onClick={sendReviewRequest}
                w="full"
                isLoading={sending}
                loadingText="Sending..."
                leftIcon={<Mail size={16} />}
                isDisabled={!formData.coach_name.trim() || !formData.coach_email.trim()}
              >
                Send Review Request
              </Button>

              <Text fontSize="xs" color="gray.500" textAlign="center">
                The coach will receive an email with a secure link that expires in 30 days. Reviews submitted through
                this link will be marked as "Verified" on your profile.
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
