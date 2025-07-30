"use client"

import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Card,
  CardBody,
  Badge,
  Avatar,
  Icon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from "@chakra-ui/react"
import { Shield, Star, Clock, CheckCircle, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import type { VerifiedReview, ReviewVerificationRequest } from "@/types/reviews"

interface VerifiedReviewsSectionProps {
  athleteId: string
  isOwner: boolean
  isPro: boolean
}

export function VerifiedReviewsSection({ athleteId, isOwner, isPro }: VerifiedReviewsSectionProps) {
  const [verifiedReviews, setVerifiedReviews] = useState<VerifiedReview[]>([])
  const [pendingRequests, setPendingRequests] = useState<ReviewVerificationRequest[]>([])
  const [stats, setStats] = useState({ totalVerified: 0, pendingVerifications: 0, averageRating: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    reviewer_name: "",
    reviewer_email: "",
    reviewer_title: "",
    reviewer_organization: "",
    request_message: "",
  })

  useEffect(() => {
    fetchVerifiedReviews()
    if (isOwner) {
      fetchPendingRequests()
    }
  }, [athleteId, isOwner])

  const fetchVerifiedReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/verified?athleteId=${athleteId}`)
      const data = await response.json()

      if (response.ok) {
        setVerifiedReviews(data.reviews)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching verified reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("review_verification_requests")
        .select("*")
        .eq("athlete_id", athleteId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (error) throw error
      setPendingRequests(data || [])
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  const handleSubmitRequest = async () => {
    if (!isPro) {
      toast({
        title: "Pro subscription required",
        description: "Verified reviews are only available for Pro subscribers",
        status: "warning",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/reviews/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Verification request sent!",
          description: "The coach will receive an email to complete their review",
          status: "success",
          duration: 5000,
          isClosable: true,
        })

        setFormData({
          reviewer_name: "",
          reviewer_email: "",
          reviewer_title: "",
          reviewer_organization: "",
          request_message: "",
        })

        onClose()
        fetchPendingRequests()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error sending verification request",
        description: error instanceof Error ? error.message : "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number | null | undefined) => {
    const validRating = rating && rating >= 1 && rating <= 5 ? rating : 5
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < validRating ? "#F6E05E" : "none"}
        color={i < validRating ? "#F6E05E" : "#E2E8F0"}
      />
    ))
  }

  if (loading) {
    return <Text>Loading verified reviews...</Text>
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" wrap="wrap">
          <HStack spacing={2}>
            <Icon as={Shield} color="green.500" />
            <Heading size="md">Verified Coach Reviews</Heading>
            <Badge colorScheme="green" variant="subtle">
              Pro Feature
            </Badge>
          </HStack>

          {isOwner && isPro && (
            <Button leftIcon={<Plus size={16} />} colorScheme="green" onClick={onOpen} size="sm">
              Request Verified Review
            </Button>
          )}
        </HStack>

        {/* Stats */}
        {stats.totalVerified > 0 && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat>
              <StatLabel>Verified Reviews</StatLabel>
              <StatNumber>{stats.totalVerified}</StatNumber>
              <StatHelpText>Coach-verified</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Average Rating</StatLabel>
              <StatNumber>{stats.averageRating}</StatNumber>
              <StatHelpText>Out of 5 stars</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Pending Requests</StatLabel>
              <StatNumber>{stats.pendingVerifications}</StatNumber>
              <StatHelpText>Awaiting coach response</StatHelpText>
            </Stat>
          </SimpleGrid>
        )}

        {/* Pending Requests (Owner Only) */}
        {isOwner && pendingRequests.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="sm" mb={3}>
                Pending Review Requests
              </Heading>
              <VStack spacing={3} align="stretch">
                {pendingRequests.map((request) => (
                  <Box
                    key={request.id}
                    p={3}
                    bg="yellow.50"
                    borderRadius="md"
                    borderLeft="4px"
                    borderLeftColor="yellow.400"
                  >
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">{request.reviewer_name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {request.reviewer_title} • {request.reviewer_organization}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {request.reviewer_email}
                        </Text>
                      </VStack>
                      <HStack spacing={2}>
                        <Icon as={Clock} color="yellow.500" size={16} />
                        <Text fontSize="sm" color="gray.600">
                          Expires {new Date(request.expires_at).toLocaleDateString()}
                        </Text>
                      </HStack>
                    </HStack>
                    <Text fontSize="sm" mt={2} fontStyle="italic">
                      Your message: "{request.request_message}"
                    </Text>
                    <Text fontSize="xs" mt={1} color="gray.500">
                      Waiting for coach to complete their review
                    </Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Verified Reviews */}
        {verifiedReviews.length === 0 ? (
          <Card>
            <CardBody textAlign="center" py={8}>
              <Icon as={Shield} size={32} color="gray.400" mb={4} />
              <Text color="gray.500" mb={4}>
                No verified reviews yet
              </Text>
              {isOwner && isPro && (
                <Button colorScheme="green" onClick={onOpen}>
                  Request Your First Verified Review
                </Button>
              )}
              {!isPro && (
                <Text fontSize="sm" color="gray.400">
                  Upgrade to Pro to request verified reviews
                </Text>
              )}
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {verifiedReviews.map((review) => (
              <Card key={review.id} borderLeft="4px" borderLeftColor="green.400">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between" align="start">
                      <HStack spacing={3}>
                        <Avatar name={review.reviewer_name} src={review.reviewer_image_url || undefined} size="md" />
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Text fontWeight="semibold">{review.reviewer_name}</Text>
                            <Badge colorScheme="green" display="flex" alignItems="center" gap={1}>
                              <CheckCircle size={12} />
                              Verified
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {review.reviewer_title}
                            {review.reviewer_organization && ` • ${review.reviewer_organization}`}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Verified on {new Date(review.verified_at!).toLocaleDateString()}
                          </Text>
                        </VStack>
                      </HStack>
                      <VStack align="end" spacing={1}>
                        <HStack spacing={1}>{renderStars(review.rating)}</HStack>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(review.review_date).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </HStack>

                    <Text fontSize="md" lineHeight="tall">
                      "{review.review_text}"
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Request Verification Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Verified Review</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Send a request to your coach/mentor to write a verified review. They will receive an email with a link
                  to complete their review, which will then show as "verified" on your profile.
                </Text>
              </Alert>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Coach/Mentor Name</FormLabel>
                  <Input
                    value={formData.reviewer_name}
                    onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                    placeholder="John Smith"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Coach/Mentor Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.reviewer_email}
                    onChange={(e) => setFormData({ ...formData, reviewer_email: e.target.value })}
                    placeholder="coach@school.edu"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Title/Position</FormLabel>
                  <Input
                    value={formData.reviewer_title}
                    onChange={(e) => setFormData({ ...formData, reviewer_title: e.target.value })}
                    placeholder="Head Coach"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Organization</FormLabel>
                  <Input
                    value={formData.reviewer_organization}
                    onChange={(e) => setFormData({ ...formData, reviewer_organization: e.target.value })}
                    placeholder="University of Example"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Personal Message</FormLabel>
                <Textarea
                  value={formData.request_message}
                  onChange={(e) => setFormData({ ...formData, request_message: e.target.value })}
                  placeholder="Hi Coach, I would appreciate if you could write a verified review about my performance on your team. This will help with my recruiting process..."
                  rows={4}
                  resize="vertical"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleSubmitRequest} isLoading={submitting} loadingText="Sending...">
              Send Review Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
