"use client"

import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Avatar,
  Button,
  Icon,
  Badge,
  useBreakpointValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react"
import { Star, MessageCircle, Shield, Trophy, Users, Heart, Brain, Target, BookOpen } from "lucide-react"
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
  const verifiedReviews = reviews.filter((review) => (review as any).is_verified)

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

  const renderDetailedRatings = (review: AthleteReview) => {
    const ratings = [
      { label: "Athleticism", value: review.athleticism, icon: Trophy, color: "blue.500" },
      { label: "Character", value: review.character, icon: Heart, color: "red.500" },
      { label: "Work Ethic", value: review.work_ethic, icon: Target, color: "green.500" },
      { label: "Leadership", value: review.leadership, icon: Users, color: "purple.500" },
      { label: "Coachability", value: review.coachability, icon: Brain, color: "orange.500" },
      { label: "Teamwork", value: review.teamwork, icon: Users, color: "teal.500" },
    ]

    const validRatings = ratings.filter((rating) => rating.value && rating.value > 0)

    if (validRatings.length === 0) return null

    return (
      <Box w="full" mt={4}>
        <Text fontSize="sm" fontWeight="bold" color={textColor} mb={3}>
          Detailed Coach Ratings
        </Text>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          {validRatings.map((rating) => (
            <Box key={rating.label} textAlign="center">
              <VStack spacing={1}>
                <Icon as={rating.icon} color={rating.color} size={16} />
                <Text fontSize="xs" color={mutedTextColor} fontWeight="medium">
                  {rating.label}
                </Text>
                <HStack spacing={0}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={i < (rating.value || 0) ? rating.color : "none"}
                      color={i < (rating.value || 0) ? rating.color : "#E2E8F0"}
                      style={{ color: i < (rating.value || 0) ? rating.color : "#E2E8F0" }}
                    />
                  ))}
                </HStack>
                <Text fontSize="xs" color={textColor} fontWeight="bold">
                  {rating.value}/5
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    )
  }

  if (reviews.length === 0) {
    return null
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header with Stats */}
        <Box>
          <HStack justify="space-between" align="start" mb={4}>
            <Heading size={isMobile ? "sm" : "md"} color={textColor}>
              <HStack spacing={2}>
                <Icon as={Star} color={primaryColor} />
                <Text>Coach Reviews</Text>
              </HStack>
            </Heading>

            {verifiedReviews.length > 0 && (
              <VStack align="end" spacing={1}>
                <HStack spacing={2}>
                  <Badge colorScheme="green" variant="solid" size="sm">
                    <HStack spacing={1}>
                      <Shield size={10} />
                      <Text fontSize="xs">{verifiedReviews.length} Verified</Text>
                    </HStack>
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={mutedTextColor}>
                  {reviews.length} total reviews
                </Text>
              </VStack>
            )}
          </HStack>

          {/* Overall Rating Summary for Verified Reviews */}
          {verifiedReviews.length > 0 && (
            <Box p={4} bg={isDarkTheme ? "green.900" : "green.50"} borderRadius="lg" mb={4}>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold" color={isDarkTheme ? "green.200" : "green.700"}>
                    Verified Coach Rating Average
                  </Text>
                  <HStack spacing={1}>
                    {renderStars(
                      verifiedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / verifiedReviews.length,
                    )}
                    <Text fontSize="sm" color={isDarkTheme ? "green.200" : "green.700"} ml={2}>
                      {(
                        verifiedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / verifiedReviews.length
                      ).toFixed(1)}
                      /5.0
                    </Text>
                  </HStack>
                </VStack>
                <Stat textAlign="right" size="sm">
                  <StatNumber fontSize="lg" color={isDarkTheme ? "green.200" : "green.700"}>
                    {verifiedReviews.length}
                  </StatNumber>
                  <StatLabel fontSize="xs" color={isDarkTheme ? "green.300" : "green.600"}>
                    Verified Reviews
                  </StatLabel>
                </Stat>
              </HStack>
            </Box>
          )}
        </Box>

        {/* Reviews List */}
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
                      {review.relationship && (
                        <Text fontSize="md" color={mutedTextColor} w="full">
                          {review.relationship} 
                        </Text>
                      )}
                      {review.relationship_duration && (
                        <Text fontSize="md" color={mutedTextColor} w="full">
                          for {review.relationship_duration}
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

                    {/* Section 4: Detailed ratings for verified reviews - FULL WIDTH */}
                    {isVerified && renderDetailedRatings(review)}

                    {/* Section 5: Contact button - FULL WIDTH */}
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

                    {/* Section 6: Verified details - FULL WIDTH */}
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
                              Known For: {review.relationship_duration}
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
                              Known for {review.relationship_duration}
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

                    {review.would_recommend && (
                    <Text fontSize="md" color={textColor} fontStyle="italic" lineHeight="1.6" w="full">
                      <strong>Recommendation: </strong> {review.would_recommend}"
                    </Text>)}
                      

                    {/* Detailed ratings for verified reviews */}
                    {isVerified && renderDetailedRatings(review)}

                    {isVerified && (
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
                            Known For: {review.relationship_duration}
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
      </VStack>
    </Box>
  )
}
