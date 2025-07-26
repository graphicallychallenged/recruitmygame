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
  SimpleGrid,
  Divider,
  Button,
} from "@chakra-ui/react"
import { Trophy, User, GraduationCap, Heart, Star, Quote, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface Review {
  id: string
  reviewer_name: string
  reviewer_title: string
  reviewer_organization: string
  review_text: string
  review_type: string
  rating: number
  relationship_duration: string
}

interface ReviewsDisplayProps {
  reviews: Review[]
  primaryColor?: string
  showStats?: boolean
  compact?: boolean
  maxReviews?: number
}

const REVIEW_TYPES = [
  { value: "performance", label: "Athletic Performance", icon: Trophy, color: "blue" },
  { value: "character", label: "Character & Leadership", icon: Heart, color: "red" },
  { value: "academic", label: "Academic Performance", icon: GraduationCap, color: "green" },
  { value: "coaching", label: "Coachability", icon: User, color: "purple" },
  { value: "general", label: "General Recommendation", icon: Star, color: "yellow" },
]

export function ReviewsDisplay({
  reviews,
  primaryColor = "#1a202c",
  showStats = true,
  compact = false,
  maxReviews = 6,
}: ReviewsDisplayProps) {
  const [showAll, setShowAll] = useState(false)

  const getReviewTypeInfo = (type: string) => {
    return REVIEW_TYPES.find((t) => t.value === type) || REVIEW_TYPES[4]
  }

  const renderStars = (rating: number, size = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={size} fill={i < rating ? "#F6E05E" : "none"} color={i < rating ? "#F6E05E" : "#E2E8F0"} />
    ))
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return "0.0"
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Box textAlign="center" py={8} color="gray.500">
        <MessageSquare size={32} style={{ margin: "0 auto 16px" }} />
        <Text>No coach reviews available</Text>
      </Box>
    )
  }

  const displayReviews = showAll ? reviews : reviews.slice(0, maxReviews)
  const reviewStats = REVIEW_TYPES.map((type) => ({
    ...type,
    count: reviews.filter((review) => review.review_type === type.value).length,
  })).filter((stat) => stat.count > 0)

  if (compact) {
    return (
      <VStack spacing={4} align="stretch">
        {displayReviews.slice(0, 3).map((review) => {
          const typeInfo = getReviewTypeInfo(review.review_type)
          return (
            <Box
              key={review.id}
              p={4}
              bg="gray.50"
              borderRadius="md"
              borderLeft="4px"
              borderLeftColor={`${typeInfo.color}.500`}
            >
              <VStack align="start" spacing={2}>
                <HStack spacing={2}>
                  <Text fontWeight="semibold" fontSize="sm">
                    {review.reviewer_name}
                  </Text>
                  <Badge colorScheme={typeInfo.color} variant="subtle" fontSize="xs">
                    {typeInfo.label}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  {review.reviewer_title}
                  {review.reviewer_organization && `, ${review.reviewer_organization}`}
                </Text>
                <HStack spacing={1}>{renderStars(review.rating, 12)}</HStack>
                <Text fontSize="sm" fontStyle="italic" noOfLines={3}>
                  "{review.review_text}"
                </Text>
              </VStack>
            </Box>
          )
        })}
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
      {showStats && reviewStats.length > 0 && (
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <HStack justify="center" spacing={4}>
                <VStack spacing={1} textAlign="center">
                  <Text fontSize="3xl" fontWeight="bold" color={primaryColor}>
                    {getAverageRating()}
                  </Text>
                  <HStack spacing={1}>{renderStars(Math.round(Number.parseFloat(getAverageRating())), 20)}</HStack>
                  <Text fontSize="sm" color="gray.600">
                    Average from {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </Text>
                </VStack>
              </HStack>

              <SimpleGrid columns={{ base: 2, md: reviewStats.length > 3 ? 4 : reviewStats.length }} spacing={4}>
                {reviewStats.map((stat) => (
                  <VStack key={stat.value} spacing={2} textAlign="center">
                    <Box color={`${stat.color}.500`}>
                      <stat.icon size={20} />
                    </Box>
                    <Text fontSize="lg" fontWeight="bold">
                      {stat.count}
                    </Text>
                    <Text fontSize="xs" color="gray.600" textAlign="center">
                      {stat.label}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Reviews List */}
      <VStack spacing={6} align="stretch">
        {displayReviews.map((review) => {
          const typeInfo = getReviewTypeInfo(review.review_type)
          return (
            <Card key={review.id} shadow="md">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Review Header */}
                  <HStack spacing={4} align="start">
                    <Avatar name={review.reviewer_name} size="lg" bg={`${typeInfo.color}.500`} color="white" />
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack spacing={2} wrap="wrap">
                        <Heading size="md">{review.reviewer_name}</Heading>
                        <Badge colorScheme={typeInfo.color} variant="subtle">
                          {typeInfo.label}
                        </Badge>
                      </HStack>
                      <Text color="gray.600" fontSize="sm" fontWeight="medium">
                        {review.reviewer_title}
                      </Text>
                      {review.reviewer_organization && (
                        <Text color="gray.500" fontSize="sm">
                          {review.reviewer_organization}
                        </Text>
                      )}
                      <HStack spacing={1}>
                        {renderStars(review.rating)}
                        <Text fontSize="sm" color="gray.600" ml={2}>
                          ({review.rating}/5)
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>

                  <Divider />

                  {/* Review Content */}
                  <Box position="relative">
                    <Quote size={24} color="gray.300" style={{ position: "absolute", top: -8, left: -8, zIndex: 0 }} />
                    <Text
                      fontSize="md"
                      lineHeight="tall"
                      fontStyle="italic"
                      color="gray.700"
                      position="relative"
                      zIndex={1}
                      pl={4}
                    >
                      "{review.review_text}"
                    </Text>
                  </Box>

                  {/* Review Footer */}
                  <HStack justify="space-between" wrap="wrap" fontSize="sm" color="gray.500">
                    <HStack spacing={4}>
                      <HStack spacing={1}>
                        <typeInfo.icon size={16} />
                        <Text>{typeInfo.label}</Text>
                      </HStack>
                      {review.relationship_duration && <Text>Relationship: {review.relationship_duration}</Text>}
                    </HStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )
        })}
      </VStack>

      {reviews.length > maxReviews && (
        <Box textAlign="center">
          <Button variant="outline" onClick={() => setShowAll(!showAll)}>
            {showAll ? (
              <HStack spacing={2}>
                <ChevronUp size={16} />
                <Text>Show Less</Text>
              </HStack>
            ) : (
              <HStack spacing={2}>
                <ChevronDown size={16} />
                <Text>Show All {reviews.length} Reviews</Text>
              </HStack>
            )}
          </Button>
        </Box>
      )}
    </VStack>
  )
}
