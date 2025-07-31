"use client"

import { Box, VStack, HStack, Text, Heading, Badge, Card, CardBody, CardHeader, Avatar, Button } from "@chakra-ui/react"
import { Trophy, User, GraduationCap, Heart, Star, MessageSquare, Plus, Quote } from "lucide-react"
import Link from "next/link"

interface ReviewsSummaryProps {
  reviews: {
    id: string
    reviewer_name: string
    reviewer_title: string
    reviewer_organization: string
    review_text: string
    review_type: string
    rating: number
    created_at?: string
    is_verified: boolean
  }[]
  maxDisplay?: number
}

const REVIEW_TYPES = [
  { value: "performance", label: "Performance", icon: Trophy, color: "blue" },
  { value: "character", label: "Character", icon: Heart, color: "red" },
  { value: "academic", label: "Academic", icon: GraduationCap, color: "green" },
  { value: "coaching", label: "Coachability", icon: User, color: "purple" },
  { value: "general", label: "General", icon: Star, color: "yellow" },
] as const

export function ReviewsSummary({ reviews, maxDisplay = 2 }: ReviewsSummaryProps) {
  const getReviewTypeInfo = (type: string) => {
    return REVIEW_TYPES.find((t) => t.value === type) || REVIEW_TYPES[4]
  }

  const renderStars = (rating: number, size = 12) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        fill={i < rating ? "currentColor" : "none"}
        color={i < rating ? "#F6E05E" : "#E2E8F0"}
        style={{ color: i < rating ? "#F6E05E" : "#E2E8F0" }}
      />
    ))
  }

  const getAverageRating = () => {
    const verifiedReviews = reviews.filter((review) => review.is_verified)
    if (verifiedReviews.length === 0) return "0.0"
    const sum = verifiedReviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / verifiedReviews.length).toFixed(1)
  }

  const recentReviews = reviews
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
    .slice(0, maxDisplay)

  return (
    <Card>
      <CardHeader pb={2}>
        <HStack justify="space-between" align="center">
          <Heading size="sm">Coach Reviews</Heading>
          <Link href="/dashboard/reviews">
            <Button size="xs" variant="ghost" rightIcon={<Plus size={12} />}>
              Manage
            </Button>
          </Link>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        {reviews.length === 0 ? (
          <VStack spacing={3} py={4} textAlign="center">
            <Box color="gray.400">
              <MessageSquare size={32} />
            </Box>
            <Text fontSize="sm" color="gray.500">
              No coach reviews yet
            </Text>
            <Link href="/dashboard/reviews">
              <Button size="sm" colorScheme="blue" leftIcon={<Plus size={14} />}>
                Add Review
              </Button>
            </Link>
          </VStack>
        ) : (
          <VStack spacing={4} align="stretch">
            {/* Quick Stats */}
            <HStack justify="center" spacing={4} p={3} bg="gray.50" borderRadius="md">
              <VStack spacing={1} textAlign="center">
                <Text fontSize="xl" fontWeight="bold">
                  {reviews.length}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Reviews
                </Text>
              </VStack>
              <VStack spacing={1} textAlign="center">
                <HStack spacing={1}>{renderStars(Math.round(Number.parseFloat(getAverageRating())), 14)}</HStack>
                <Text fontSize="xs" color="gray.600">
                  {getAverageRating()} avg
                </Text>
              </VStack>
              <VStack spacing={1} textAlign="center">
                <Text fontSize="xl" fontWeight="bold">
                  {reviews.filter((review) => review.is_verified).length}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Verified
                </Text>
              </VStack>
            </HStack>

            {/* Recent Reviews */}
            <VStack spacing={3} align="stretch">
              {recentReviews.map((review) => {
                const typeInfo = getReviewTypeInfo(review.review_type)
                return (
                  <Box key={review.id} p={3} bg="gray.50" borderRadius="md" position="relative">
                    <Quote size={16} color="gray.300" style={{ position: "absolute", top: 8, left: 8, zIndex: 0 }} />
                    <VStack align="start" spacing={2} position="relative" zIndex={1} pl={4}>
                      <HStack spacing={2} align="center">
                        <Avatar name={review.reviewer_name} size="sm" bg={`${typeInfo.color}.500`} color="white" />
                        <VStack align="start" spacing={0} flex={1}>
                          <HStack spacing={2}>
                            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                              {review.reviewer_name}
                            </Text>
                            <Badge colorScheme={typeInfo.color} variant="subtle" fontSize="xs">
                              {typeInfo.label}
                            </Badge>
                            {review.is_verified && (
                              <Badge colorScheme="green" variant="solid" fontSize="xs">
                                Verified
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                            {review.reviewer_title}
                          </Text>
                        </VStack>
                        {review.is_verified && <HStack spacing={1}>{renderStars(review.rating, 10)}</HStack>}
                      </HStack>
                      <Text fontSize="xs" fontStyle="italic" color="gray.700" noOfLines={2} pl={2}>
                        "{review.review_text}"
                      </Text>
                    </VStack>
                  </Box>
                )
              })}
            </VStack>

            {reviews.length > maxDisplay && (
              <Link href="/dashboard/reviews">
                <Button size="sm" variant="outline" width="full">
                  View All {reviews.length} Reviews
                </Button>
              </Link>
            )}
          </VStack>
        )}
      </CardBody>
    </Card>
  )
}
