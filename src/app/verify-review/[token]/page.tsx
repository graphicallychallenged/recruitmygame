"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  HStack,
  Avatar,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react"
import { Star, Shield } from "lucide-react"
import type { ReviewVerificationRequest } from "@/types/reviews"

export default function VerifyReviewPage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const token = params.token as string

  const [request, setRequest] = useState<ReviewVerificationRequest | null>(null)
  const [athleteInfo, setAthleteInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/reviews/verify/${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to load verification request")
        }

        setRequest(data.request)
        setAthleteInfo(data.athlete)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchRequest()
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reviewText.trim() || !rating) {
      setError("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/reviews/verify/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review_text: reviewText,
          rating: Number.parseInt(rating),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review")
      }

      toast({
        title: "Review submitted successfully!",
        description: "Thank you for providing your verified review.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      // Redirect to success page
      router.push("/verify-review/success")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (currentRating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={20}
        fill={i < currentRating ? "#F6E05E" : "none"}
        color={i < currentRating ? "#F6E05E" : "#E2E8F0"}
      />
    ))
  }

  if (loading) {
    return (
      <Container maxW="2xl" py={8}>
        <VStack spacing={4} align="center">
          <Spinner size="xl" />
          <Text>Loading verification request...</Text>
        </VStack>
      </Container>
    )
  }

  if (error && !request) {
    return (
      <Container maxW="2xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW="2xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <HStack justify="center" spacing={2} mb={2}>
            <Shield color="#22C55E" size={24} />
            <Heading size="lg">Write Verified Review</Heading>
          </HStack>
          <Text color="gray.600">You've been asked to provide a verified review for an athlete</Text>
        </Box>

        {request && athleteInfo && (
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Athlete Info */}
                <Box>
                  <Heading size="sm" mb={3}>
                    Review Request For:
                  </Heading>
                  <HStack spacing={4}>
                    <Avatar
                      name={`${athleteInfo.first_name} ${athleteInfo.last_name}`}
                      src={athleteInfo.profile_picture_url}
                      size="lg"
                    />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">
                        {athleteInfo.first_name} {athleteInfo.last_name}
                      </Text>
                      <Text color="gray.600">
                        {athleteInfo.sport} • {athleteInfo.school}
                      </Text>
                      <Badge colorScheme="blue">{athleteInfo.athlete_name}</Badge>
                    </VStack>
                  </HStack>
                </Box>

                {/* Request Details */}
                <Box>
                  <Heading size="sm" mb={3}>
                    Request Details:
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.600">
                        Your Name:
                      </Text>
                      <Text fontWeight="semibold">{request.reviewer_name}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">
                        Your Email:
                      </Text>
                      <Text fontWeight="semibold">{request.reviewer_email}</Text>
                    </Box>
                    {request.reviewer_title && (
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Your Title:
                        </Text>
                        <Text fontWeight="semibold">{request.reviewer_title}</Text>
                      </Box>
                    )}
                    {request.reviewer_organization && (
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Your Organization:
                        </Text>
                        <Text fontWeight="semibold">{request.reviewer_organization}</Text>
                      </Box>
                    )}
                  </SimpleGrid>
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <Text fontWeight="medium" mb={2}>
                      Message from {athleteInfo.first_name}:
                    </Text>
                    <Text fontStyle="italic">"{request.request_message}"</Text>
                  </Box>
                </Box>

                {/* Review Form */}
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="sm">Write Your Review:</Heading>

                    <FormControl isRequired>
                      <FormLabel>Your Review</FormLabel>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Please provide your honest review of this athlete's performance, character, work ethic, and any other relevant details..."
                        rows={8}
                        resize="vertical"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Overall Rating</FormLabel>
                      <Select value={rating} onChange={(e) => setRating(e.target.value)} placeholder="Select a rating">
                        <option value="5">⭐⭐⭐⭐⭐ Excellent (5 stars)</option>
                        <option value="4">⭐⭐⭐⭐ Very Good (4 stars)</option>
                        <option value="3">⭐⭐⭐ Good (3 stars)</option>
                        <option value="2">⭐⭐ Fair (2 stars)</option>
                        <option value="1">⭐ Poor (1 star)</option>
                      </Select>
                      {rating && (
                        <HStack mt={2}>
                          <Text fontSize="sm" color="gray.600">
                            Preview:
                          </Text>
                          <HStack spacing={1}>{renderStars(Number.parseInt(rating))}</HStack>
                        </HStack>
                      )}
                    </FormControl>

                    {error && (
                      <Alert status="error">
                        <AlertIcon />
                        {error}
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      colorScheme="green"
                      size="lg"
                      isLoading={submitting}
                      loadingText="Submitting Review..."
                      leftIcon={<Shield size={16} />}
                    >
                      Submit Verified Review
                    </Button>

                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      By submitting this review, you confirm that it is based on your direct experience with this
                      athlete and is truthful and accurate.
                    </Text>
                  </VStack>
                </form>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  )
}
