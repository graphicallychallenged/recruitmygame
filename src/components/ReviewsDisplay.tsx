"use client"

import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Card,
  CardBody,
  Avatar,
  Button,
  useDisclosure,
  Divider,
} from "@chakra-ui/react"
import { Star, MessageCircle, Calendar, MapPin } from "lucide-react"
import { ReviewerContactModal } from "./ReviewerContactModal"
import { useState } from "react"

interface Review {
  id: string
  reviewer_name: string
  reviewer_title: string
  reviewer_organization: string
  rating: number
  review_text: string
  review_date: string
  location?: string
  reviewer_email?: string
  reviewer_phone?: string
  reviewer_image_url?: string
  can_contact_reviewer?: boolean
  is_verified?: boolean
}

interface ReviewsDisplayProps {
  reviews: Review[]
  athleteName?: string
  primaryColor?: string
  showStats?: boolean
  compact?: boolean
}

export function ReviewsDisplay({
  reviews,
  athleteName = "this athlete",
  primaryColor = "#1a202c",
  showStats = true,
  compact = false,
}: ReviewsDisplayProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  if (!reviews || reviews.length === 0) {
    return (
      <Box textAlign="center" py={8} color="gray.500">
        <Star size={32} style={{ margin: "0 auto 16px" }} />
        <Text>No reviews yet</Text>
      </Box>
    )
  }

  const verifiedReviews = reviews.filter((r) => r.is_verified && r.rating)
  const averageRating =
    verifiedReviews.length > 0
      ? verifiedReviews.reduce((sum, review) => sum + review.rating, 0) / verifiedReviews.length
      : 0

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: verifiedReviews.filter((review) => review.rating === rating).length,
  }))

  const handleContactReviewer = (review: Review) => {
    setSelectedReview(review)
    onOpen()
  }

  const renderStars = (rating: number, size = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        fill={i < rating ? primaryColor : "none"}
        color={i < rating ? primaryColor : "#e2e8f0"}
      />
    ))
  }

  if (compact) {
    return (
      <VStack spacing={3} align="stretch">
        {reviews.slice(0, 3).map((review) => (
          <Card key={review.id} size="sm">
            <CardBody>
              <HStack spacing={3} align="start">
                <Avatar size="sm" src={review.reviewer_image_url} name={review.reviewer_name} />
                <VStack align="start" spacing={1} flex={1}>
                  <HStack spacing={2}>
                    <Text fontWeight="semibold" fontSize="sm">
                      {review.reviewer_name}
                    </Text>
                    {review.is_verified && review.rating && (
                      <HStack spacing={0}>{renderStars(review.rating, 12)}</HStack>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="gray.600">
                    {review.reviewer_title} • {review.reviewer_organization}
                  </Text>
                  <Text fontSize="sm" noOfLines={2}>
                    {review.review_text}
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        ))}
        {reviews.length > 3 && (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            +{reviews.length - 3} more reviews
          </Text>
        )}
      </VStack>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Review Statistics */}
      {showStats && verifiedReviews.length > 0 && (
        <Card>
          <CardBody>
            <Heading size="sm" mb={4} color={primaryColor}>
              Verified Review Summary
            </Heading>
            <HStack spacing={8} wrap="wrap">
              <VStack spacing={1} textAlign="center">
                <Text fontSize="3xl" fontWeight="bold" color={primaryColor}>
                  {averageRating.toFixed(1)}
                </Text>
                <HStack spacing={0}>{renderStars(Math.round(averageRating), 20)}</HStack>
                <Text fontSize="sm" color="gray.600">
                  {verifiedReviews.length} verified review{verifiedReviews.length !== 1 ? "s" : ""}
                </Text>
              </VStack>
              <VStack spacing={2} flex={1} align="stretch">
                {ratingCounts.map(({ rating, count }) => (
                  <HStack key={rating} spacing={2}>
                    <Text fontSize="sm" minW="20px">
                      {rating}
                    </Text>
                    <Star size={12} fill={primaryColor} color={primaryColor} />
                    <Box flex={1} bg="gray.200" h="6px" borderRadius="full">
                      <Box
                        bg={primaryColor}
                        h="100%"
                        borderRadius="full"
                        w={`${verifiedReviews.length > 0 ? (count / verifiedReviews.length) * 100 : 0}%`}
                      />
                    </Box>
                    <Text fontSize="sm" minW="20px" color="gray.600">
                      {count}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      )}

      {/* Individual Reviews */}
      <VStack spacing={4} align="stretch">
        {reviews.map((review) => (
          <Card key={review.id} borderLeft="4px" borderLeftColor={primaryColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Reviewer Header */}
                <HStack spacing={4} align="start">
                  <Avatar size="lg" src={review.reviewer_image_url} name={review.reviewer_name} />
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={2} wrap="wrap">
                      <Heading size="sm">{review.reviewer_name}</Heading>
                      <Badge colorScheme="teal" variant="subtle">
                        {review.reviewer_title}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      {review.reviewer_organization}
                    </Text>
                    <HStack spacing={4} fontSize="xs" color="gray.500">
                      <HStack spacing={1}>
                        <Calendar size={12} />
                        <Text>
                          {new Date(review.review_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Text>
                      </HStack>
                      {review.location && (
                        <HStack spacing={1}>
                          <MapPin size={12} />
                          <Text>{review.location}</Text>
                        </HStack>
                      )}
                    </HStack>
                  </VStack>
                  <VStack spacing={2} align="end">
                    {review.is_verified && review.rating && <HStack spacing={0}>{renderStars(review.rating)}</HStack>}
                    {review.can_contact_reviewer && (
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="teal"
                        leftIcon={<MessageCircle size={14} />}
                        onClick={() => handleContactReviewer(review)}
                      >
                        Contact About Player
                      </Button>
                    )}
                  </VStack>
                </HStack>

                <Divider />

                {/* Review Content */}
                <Text fontSize="md" lineHeight="tall">
                  {review.review_text}
                </Text>
                {/* Add this after the review text and before the closing VStack */}
                {review.is_verified && (
                  <VStack align="start" spacing={1} mt={2} p={2} bg="green.50" borderRadius="md" w="full">
                    <Text fontSize="xs" color="green.600" fontWeight="medium">
                      ✓ Verified Review Details:
                    </Text>
                    {review.location && (
                      <Text fontSize="xs" color="green.600">
                        Location: {review.location}
                      </Text>
                    )}
                    <Text fontSize="xs" color="green.600">
                      Verified: {new Date(review.review_date).toLocaleDateString()}
                    </Text>
                    {review.rating && (
                      <HStack spacing={1}>
                        <Text fontSize="xs" color="green.600">
                          Rating:
                        </Text>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < review.rating ? "#22c35e" : "none"}
                            color={i < review.rating ? "#22c35e" : "#e2e8f0"}
                          />
                        ))}
                      </HStack>
                    )}
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>

      {/* Contact Modal */}
      {selectedReview && (
        <ReviewerContactModal
          isOpen={isOpen}
          onClose={onClose}
          reviewId={selectedReview.id}
          reviewerName={selectedReview.reviewer_name}
          athleteName={athleteName}
          primaryColor={primaryColor}
        />
      )}
    </VStack>
  )
}
