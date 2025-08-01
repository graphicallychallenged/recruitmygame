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
  Spinner,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure as useAlertDisclosure,
} from "@chakra-ui/react"
import { Shield, Star, Clock, CheckCircle, Plus, Crown, Mail, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import type { VerifiedReview, ReviewVerificationRequest } from "@/types/reviews"

export default function VerifiedReviewsPage() {
  const [athlete, setAthlete] = useState<any>(null)
  const [verifiedReviews, setVerifiedReviews] = useState<VerifiedReview[]>([])
  const [pendingRequests, setPendingRequests] = useState<ReviewVerificationRequest[]>([])
  const [stats, setStats] = useState({ totalVerified: 0, pendingVerifications: 0, averageRating: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [requestToDelete, setRequestToDelete] = useState<ReviewVerificationRequest | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useAlertDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    reviewer_name: "",
    reviewer_email: "",
    reviewer_title: "",
    reviewer_organization: "",
    request_message: "",
  })

  useEffect(() => {
    fetchAthlete()
  }, [])

  useEffect(() => {
    if (athlete) {
      fetchVerifiedReviews()
      fetchPendingRequests()
    }
  }, [athlete])

  const fetchAthlete = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: athleteData, error } = await supabase.from("athletes").select("*").eq("user_id", user.id).single()

      if (error) {
        if (error.code === "PGRST116") {
          router.push("/dashboard/create-profile")
          return
        }
        throw error
      }

      setAthlete(athleteData)
    } catch (error: any) {
      console.error("Error fetching athlete:", error)
      toast({
        title: "Error loading profile",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchVerifiedReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/verified?athleteId=${athlete.id}`)
      const data = await response.json()

      if (response.ok) {
        setVerifiedReviews(data.reviews)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching verified reviews:", error)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("review_verification_requests")
        .select("*")
        .eq("athlete_id", athlete.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (error) throw error
      setPendingRequests(data || [])
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  const handleSubmitRequest = async () => {
    if (athlete?.subscription_tier !== "pro" && athlete?.subscription_tier !== "premium") {
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
          title: "Review request sent!",
          description: "Your coach will receive an email to complete their review",
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
        title: "Error sending review request",
        description: error instanceof Error ? error.message : "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRequest = (request: ReviewVerificationRequest) => {
    setRequestToDelete(request)
    onAlertOpen()
  }

  const confirmDeleteRequest = async () => {
    if (!requestToDelete) return

    setDeleting(requestToDelete.id)
    try {
      const response = await fetch(`/api/reviews/cancel-request?requestId=${requestToDelete.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Review request cancelled",
          description: "The coach has been notified that the request was cancelled",
          status: "success",
          duration: 5000,
          isClosable: true,
        })

        fetchPendingRequests()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error cancelling request",
        description: error instanceof Error ? error.message : "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setDeleting(null)
      setRequestToDelete(null)
      onAlertClose()
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

  const isPro = athlete?.subscription_tier === "pro" || athlete?.subscription_tier === "premium"

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" />
      </Flex>
    )
  }

  if (!athlete) {
    return null
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" wrap="wrap">
          <HStack spacing={2}>
            <Icon as={Shield} color="purple.500" />
            <Heading size="lg">Verified Coach Reviews</Heading>
            <Badge colorScheme="purple" variant="subtle">
              Pro  
            </Badge>
          </HStack>

          {isPro && (
            <Button leftIcon={<Plus size={16} />} colorScheme="green" onClick={onOpen}>
              Request Review from Coach
            </Button>
          )}
        </HStack>

        {/* How it works */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2} flex={1}>
            <Text fontWeight="semibold">How Verified Reviews Work</Text>
            <Text fontSize="sm">
              1. Send a request to your coach/mentor with your personal message
              <br />
              2. They receive an email with a secure link to write their review
              <br />
              3. Their completed review appears here with a "Verified" badge
            </Text>
          </VStack>
        </Alert>

        {/* Pro Upgrade Notice */}
        {!isPro && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={2} flex={1}>
              <Text fontWeight="semibold">Upgrade to Pro for Verified Reviews</Text>
              <Text fontSize="sm">
                Get verified reviews from coaches to build credibility with college recruiters. Verified reviews show
                authenticity and help you stand out from other athletes.
              </Text>
              <Button
                size="sm"
                colorScheme="teal"
                leftIcon={<Crown size={16} />}
                onClick={() => router.push("/subscription")}
              >
                Upgrade to Pro
              </Button>
            </VStack>
          </Alert>
        )}

        {/* Stats */}
        {isPro && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat>
              <StatLabel>Verified Reviews</StatLabel>
              <StatNumber>{stats.totalVerified}</StatNumber>
              <StatHelpText>Coach-verified reviews</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Average Rating</StatLabel>
              <StatNumber>{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0"}</StatNumber>
              <StatHelpText>Out of 5 stars</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Pending Requests</StatLabel>
              <StatNumber>{pendingRequests.length}</StatNumber>
              <StatHelpText>Awaiting coach response</StatHelpText>
            </Stat>
          </SimpleGrid>
        )}

        {/* Pending Requests */}
        {isPro && pendingRequests.length > 0 && (
          <Card>
            <CardBody>
              <HStack justify="space-between" align="center" mb={4}>
                <Heading size="md">Pending Review Requests</Heading>
                <Badge colorScheme="yellow" variant="subtle">
                  {pendingRequests.length} waiting
                </Badge>
              </HStack>
              <VStack spacing={4} align="stretch">
                {pendingRequests.map((request) => (
                  <Box
                    key={request.id}
                    p={4}
                    bg="yellow.50"
                    borderRadius="md"
                    borderLeft="4px"
                    borderLeftColor="yellow.400"
                  >
                    <HStack justify="space-between" align="start" mb={3}>
                      <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                          <Icon as={Mail} color="yellow.600" size={16} />
                          <Text fontWeight="semibold">{request.reviewer_name}</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {request.reviewer_title}
                          {request.reviewer_organization && ` • ${request.reviewer_organization}`}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Email sent to: {request.reviewer_email}
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            leftIcon={<X size={14} />}
                            onClick={() => handleDeleteRequest(request)}
                            isLoading={deleting === request.id}
                            loadingText="Cancelling..."
                          >
                            Cancel Request
                          </Button>
                        </HStack>
                        <HStack spacing={2}>
                          <Icon as={Clock} color="yellow.500" size={16} />
                          <Text fontSize="sm" color="gray.600">
                            Expires {new Date(request.expires_at).toLocaleDateString()}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          Sent {new Date(request.created_at).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </HStack>
                    <Box p={3} bg="white" borderRadius="md" border="1px" borderColor="gray.200">
                      <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Your message to coach:
                      </Text>
                      <Text fontSize="sm" fontStyle="italic" color="gray.700">
                        "{request.request_message}"
                      </Text>
                    </Box>
                    <Text fontSize="xs" mt={2} color="gray.500">
                      💡 Your coach will click the link in their email to write and submit their review
                    </Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Verified Reviews */}
        {isPro && (
          <Card>
            <CardBody>
              <HStack justify="space-between" align="center" mb={4}>
                <Heading size="md">Completed Verified Reviews</Heading>
                {verifiedReviews.length > 0 && (
                  <Badge colorScheme="green" variant="subtle">
                    {verifiedReviews.length} verified
                  </Badge>
                )}
              </HStack>
              {verifiedReviews.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={Shield} size={48} color="gray.400" mb={4} />
                  <Text color="gray.500" mb={2} fontSize="lg">
                    No verified reviews yet
                  </Text>
                  <Text color="gray.400" mb={6} fontSize="sm">
                    Send your first review request to a coach or mentor
                  </Text>
                  <Button colorScheme="green" onClick={onOpen} leftIcon={<Plus size={16} />}>
                    Request Your First Verified Review
                  </Button>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {verifiedReviews.map((review) => (
                    <Card key={review.id} variant="outline" borderLeft="4px" borderLeftColor="green.400">
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <HStack justify="space-between" align="start">
                            <HStack spacing={3}>
                              <Avatar
                                name={review.reviewer_name}
                                src={review.reviewer_image_url || undefined}
                                size="md"
                              />
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
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Request Verification Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Verified Review from Coach</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Your coach will receive an email with a secure link to write their review. They'll see your profile
                  and can write a detailed, verified review that will help with recruiting.
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
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Cannot be your own email address
                  </Text>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Title/Position (Optional)</FormLabel>
                  <Input
                    value={formData.reviewer_title}
                    onChange={(e) => setFormData({ ...formData, reviewer_title: e.target.value })}
                    placeholder="Head Coach, Assistant Coach, etc."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Organization (Optional)</FormLabel>
                  <Input
                    value={formData.reviewer_organization}
                    onChange={(e) => setFormData({ ...formData, reviewer_organization: e.target.value })}
                    placeholder="University of Example, High School, etc."
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Personal Message to Coach</FormLabel>
                <Textarea
                  value={formData.request_message}
                  onChange={(e) => setFormData({ ...formData, request_message: e.target.value })}
                  placeholder="Hi Coach, I hope you're doing well! I would really appreciate if you could write a verified review about my time on your team. This will help me with my college recruiting process. Thank you for everything you've taught me!"
                  rows={5}
                  resize="vertical"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  This message will be included in the email to your coach
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSubmitRequest}
              isLoading={submitting}
              loadingText="Sending Request..."
              leftIcon={<Mail size={16} />}
            >
              Send Review Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Review Request
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to cancel the review request to <strong>{requestToDelete?.reviewer_name}</strong>?
              <br />
              <br />
              They will receive an email notification that the request has been cancelled.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Keep Request
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteRequest}
                ml={3}
                isLoading={deleting === requestToDelete?.id}
                loadingText="Cancelling..."
              >
                Cancel Request
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}
