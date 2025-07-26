"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Avatar,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react"
import { Trophy, User, GraduationCap, Heart, Star, Plus, Edit, Trash2, Quote, MessageSquare } from "lucide-react"
import { useRef } from "react"

interface Review {
  id: string
  reviewer_name: string
  reviewer_title: string
  reviewer_organization: string
  reviewer_email?: string
  review_text: string
  review_type: "performance" | "character" | "academic" | "coaching" | "general"
  rating: number
  relationship_duration?: string
  created_at: string
  updated_at: string
}

const REVIEW_TYPES = [
  { value: "performance", label: "Athletic Performance", icon: Trophy, color: "blue" },
  { value: "character", label: "Character & Leadership", icon: Heart, color: "red" },
  { value: "academic", label: "Academic Performance", icon: GraduationCap, color: "green" },
  { value: "coaching", label: "Coachability", icon: User, color: "purple" },
  { value: "general", label: "General Recommendation", icon: Star, color: "yellow" },
] as const

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [deletingReview, setDeletingReview] = useState<Review | null>(null)
  const [formData, setFormData] = useState<{
    reviewer_name: string
    reviewer_title: string
    reviewer_organization: string
    reviewer_email: string
    review_text: string
    review_type: "performance" | "character" | "academic" | "coaching" | "general"
    rating: number
    relationship_duration: string
  }>({
    reviewer_name: "",
    reviewer_title: "",
    reviewer_organization: "",
    reviewer_email: "",
    review_text: "",
    review_type: "general",
    rating: 5,
    relationship_duration: "",
  })

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      // Get athlete ID
      const { data: athleteData } = await supabase.from("athletes").select("id").eq("user_id", session.user.id).single()

      if (athleteData) {
        const { data, error } = await supabase
          .from("athlete_reviews")
          .select("*")
          .eq("athlete_id", athleteData.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setReviews(data || [])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast({
        title: "Error",
        description: "Failed to load reviews",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      // Get athlete ID
      const { data: athleteData } = await supabase.from("athletes").select("id").eq("user_id", session.user.id).single()

      if (!athleteData) return

      const reviewData = {
        ...formData,
        athlete_id: athleteData.id,
      }

      if (editingReview) {
        const { error } = await supabase.from("athlete_reviews").update(reviewData).eq("id", editingReview.id)
        if (error) throw error
        toast({
          title: "Success",
          description: "Review updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        const { error } = await supabase.from("athlete_reviews").insert([reviewData])
        if (error) throw error
        toast({
          title: "Success",
          description: "Review added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }

      onClose()
      resetForm()
      fetchReviews()
    } catch (error) {
      console.error("Error saving review:", error)
      toast({
        title: "Error",
        description: "Failed to save review",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingReview) return

    try {
      const { error } = await supabase.from("athlete_reviews").delete().eq("id", deletingReview.id)
      if (error) throw error

      toast({
        title: "Success",
        description: "Review deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      onDeleteClose()
      setDeletingReview(null)
      fetchReviews()
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const resetForm = () => {
    setFormData({
      reviewer_name: "",
      reviewer_title: "",
      reviewer_organization: "",
      reviewer_email: "",
      review_text: "",
      review_type: "general",
      rating: 5,
      relationship_duration: "",
    })
    setEditingReview(null)
  }

  const openEditModal = (review: Review) => {
    setEditingReview(review)
    setFormData({
      reviewer_name: review.reviewer_name,
      reviewer_title: review.reviewer_title,
      reviewer_organization: review.reviewer_organization,
      reviewer_email: review.reviewer_email || "",
      review_text: review.review_text,
      review_type: review.review_type,
      rating: review.rating,
      relationship_duration: review.relationship_duration || "",
    })
    onOpen()
  }

  const openAddModal = () => {
    resetForm()
    onOpen()
  }

  const getReviewTypeInfo = (type: string) => {
    return REVIEW_TYPES.find((t) => t.value === type) || REVIEW_TYPES[4]
  }

  const renderStars = (rating: number, size = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={size} fill={i < rating ? "#F6E05E" : "none"} color={i < rating ? "#F6E05E" : "#E2E8F0"} />
    ))
  }

  const getStats = () => {
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0
    const typeStats = REVIEW_TYPES.map((type) => ({
      ...type,
      count: reviews.filter((r) => r.review_type === type.value).length,
    }))

    return { totalReviews, averageRating, typeStats }
  }

  const stats = getStats()

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg" mb={1}>
            Coach Reviews
          </Heading>
          <Text color="gray.600">Manage testimonials and recommendations from your coaches</Text>
        </Box>
        <Button colorScheme="blue" leftIcon={<Plus size={16} />} onClick={openAddModal}>
          Add Review
        </Button>
      </Flex>

      {/* Stats Cards */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
        <Card>
          <CardBody textAlign="center">
            <Stat>
              <StatNumber fontSize="3xl">{stats.totalReviews}</StatNumber>
              <StatLabel>Total Reviews</StatLabel>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody textAlign="center">
            <Stat>
              <HStack justify="center" mb={2}>
                {renderStars(Math.round(stats.averageRating), 20)}
              </HStack>
              <StatNumber fontSize="3xl">{stats.averageRating.toFixed(1)}</StatNumber>
              <StatLabel>Average Rating</StatLabel>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Heading size="sm" mb={3}>
              By Category
            </Heading>
            <VStack spacing={2} align="stretch">
              {stats.typeStats.map((type) => (
                <HStack key={type.value} justify="space-between">
                  <HStack spacing={2}>
                    <Box color={`${type.color}.500`}>
                      <type.icon size={14} />
                    </Box>
                    <Text fontSize="sm">{type.label}</Text>
                  </HStack>
                  <Badge colorScheme={type.color} variant="subtle">
                    {type.count}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardBody>
            <VStack spacing={4} py={8} textAlign="center">
              <Box color="gray.400">
                <MessageSquare size={48} />
              </Box>
              <Box>
                <Heading size="md" mb={2}>
                  No reviews yet
                </Heading>
                <Text color="gray.600" mb={4}>
                  Start building credibility by adding testimonials from your coaches
                </Text>
                <Button colorScheme="blue" leftIcon={<Plus size={16} />} onClick={openAddModal}>
                  Add Your First Review
                </Button>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
          {reviews.map((review) => {
            const typeInfo = getReviewTypeInfo(review.review_type)
            return (
              <Card key={review.id}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    {/* Header */}
                    <Flex justify="space-between" align="start">
                      <HStack spacing={3}>
                        <Avatar name={review.reviewer_name} size="md" bg={`${typeInfo.color}.500`} color="white" />
                        <Box>
                          <HStack spacing={2} mb={1}>
                            <Text fontWeight="bold">{review.reviewer_name}</Text>
                            <Badge colorScheme={typeInfo.color} variant="subtle">
                              <typeInfo.icon size={10} style={{ marginRight: 4 }} />
                              {typeInfo.label}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {review.reviewer_title}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {review.reviewer_organization}
                          </Text>
                        </Box>
                      </HStack>
                      <HStack>
                        <IconButton
                          aria-label="Edit review"
                          icon={<Edit size={16} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(review)}
                        />
                        <IconButton
                          aria-label="Delete review"
                          icon={<Trash2 size={16} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => {
                            setDeletingReview(review)
                            onDeleteOpen()
                          }}
                        />
                      </HStack>
                    </Flex>

                    {/* Rating */}
                    <HStack spacing={1}>{renderStars(review.rating)}</HStack>

                    {/* Review Text */}
                    <Box position="relative" p={4} bg="gray.50" borderRadius="md">
                      <Quote size={16} color="gray.300" style={{ position: "absolute", top: 8, left: 8 }} />
                      <Text fontStyle="italic" pl={6} color="gray.700">
                        "{review.review_text}"
                      </Text>
                    </Box>

                    {/* Footer */}
                    <HStack justify="space-between" fontSize="xs" color="gray.500">
                      <Text>Added {new Date(review.created_at).toLocaleDateString()}</Text>
                      {review.relationship_duration && <Text>Coached for {review.relationship_duration}</Text>}
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )
          })}
        </Grid>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingReview ? "Edit Review" : "Add New Review"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Coach Name</FormLabel>
                  <Input
                    value={formData.reviewer_name}
                    onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                    placeholder="John Smith"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Title/Position</FormLabel>
                  <Input
                    value={formData.reviewer_title}
                    onChange={(e) => setFormData({ ...formData, reviewer_title: e.target.value })}
                    placeholder="Head Coach"
                  />
                </FormControl>
              </Grid>

              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Organization/School</FormLabel>
                  <Input
                    value={formData.reviewer_organization}
                    onChange={(e) => setFormData({ ...formData, reviewer_organization: e.target.value })}
                    placeholder="Springfield High School"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email (Optional)</FormLabel>
                  <Input
                    type="email"
                    value={formData.reviewer_email}
                    onChange={(e) => setFormData({ ...formData, reviewer_email: e.target.value })}
                    placeholder="coach@school.edu"
                  />
                </FormControl>
              </Grid>

              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Review Type</FormLabel>
                  <Select
                    value={formData.review_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        review_type: e.target.value as
                          | "performance"
                          | "character"
                          | "academic"
                          | "coaching"
                          | "general",
                      })
                    }
                  >
                    {REVIEW_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Rating</FormLabel>
                  <Select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number.parseInt(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Star{rating !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Coaching Duration (Optional)</FormLabel>
                <Input
                  value={formData.relationship_duration}
                  onChange={(e) => setFormData({ ...formData, relationship_duration: e.target.value })}
                  placeholder="2 years"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Review/Testimonial</FormLabel>
                <Textarea
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  placeholder="Write the coach's testimonial or recommendation..."
                  rows={6}
                />
              </FormControl>

              <Box p={4} bg="blue.50" borderRadius="md" w="full">
                <Text fontSize="sm" color="blue.700" fontWeight="medium" mb={2}>
                  📝 Important Guidelines
                </Text>
                <VStack align="start" spacing={1} fontSize="xs" color="blue.600">
                  <Text>• Always get permission before adding a coach's review</Text>
                  <Text>• Use exact quotes when possible for authenticity</Text>
                  <Text>• Include contact information if the coach approves</Text>
                  <Text>• Consider reaching out to coaches directly for testimonials</Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isDisabled={!formData.reviewer_name || !formData.reviewer_title || !formData.review_text}
            >
              {editingReview ? "Update Review" : "Add Review"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Review
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the review from {deletingReview?.reviewer_name}? This action cannot be
              undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  )
}
