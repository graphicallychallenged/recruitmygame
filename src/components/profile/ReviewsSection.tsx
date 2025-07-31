"use client"

import { Box, VStack, HStack, Text, Heading, Avatar, Button, Icon, Badge } from "@chakra-ui/react"
import { Star, MessageCircle, Shield } from "lucide-react"
import type { AthleteReview } from "@/types/database"
import { useState } from "react"

interface ReviewsSectionProps {
  reviews: AthleteReview[]
  maxDisplay?: number
  primaryColor: string
  secondaryColor: string
  textColor: string
  mutedTextColor: string
  cardBgColor: string
  borderColor: string
  isDarkTheme: boolean
  onContactReviewer?: (review: AthleteReview) => void
}

export function ReviewsSection({
  reviews,
  maxDisplay = 3,
  primaryColor,
  secondaryColor,
  textColor,
  mutedTextColor,
  cardBgColor,
  borderColor,
  isDarkTheme,
  onContactReviewer,
}: ReviewsSectionProps) {
  const [selectedReview, setSelectedReview] = useState<AthleteReview | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  const handleContactReviewer = (review: AthleteReview) => {
    setSelectedReview(review)
    setIsContactModalOpen(true)
  }

  // Sort reviews to show verified ones first
  const sortedReviews = [...reviews].sort((a, b) => {
    const aVerified = (a as any).is_verified || false
    const bVerified = (b as any).is_verified || false
    if (aVerified && !bVerified) return -1
    if (!aVerified && bVerified) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const displayedReviews = sortedReviews.slice(0, maxDisplay)

  const renderStars = (rating: number | null | undefined) => {
    const validRating = rating && rating >= 1 && rating <= 5 ? rating : 5
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < validRating ? "currentColor" : "none"}
        color={i < validRating ? "#F6E05E" : "#E2E8F0"}
        style={{ color: i < validRating ? "#F6E05E" : "#E2E8F0" }}
      />
    ))
  }

  if (reviews.length === 0) {
    return null
  }

  return (
    <Box>
      <Heading size="lg" mb={4} color={textColor}>
        <HStack spacing={2}>
          <Icon as={Star} color={primaryColor} />
          <Text>Coach Reviews</Text>
        </HStack>
      </Heading>
      <VStack spacing={4} align="stretch">
        {displayedReviews.map((review) => {
          const isVerified = (review as any).is_verified || false
          return (
            <Box key={review.id} p={4} bg={isDarkTheme ? "gray.700" : "gray.50"} borderRadius="md">
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="full" align="start">
                  <HStack spacing={3}>
                    <Avatar
                      name={review.reviewer_name}
                      src={review.reviewer_image_url || undefined}
                      size="md"
                      bg={primaryColor}
                      color="white"
                    />
                    <VStack align="start" spacing={0}>
                      <HStack spacing={2} align="center">
                        <Text fontWeight="semibold" color={textColor}>
                          {review.reviewer_name}
                        </Text>
                        {isVerified && (
                          <Badge
                            colorScheme="green"
                            variant="solid"
                            size="sm"
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <Shield size={12} />
                            Verified
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="sm" color={mutedTextColor}>
                        {review.reviewer_title} at {review.reviewer_organization}
                      </Text>
                      {review.relationship_duration && (
                        <Text fontSize="xs" color={mutedTextColor}>
                          Coached for {review.relationship_duration}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  <VStack align="end" spacing={2}>
                    <HStack spacing={1}>{renderStars(review.rating)}</HStack>
                    {review.can_contact_reviewer && (
                      <Button
                        size="sm"
                        bg={primaryColor}
                        color="white"
                        _hover={{ bg: secondaryColor }}
                        leftIcon={<MessageCircle size={14} />}
                        onClick={() => handleContactReviewer(review)}
                      >
                        Contact Coach About This Player
                      </Button>
                    )}
                  </VStack>
                </HStack>
                <Text fontSize="sm" color={textColor} fontStyle="italic">
                  "{review.review_text}"
                </Text>
                {isVerified && (
                  <VStack align="start" spacing={1} mt={2} p={2} bg="green.50" borderRadius="md" w="full">
                    <Text fontSize="xs" color="green.600" fontWeight="medium">
                      ✓ Verified Review Details:
                    </Text>
                    {(review as any).verified_at && (
                      <Text fontSize="xs" color="green.600">
                        Verified: {new Date((review as any).verified_at).toLocaleDateString()}
                      </Text>
                    )}
                    {review.location && (
                      <Text fontSize="xs" color="green.600">
                        Location: {review.location}
                      </Text>
                    )}
                    {review.relationship_duration && (
                      <Text fontSize="xs" color="green.600">
                        Coaching Duration: {review.relationship_duration}
                      </Text>
                    )}
                  </VStack>
                )}
              </VStack>
            </Box>
          )
        })}
      </VStack>
      {reviews.length > maxDisplay && (
        <Text fontSize="sm" color={mutedTextColor} textAlign="center" mt={4}>
          +{reviews.length - maxDisplay} more reviews
        </Text>
      )}
    </Box>
  )
}
