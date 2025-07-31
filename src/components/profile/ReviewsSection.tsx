"use client"

import { Box, VStack, HStack, Text, Heading, Avatar, Button, Icon, Badge, useBreakpointValue } from "@chakra-ui/react"
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

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false })

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
        size={20}
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
      <Heading size={isMobile ? "md" : "lg"} mb={4} color={textColor}>
        <HStack spacing={2}>
          <Icon as={Star} color={primaryColor} />
          <Text>Coach Reviews</Text>
        </HStack>
      </Heading>
      <VStack spacing={6} align="stretch">
        {displayedReviews.map((review) => {
          const isVerified = (review as any).is_verified || false
          return (
            <Box key={review.id} p={5} bg={isDarkTheme ? "gray.700" : "gray.50"} borderRadius="lg">
              {isMobile ? (
                // MOBILE: Complete vertical stack - NO horizontal layout at all
                <VStack align="stretch" spacing={4} w="full">
                  {/* Section 1: Avatar and reviewer info - FULL WIDTH */}
                  <VStack align="start" spacing={2} w="full">
                    <HStack spacing={3} w="full">
                      <Avatar
                        name={review.reviewer_name}
                        src={review.reviewer_image_url || undefined}
                        size="lg"
                        bg={primaryColor}
                        color="white"
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack spacing={2} align="center" flexWrap="wrap">
                          <Text fontWeight="bold" color={textColor} fontSize="xl">
                            {review.reviewer_name}
                          </Text>
                          {isVerified && (
                            <Badge colorScheme="green" variant="solid" size="sm">
                              <HStack spacing={1}>
                                <Shield size={10} />
                                <Text fontSize="xs">Verified</Text>
                              </HStack>
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                    <Text fontSize="lg" color={mutedTextColor} fontWeight="medium" w="full">
                      {review.reviewer_title}
                    </Text>
                    <Text fontSize="lg" color={mutedTextColor} w="full">
                      {review.reviewer_organization}
                    </Text>
                    {review.relationship_duration && (
                      <Text fontSize="md" color={mutedTextColor} w="full">
                        Coached for {review.relationship_duration}
                      </Text>
                    )}
                  </VStack>

                  {/* Section 2: Stars - FULL WIDTH */}
                  <Box w="full">
                    <HStack spacing={1} justify="start">
                      {renderStars(review.rating)}
                    </HStack>
                  </Box>

                  {/* Section 3: Review text - FULL WIDTH */}
                  <Box w="full">
                    <Text fontSize="lg" color={textColor} fontStyle="italic" lineHeight="1.6">
                      "{review.review_text}"
                    </Text>
                  </Box>

                  {/* Section 4: Contact button - FULL WIDTH */}
                  {review.can_contact_reviewer && (
                    <Box w="full">
                      <Button
                        size="lg"
                        bg={primaryColor}
                        color="white"
                        _hover={{ bg: secondaryColor }}
                        leftIcon={<MessageCircle size={18} />}
                        onClick={() => handleContactReviewer(review)}
                        w="full"
                        fontSize="lg"
                        py={6}
                        borderRadius="lg"
                      >
                        Contact Coach
                      </Button>
                    </Box>
                  )}

                  {/* Section 5: Verified details - FULL WIDTH */}
                  {isVerified && (
                    <Box w="full">
                      <VStack
                        align="start"
                        spacing={2}
                        p={4}
                        bg={isDarkTheme ? "green.900" : "green.50"}
                        borderRadius="lg"
                        w="full"
                      >
                        <Text fontSize="sm" color={isDarkTheme ? "green.200" : "green.600"} fontWeight="bold">
                          ✓ Verified Review Details:
                        </Text>
                        {(review as any).verified_at && (
                          <Text fontSize="sm" color={isDarkTheme ? "green.200" : "green.600"}>
                            Verified: {new Date((review as any).verified_at).toLocaleDateString()}
                          </Text>
                        )}
                        {review.relationship_duration && (
                          <Text fontSize="sm" color={isDarkTheme ? "green.200" : "green.600"}>
                            Coaching Duration: {review.relationship_duration}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              ) : (
                // DESKTOP: Side by side layout
                <VStack align="start" spacing={4}>
                  <HStack justify="space-between" w="full" align="start">
                    <HStack spacing={4}>
                      <Avatar
                        name={review.reviewer_name}
                        src={review.reviewer_image_url || undefined}
                        size="lg"
                        bg={primaryColor}
                        color="white"
                      />
                      <VStack align="start" spacing={1}>
                        <HStack spacing={2} align="center">
                          <Text fontWeight="bold" color={textColor} fontSize="xl">
                            {review.reviewer_name}
                          </Text>
                          {isVerified && (
                            <Badge colorScheme="green" variant="solid" size="sm">
                              <HStack spacing={1}>
                                <Shield size={12} />
                                <Text fontSize="xs">Verified</Text>
                              </HStack>
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="md" color={mutedTextColor}>
                          {review.reviewer_title} at {review.reviewer_organization}
                        </Text>
                        {review.relationship_duration && (
                          <Text fontSize="sm" color={mutedTextColor}>
                            Coached for {review.relationship_duration}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                    <VStack align="end" spacing={3}>
                      <HStack spacing={1}>{renderStars(review.rating)}</HStack>
                      {review.can_contact_reviewer && (
                        <Button
                          size="md"
                          bg={primaryColor}
                          color="white"
                          _hover={{ bg: secondaryColor }}
                          leftIcon={<MessageCircle size={16} />}
                          onClick={() => handleContactReviewer(review)}
                        >
                          Contact Coach About This Player
                        </Button>
                      )}
                    </VStack>
                  </HStack>

                  <Text fontSize="md" color={textColor} fontStyle="italic" lineHeight="1.6" w="full">
                    "{review.review_text}"
                  </Text>

                  {isVerified && (
                    <VStack
                      align="start"
                      spacing={2}
                      p={4}
                      bg={isDarkTheme ? "green.900" : "green.50"}
                      borderRadius="lg"
                      w="auto"
                    >
                      <Text fontSize="sm" color={isDarkTheme ? "green.200" : "green.600"} fontWeight="bold">
                        ✓ Verified Review Details:
                      </Text>
                      {(review as any).verified_at && (
                        <Text fontSize="sm" color={isDarkTheme ? "green.200" : "green.600"}>
                          Verified: {new Date((review as any).verified_at).toLocaleDateString()}
                        </Text>
                      )}
                      {review.relationship_duration && (
                        <Text fontSize="sm" color={isDarkTheme ? "green.200" : "green.600"}>
                          Coaching Duration: {review.relationship_duration}
                        </Text>
                      )}
                    </VStack>
                  )}
                </VStack>
              )}
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
