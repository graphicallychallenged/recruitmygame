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
  Progress,
  Flex,
  Card,
  CardBody,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react"
import { Star, MessageCircle, Shield, Trophy, Users, Heart, Brain, Target, Calendar, CheckCircle } from "lucide-react"
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

  // Color values
  const verifiedBg = useColorModeValue("green.50", "green.900")
  const verifiedBorder = useColorModeValue("green.200", "green.700")
  const verifiedText = useColorModeValue("green.700", "green.200")
  const cardShadow = useColorModeValue("lg", "dark-lg")

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
        size={16}
        fill={i < validRating ? "#F6E05E" : "none"}
        color={i < validRating ? "#F6E05E" : "#E2E8F0"}
      />
    ))
  }

  const getReviewerType = (review: AthleteReview) => {
    const title = review.reviewer_title?.toLowerCase() || ""
    if (title.includes("coach") || title.includes("trainer") || title.includes("instructor")) {
      return "Coach"
    }
    if (title.includes("teacher") || title.includes("professor") || title.includes("educator")) {
      return "Teacher"
    }
    if (title.includes("scout") || title.includes("recruiter")) {
      return "Scout"
    }
    if (title.includes("director") || title.includes("manager") || title.includes("coordinator")) {
      return "Director"
    }
    return "Reviewer"
  }

  const formatRecommendation = (recommendation: string | null | undefined) => {
    if (!recommendation) return null

    const recommendations: { [key: string]: string } = {
      highly_recommend: "Highly Recommend",
      recommend: "Recommend",
      somewhat_recommend: "Somewhat Recommend",
      neutral: "Neutral",
      do_not_recommend: "Do Not Recommend",
    }

    return recommendations[recommendation] || recommendation
  }

  const getProgressColorScheme = (color: string) => {
    if (color.includes("#3182CE")) return "blue"
    if (color.includes("#E53E3E")) return "red"
    if (color.includes("#38A169")) return "green"
    if (color.includes("#805AD5")) return "purple"
    if (color.includes("#DD6B20")) return "orange"
    if (color.includes("#319795")) return "teal"
    return "gray"
  }

  const renderDetailedRatings = (review: AthleteReview) => {
    const ratings = [
      { label: "Athleticism", value: review.athleticism, icon: Trophy, color: "#3182CE" },
      { label: "Character", value: review.character, icon: Heart, color: "#E53E3E" },
      { label: "Work Ethic", value: review.work_ethic, icon: Target, color: "#38A169" },
      { label: "Leadership", value: review.leadership, icon: Users, color: "#805AD5" },
      { label: "Coachability", value: review.coachability, icon: Brain, color: "#DD6B20" },
      { label: "Teamwork", value: review.teamwork, icon: Users, color: "#319795" },
    ]

    const validRatings = ratings.filter((rating) => rating.value && rating.value > 0)

    if (validRatings.length === 0) return null

    return (
      <Box w="full" mt={6}>
        <Text fontSize="sm" fontWeight="bold" color={textColor} mb={4}>
          Detailed Ratings (Out of 10)
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {validRatings.map((rating) => (
            <Box key={rating.label} p={3} bg={isDarkTheme ? "gray.700" : "gray.50"} borderRadius="lg">
              <HStack justify="space-between" mb={2}>
                <HStack spacing={2}>
                  <Icon as={rating.icon} color={rating.color} size={16} />
                  <Text fontSize="sm" fontWeight="medium" color={textColor}>
                    {rating.label}
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color={rating.color}>
                  {rating.value}/10
                </Text>
              </HStack>
              <Progress
                value={(rating.value || 0) * 10}
                colorScheme={getProgressColorScheme(rating.color)}
                size="sm"
                borderRadius="full"
                sx={{
                  "& > div": {
                    backgroundColor: secondaryColor,
                  },
                }}
              />
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
      <VStack spacing={8} align="stretch">
        {/* Header with Stats */}
        <Box>
          <HStack justify="space-between" align="start" mb={6}>
            <VStack align="start" spacing={2}>
              <HStack spacing={3}>
                <Icon as={MessageCircle} color={primaryColor} size={24} />
                <Heading size={isMobile ? "md" : "lg"} color={textColor}>
                  Reviews
                </Heading>
              </HStack>
              <Text fontSize="sm" color={mutedTextColor}>
                {reviews.length} total reviews • {verifiedReviews.length} verified
              </Text>
            </VStack>

            {verifiedReviews.length > 0 && (
              <VStack align="end" spacing={2}>
                <HStack spacing={2}>
                  <Badge colorScheme="green" variant="solid" size="lg" px={3} py={1}>
                    <HStack spacing={2}>
                      <Shield size={14} />
                      <Text fontWeight="bold">{verifiedReviews.length} Verified</Text>
                    </HStack>
                  </Badge>
                </HStack>
                <HStack spacing={1}>
                  {renderStars(
                    verifiedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / verifiedReviews.length,
                  )}
                  <Text fontSize="sm" color={mutedTextColor} ml={2}>
                    {(
                      verifiedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / verifiedReviews.length
                    ).toFixed(1)}
                    /5.0
                  </Text>
                </HStack>
              </VStack>
            )}
          </HStack>
        </Box>

        {/* Reviews List */}
        <VStack spacing={6} align="stretch">
          {displayedReviews.map((review) => {
            const isVerified = (review as any).is_verified || false
            const reviewerType = getReviewerType(review)
            const formattedRecommendation = formatRecommendation((review as any).would_recommend)

            return (
              <Card
                key={review.id}
                shadow={cardShadow}
                borderLeft={isVerified ? "4px" : "none"}
                borderLeftColor={isVerified ? "green.400" : "transparent"}
                bg={cardBgColor}
                overflow="hidden"
              >
                <CardBody p={6}>
                  <VStack align="stretch" spacing={5}>
                    {/* Header Section */}
                    <Flex
                      direction={{ base: "column", md: "row" }}
                      justify="space-between"
                      align={{ base: "start", md: "center" }}
                      gap={4}
                    >
                      <HStack spacing={4} flex={1}>
                        <Avatar
                          name={review.reviewer_name}
                          src={review.reviewer_image_url || undefined}
                          size="lg"
                          bg={primaryColor}
                          color="white"
                        />
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack spacing={3} align="center" flexWrap="wrap">
                            <Text fontWeight="bold" color={textColor} fontSize="xl">
                              {review.reviewer_name}
                            </Text>
                            {isVerified && (
                              <Badge colorScheme="green" variant="solid" size="sm">
                                <HStack spacing={1}>
                                  <CheckCircle size={12} />
                                  <Text fontSize="xs">Verified Review</Text>
                                </HStack>
                              </Badge>
                            )}
                          </HStack>

                          {review.reviewer_title && review.reviewer_organization && (
                            <Text fontSize="md" color={mutedTextColor} fontWeight="medium">
                              {review.reviewer_title} at {review.reviewer_organization}
                            </Text>
                          )}

                          <HStack spacing={4} fontSize="sm" color={mutedTextColor}>
                            {review.relationship_duration && (
                              <HStack spacing={1}>
                                <Calendar size={14} />
                                <Text>
                                  {reviewerType} for {review.relationship_duration}
                                </Text>
                              </HStack>
                            )}
                            {(review as any).verified_at && (
                              <HStack spacing={1}>
                                <CheckCircle size={14} />
                                <Text>Verified {new Date((review as any).verified_at).toLocaleDateString()}</Text>
                              </HStack>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>

                      <VStack align={{ base: "start", md: "end" }} spacing={3}>
                        {isVerified && review.rating && (
                          <HStack spacing={1}>
                            {renderStars(review.rating)}
                            <Text fontSize="sm" color={textColor} ml={2} fontWeight="bold">
                              {review.rating}/5
                            </Text>
                          </HStack>
                        )}
                        {review.can_contact_reviewer && (
                          <Button
                            size="sm"
                            bg={primaryColor}
                            color="white"
                            _hover={{ bg: secondaryColor }}
                            leftIcon={<MessageCircle size={16} />}
                            onClick={() => handleContactReviewer(review)}
                            borderRadius="full"
                          >
                            Contact {reviewerType}
                          </Button>
                        )}
                      </VStack>
                    </Flex>

                    <Divider />

                    {/* Review Content */}
                    <Box>
                      <Text fontSize="md" color={textColor} lineHeight="1.7" fontStyle="italic">
                        "{review.review_text}"
                      </Text>

                      {formattedRecommendation && (
                        <Box mt={4} p={3} bg={verifiedBg} borderRadius="lg" border="1px" borderColor={verifiedBorder}>
                          <Text fontSize="sm" color={verifiedText} fontWeight="medium">
                            <strong>{reviewerType}'s Recommendation:</strong> {formattedRecommendation}
                          </Text>
                        </Box>
                      )}
                    </Box>

                    {/* Detailed ratings for verified reviews */}
                    {isVerified && renderDetailedRatings(review)}

                    {/* Verified Details Footer */}
                    {isVerified && (
                      <Box p={4} bg={verifiedBg} borderRadius="lg" border="1px" borderColor={verifiedBorder}>
                        <HStack spacing={4} justify="space-between" align="center">
                          <HStack spacing={2}>
                            <Shield size={16} color={verifiedText} />
                            <Text fontSize="sm" color={verifiedText} fontWeight="bold">
                              Verified Review
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color={verifiedText}>
                            This review was verified through our secure verification system
                          </Text>
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )
          })}
        </VStack>

        {reviews.length > maxDisplay && (
          <Box textAlign="center" pt={4}>
            <Text fontSize="sm" color={mutedTextColor}>
              +{reviews.length - maxDisplay} more reviews available
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
