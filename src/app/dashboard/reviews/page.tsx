"use client"

import type React from "react"

import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Avatar,
  Switch,
  Alert,
  AlertIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react"
import { Plus, Star, MessageCircle, Trash2, Edit, Upload } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { ReviewsDisplay } from "@/components/ReviewsDisplay"
import { FileUpload } from "@/components/FileUpload"

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
}

interface ContactMessage {
  id: string
  sender_name: string
  sender_email: string
  sender_phone?: string
  message: string
  created_at: string
  review: {
    reviewer_name: string
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    reviewer_name: "",
    reviewer_title: "",
    reviewer_organization: "",
    reviewer_email: "",
    reviewer_phone: "",
    rating: 5,
    review_text: "",
    review_date: new Date().toISOString().split("T")[0],
    location: "",
    reviewer_image_url: "",
    can_contact_reviewer: false,
  })

  useEffect(() => {
    fetchReviews()
    fetchContactMessages()
  }, [])

  const fetchReviews = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: athlete } = await supabase.from("athletes").select("id").eq("user_id", user.id).single()

      if (!athlete) return

      const { data, error } = await supabase
        .from("athlete_reviews")
        .select("*")
        .eq("athlete_id", athlete.id)
        .order("review_date", { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast({
        title: "Error loading reviews",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchContactMessages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: athlete } = await supabase.from("athletes").select("id").eq("user_id", user.id).single()

      if (!athlete) return

      const { data, error } = await supabase
        .from("reviewer_contact_messages")
        .select(`
          *,
          review:athlete_reviews(reviewer_name)
        `)
        .in(
          "review_id",
          reviews.map((r) => r.id),
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      setContactMessages(data || [])
    } catch (error) {
      console.error("Error fetching contact messages:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: athlete } = await supabase.from("athletes").select("id").eq("user_id", user.id).single()

      if (!athlete) throw new Error("Athlete profile not found")

      const reviewData = {
        ...formData,
        athlete_id: athlete.id,
        reviewer_phone: formData.reviewer_phone || null,
        location: formData.location || null,
        reviewer_email: formData.reviewer_email || null,
        reviewer_image_url: formData.reviewer_image_url || null,
      }

      if (editingReview) {
        const { error } = await supabase.from("athlete_reviews").update(reviewData).eq("id", editingReview.id)

        if (error) throw error

        toast({
          title: "Review updated successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        const { error } = await supabase.from("athlete_reviews").insert(reviewData)

        if (error) throw error

        toast({
          title: "Review added successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }

      resetForm()
      onClose()
      fetchReviews()
    } catch (error) {
      console.error("Error saving review:", error)
      toast({
        title: "Error saving review",
        description: error instanceof Error ? error.message : "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      const { error } = await supabase.from("athlete_reviews").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Review deleted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      fetchReviews()
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error deleting review",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setFormData({
      reviewer_name: review.reviewer_name,
      reviewer_title: review.reviewer_title,
      reviewer_organization: review.reviewer_organization,
      reviewer_email: review.reviewer_email || "",
      reviewer_phone: review.reviewer_phone || "",
      rating: review.rating,
      review_text: review.review_text,
      review_date: review.review_date,
      location: review.location || "",
      reviewer_image_url: review.reviewer_image_url || "",
      can_contact_reviewer: review.can_contact_reviewer || false,
    })
    onOpen()
  }

  const resetForm = () => {
    setFormData({
      reviewer_name: "",
      reviewer_title: "",
      reviewer_organization: "",
      reviewer_email: "",
      reviewer_phone: "",
      rating: 5,
      review_text: "",
      review_date: new Date().toISOString().split("T")[0],
      location: "",
      reviewer_image_url: "",
      can_contact_reviewer: false,
    })
    setEditingReview(null)
  }

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `reviewer-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("athlete-files").upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("athlete-files").getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, reviewer_image_url: data.publicUrl }))

      toast({
        title: "Image uploaded successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error uploading image",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const contactableReviews = reviews.filter((r) => r.can_contact_reviewer).length

  if (loading) {
    return (
      <Box p={6}>
        <Text>Loading reviews...</Text>
      </Box>
    )
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" wrap="wrap">
          <Heading size="lg">Coach Reviews</Heading>
          <Button
            leftIcon={<Plus size={20} />}
            colorScheme="blue"
            onClick={() => {
              resetForm()
              onOpen()
            }}
          >
            Add Review
          </Button>
        </HStack>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Stat>
            <StatLabel>Total Reviews</StatLabel>
            <StatNumber>{reviews.length}</StatNumber>
            <StatHelpText>Coach evaluations</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Average Rating</StatLabel>
            <StatNumber>{averageRating.toFixed(1)}</StatNumber>
            <StatHelpText>Out of 5 stars</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Contactable Reviews</StatLabel>
            <StatNumber>{contactableReviews}</StatNumber>
            <StatHelpText>Allow public contact</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Contact Messages</StatLabel>
            <StatNumber>{contactMessages.length}</StatNumber>
            <StatHelpText>From recruiters</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Contact Messages */}
        {contactMessages.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Recent Contact Messages
              </Heading>
              <VStack spacing={3} align="stretch">
                {contactMessages.slice(0, 5).map((message) => (
                  <Box key={message.id} p={3} bg="gray.50" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="semibold">{message.sender_name}</Text>
                      <Badge colorScheme="blue">About {message.review.reviewer_name}'s review</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      {message.sender_email} • {message.sender_phone}
                    </Text>
                    <Text fontSize="sm" noOfLines={2}>
                      {message.message}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      {new Date(message.created_at).toLocaleDateString()}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Reviews Management */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Manage Reviews
            </Heading>
            {reviews.length === 0 ? (
              <Box textAlign="center" py={8} color="gray.500">
                <Star size={32} style={{ margin: "0 auto 16px" }} />
                <Text>No reviews yet. Add your first coach review!</Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {reviews.map((review) => (
                  <Card key={review.id} variant="outline">
                    <CardBody>
                      <HStack spacing={4} align="start">
                        <Avatar size="md" src={review.reviewer_image_url} name={review.reviewer_name} />
                        <VStack align="start" spacing={2} flex={1}>
                          <HStack spacing={2} wrap="wrap">
                            <Text fontWeight="semibold">{review.reviewer_name}</Text>
                            <Badge colorScheme="blue">{review.reviewer_title}</Badge>
                            {review.can_contact_reviewer && (
                              <Badge colorScheme="green">{<MessageCircle size={12} />}
                                Contactable
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {review.reviewer_organization}
                          </Text>
                          <HStack spacing={1}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill={i < review.rating ? "#ffd700" : "none"}
                                color={i < review.rating ? "#ffd700" : "#e2e8f0"}
                              />
                            ))}
                          </HStack>
                          <Text fontSize="sm" noOfLines={2}>
                            {review.review_text}
                          </Text>
                        </VStack>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Edit size={16} />}
                            onClick={() => handleEdit(review)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            leftIcon={<Trash2 size={16} />}
                            onClick={() => handleDelete(review.id)}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Preview */}
        {reviews.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Public Profile Preview
              </Heading>
              <ReviewsDisplay reviews={reviews} athleteName="Your Profile" />
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Add/Edit Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingReview ? "Edit Review" : "Add New Review"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Contact information is stored privately and only used for notifications. It will not be displayed
                    publicly unless the reviewer opts in to being contactable.
                  </Text>
                </Alert>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Reviewer Name</FormLabel>
                    <Input
                      value={formData.reviewer_name}
                      onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                      placeholder="Coach John Smith"
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
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel>Organization</FormLabel>
                  <Input
                    value={formData.reviewer_organization}
                    onChange={(e) => setFormData({ ...formData, reviewer_organization: e.target.value })}
                    placeholder="University of Example"
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Email (Private)</FormLabel>
                    <Input
                      type="email"
                      value={formData.reviewer_email}
                      onChange={(e) => setFormData({ ...formData, reviewer_email: e.target.value })}
                      placeholder="coach@university.edu"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Phone (Private)</FormLabel>
                    <Input
                      type="tel"
                      value={formData.reviewer_phone}
                      onChange={(e) => setFormData({ ...formData, reviewer_phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Reviewer Photo</FormLabel>
                  <VStack spacing={3} align="stretch">
                    {formData.reviewer_image_url && (
                      <HStack spacing={3}>
                        <Avatar size="md" src={formData.reviewer_image_url} name={formData.reviewer_name} />
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => setFormData({ ...formData, reviewer_image_url: "" })}
                        >
                          Remove Photo
                        </Button>
                      </HStack>
                    )}
                    <FileUpload
                      onFileSelect={handleImageUpload}
                      accept="image/*"
                      maxSize={5 * 1024 * 1024} // 5MB
                    />
                      <Button leftIcon={<Upload size={16} />} variant="outline" size="sm">
                        Upload Reviewer Photo
                      </Button>
                    
                  </VStack>
                </FormControl>

                <FormControl>
                  <FormLabel>Allow Public Contact</FormLabel>
                  <HStack spacing={3}>
                    <Switch
                      isChecked={formData.can_contact_reviewer}
                      onChange={(e) => setFormData({ ...formData, can_contact_reviewer: e.target.checked })}
                    />
                    <Text fontSize="sm" color="gray.600">
                      Allow visitors to contact this reviewer about you
                    </Text>
                  </HStack>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Rating</FormLabel>
                    <NumberInput
                      value={formData.rating}
                      onChange={(_, value) => setFormData({ ...formData, rating: value || 5 })}
                      min={1}
                      max={5}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Review Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.review_date}
                      onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Location (Optional)</FormLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Tournament, Camp, etc."
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Review Text</FormLabel>
                  <Textarea
                    value={formData.review_text}
                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                    placeholder="Write the coach's review here..."
                    rows={6}
                    resize="vertical"
                  />
                </FormControl>
              </VStack>
            </form>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {editingReview ? "Update Review" : "Add Review"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
