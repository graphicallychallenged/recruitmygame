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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Input,
  Switch,
  Image,
  IconButton,
  Divider,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react"
import {
  Star,
  Shield,
  Upload,
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Award,
  Target,
  Heart,
  Zap,
  Users,
  TrendingUp,
  CheckCircle,
  FileText,
  UserCheck,
} from "lucide-react"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"
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
  const [reviewType, setReviewType] = useState("")
  const [error, setError] = useState("")

  // Additional reviewer info
  const [reviewerPhone, setReviewerPhone] = useState("")
  const [reviewerImageUrl, setReviewerImageUrl] = useState("")
  const [canContactReviewer, setCanContactReviewer] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Additional review categories
  const [athleticism, setAthleticism] = useState(5)
  const [character, setCharacter] = useState(5)
  const [workEthic, setWorkEthic] = useState(5)
  const [leadership, setLeadership] = useState(5)
  const [coachability, setCoachability] = useState(5)
  const [teamwork, setTeamwork] = useState(5)
  const [relationship, setRelationship] = useState("")
  const [yearsKnown, setYearsKnown] = useState("")
  const [wouldRecommend, setWouldRecommend] = useState("")

  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        status: "error",
        duration: 3000,
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        status: "error",
        duration: 3000,
      })
      return
    }

    setUploadingImage(true)

    try {
      // Create FormData and send to API route that uses service role
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", "athlete-photos")
      formData.append("folder", "reviewer-images")

      const response = await fetch("/api/upload-reviewer-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      setReviewerImageUrl(data.url)

      toast({
        title: "Image uploaded successfully",
        status: "success",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Upload exception:", error)
      toast({
        title: "Upload failed",
        description: error.message,
        status: "error",
        duration: 3000,
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reviewText.trim() || !rating || !reviewType || !relationship || !yearsKnown || !wouldRecommend) {
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
          review_type: reviewType,
          reviewer_phone: reviewerPhone,
          reviewer_image_url: reviewerImageUrl,
          can_contact_reviewer: canContactReviewer,
          athleticism,
          character,
          work_ethic: workEthic,
          leadership,
          coachability,
          teamwork,
          relationship,
          years_known: yearsKnown,
          would_recommend: wouldRecommend,
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

  const renderSlider = (value: number, setValue: (val: number) => void, label: string, icon: React.ReactNode) => (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      shadow="sm"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
    >
      <CardBody p={8}>
        <VStack spacing={6} align="stretch">
          <HStack spacing={3}>
            <Box color="blue.500">{icon}</Box>
            <VStack align="start" spacing={1} flex={1}>
              <Text fontWeight="bold" fontSize="lg" color="gray.700">
                {label}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Rate from 1 (Poor) to 10 (Excellent)
              </Text>
            </VStack>
            <Badge colorScheme="teal" fontSize="lg" px={3} py={1} borderRadius="full">
              {value}/10
            </Badge>
          </HStack>

          <Box px={4} py={2}>
            <Slider value={value} onChange={setValue} min={1} max={10} step={1} colorScheme="teal" size="lg">
              <SliderMark value={1} mt={4} ml={-3} fontSize="sm" color="gray.400" fontWeight="medium">
                1
              </SliderMark>
              <SliderMark value={3} mt={4} ml={-3} fontSize="sm" color="gray.400" fontWeight="medium">
                3
              </SliderMark>
              <SliderMark value={5} mt={4} ml={-3} fontSize="sm" color="gray.400" fontWeight="medium">
                5
              </SliderMark>
              <SliderMark value={7} mt={4} ml={-3} fontSize="sm" color="gray.400" fontWeight="medium">
                7
              </SliderMark>
              <SliderMark value={10} mt={4} ml={-4} fontSize="sm" color="gray.400" fontWeight="medium">
                10
              </SliderMark>

              <SliderTrack h={3} borderRadius="full" bg="gray.200">
                <SliderFilledTrack bg="blue.400" />
              </SliderTrack>
              <SliderThumb boxSize={8} bg="blue.500" border="3px solid white" shadow="lg">
                <Box color="white" fontSize="xs" fontWeight="bold">
                  {value}
                </Box>
              </SliderThumb>
            </Slider>
          </Box>

          <HStack justify="space-between" px={2}>
            <Text fontSize="xs" color="gray.400" fontWeight="medium">
              Poor
            </Text>
            <Text fontSize="xs" color="gray.400" fontWeight="medium">
              Average
            </Text>
            <Text fontSize="xs" color="gray.400" fontWeight="medium">
              Excellent
            </Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )

  if (loading) {
    return (
      <>
        <Box bg={bgColor} minH="100vh">
          <Container maxW="2xl" py={16}>
            <VStack spacing={6} align="center">
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text fontSize="lg" color="gray.600">
                Loading verification request...
              </Text>
            </VStack>
          </Container>
        </Box>
        <SiteFooter />
      </>
    )
  }

  if (error && !request) {
    return (
      <>
        <SiteHeader />
        <Box bg={bgColor} minH="100vh">
          <Container maxW="2xl" py={16}>
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {error}
            </Alert>
          </Container>
        </Box>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <SiteHeader />
      <Box bg={bgColor} minH="100vh">
        <Container maxW="6xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header Section */}
            <Box textAlign="center" py={8}>
              <HStack justify="center" spacing={3} mb={4}>
                <Shield color="#22C55E" size={32} />
                <Heading size="xl" color="gray.800">
                  Write Verified Review
                </Heading>
              </HStack>
              <Text color="gray.600" fontSize="lg" maxW="2xl" mx="auto">
                You've been asked to provide a verified review for an athlete. Your review will help college recruiters
                make informed decisions.
              </Text>
            </Box>

            {request && athleteInfo && (
              <>
                {/* Athlete Info Card */}
                <Card bg={cardBg} shadow="lg" border="1px" borderColor={borderColor}>
                  <CardBody p={8}>
                    <Heading size="md" mb={6} color="gray.700">
                      Review Request For:
                    </Heading>
                    <Flex direction={{ base: "column", md: "row" }} align="center" gap={6}>
                      <Avatar name={athleteInfo.athlete_name} src={athleteInfo.profile_picture_url} size="2xl" />
                      <VStack align={{ base: "center", md: "start" }} spacing={3} flex={1}>
                        <Heading size="lg" textAlign={{ base: "center", md: "left" }}>
                          {athleteInfo.athlete_name}
                        </Heading>
                        <Text color="gray.600" fontSize="lg">
                          {athleteInfo.sport} • {athleteInfo.school}
                        </Text>
                        <Badge colorScheme="green" px={3} py={1} borderRadius="full" fontSize="sm">
                          <HStack spacing={1}>
                            <Shield size={14} />
                            <Text>Verified Review</Text>
                          </HStack>
                        </Badge>
                      </VStack>
                    </Flex>

                    <Divider my={6} />

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <User size={16} color="gray.500" />
                          <Text fontSize="sm" color="gray.600">
                            Your Name:
                          </Text>
                        </HStack>
                        <Text fontWeight="semibold" fontSize="lg">
                          {request.reviewer_name}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Mail size={16} color="gray.500" />
                          <Text fontSize="sm" color="gray.600">
                            Your Email:
                          </Text>
                        </HStack>
                        <Text fontWeight="semibold" fontSize="lg">
                          {request.reviewer_email}
                        </Text>
                      </VStack>
                      {request.reviewer_title && (
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" color="gray.600">
                            Your Title:
                          </Text>
                          <Text fontWeight="semibold">{request.reviewer_title}</Text>
                        </VStack>
                      )}
                      {request.reviewer_organization && (
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" color="gray.600">
                            Your Organization:
                          </Text>
                          <Text fontWeight="semibold">{request.reviewer_organization}</Text>
                        </VStack>
                      )}
                    </SimpleGrid>

                    <Box mt={6} p={6} bg="blue.50" borderRadius="lg" borderLeft="4px" borderLeftColor="blue.400">
                      <Text fontWeight="semibold" mb={2} color="blue.800">
                        Message from {athleteInfo.athlete_name}:
                      </Text>
                      <Text fontStyle="italic" color="blue.700">
                        "{request.request_message}"
                      </Text>
                    </Box>
                  </CardBody>
                </Card>

                {/* Review Form */}
                <Card bg={cardBg} shadow="lg" border="1px" borderColor={borderColor}>
                  <CardBody p={8}>
                    <form onSubmit={handleSubmit}>
                      <VStack spacing={10} align="stretch">
                        <Heading size="lg" color="gray.700">
                          Your Review
                        </Heading>

                        {/* Reviewer Information Section */}
                        <Box>
                          <Heading size="md" mb={6} color="gray.700">
                            Your Information
                          </Heading>
                          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                            <FormControl>
                              <FormLabel fontWeight="semibold">
                                <HStack>
                                  <Phone size={16} />
                                  <Text>Phone Number (Optional)</Text>
                                </HStack>
                              </FormLabel>
                              <Input
                                type="tel"
                                value={reviewerPhone}
                                onChange={(e) => setReviewerPhone(e.target.value)}
                                placeholder="(555) 123-4567"
                                size="lg"
                                borderRadius="lg"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontWeight="semibold">
                                <HStack>
                                  <User size={16} />
                                  <Text>Profile Photo (Optional)</Text>
                                </HStack>
                              </FormLabel>
                              <VStack align="start" spacing={4}>
                                {reviewerImageUrl ? (
                                  <HStack spacing={4}>
                                    <Image
                                      src={reviewerImageUrl || "/placeholder.svg"}
                                      alt="Reviewer photo"
                                      boxSize="80px"
                                      borderRadius="lg"
                                      objectFit="cover"
                                      border="2px"
                                      borderColor={borderColor}
                                    />
                                    <IconButton
                                      aria-label="Remove photo"
                                      icon={<X size={18} />}
                                      size="md"
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={() => setReviewerImageUrl("")}
                                    />
                                  </HStack>
                                ) : (
                                  <Button
                                    as="label"
                                    htmlFor="reviewer-image"
                                    leftIcon={<Upload size={18} />}
                                    size="lg"
                                    variant="outline"
                                    isLoading={uploadingImage}
                                    loadingText="Uploading..."
                                    cursor="pointer"
                                    borderRadius="lg"
                                    _hover={{ bg: "blue.50" }}
                                  >
                                    Upload Photo
                                  </Button>
                                )}
                                <Input
                                  id="reviewer-image"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  display="none"
                                />
                              </VStack>
                            </FormControl>
                          </SimpleGrid>

                          <Box mt={6} p={6} bg="gray.50" borderRadius="lg">
                            <FormControl>
                              <HStack spacing={4}>
                                <Switch
                                  id="can-contact"
                                  isChecked={canContactReviewer}
                                  onChange={(e) => setCanContactReviewer(e.target.checked)}
                                  colorScheme="teal"
                                  size="lg"
                                />
                                <VStack align="start" spacing={1}>
                                  <FormLabel htmlFor="can-contact" mb={0} fontWeight="semibold">
                                    Allow recruiters to contact me about this athlete
                                  </FormLabel>
                                  <Text fontSize="sm" color="gray.600">
                                    If enabled, college recruiters may reach out to you for additional information.
                                  </Text>
                                </VStack>
                              </HStack>
                            </FormControl>
                          </Box>
                        </Box>

                        <Divider />

                        {/* Basic Review Info */}
                        <Box>
                          <HStack spacing={3} mb={6}>
                            <FileText size={24} color="#3182CE" />
                            <VStack align="start" spacing={1}>
                              <Heading size="md" color="gray.700">
                                Review Details
                              </Heading>
                              <Text color="gray.600" fontSize="sm">
                                Please provide the basic information about your review
                              </Text>
                            </VStack>
                          </HStack>

                          <VStack spacing={8} align="stretch">
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                              <Card bg="gray.50" border="1px" borderColor={borderColor} p={1}>
                                <CardBody p={6}>
                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold" fontSize="md" mb={3}>
                                      <HStack spacing={2}>
                                        <FileText size={18} color="#3182CE" />
                                        <Text>Review Type</Text>
                                        <Text color="red.500" fontSize="sm">
                                          *
                                        </Text>
                                      </HStack>
                                    </FormLabel>
                                    <Select
                                      value={reviewType}
                                      onChange={(e) => setReviewType(e.target.value)}
                                      placeholder="Select review type"
                                      size="lg"
                                      borderRadius="lg"
                                      bg="white"
                                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                                    >
                                      <option value="general">General Review</option>
                                      <option value="coach">Coaching Review</option>
                                      <option value="academic">Academic Review</option>
                                      <option value="character">Character Review</option>
                                      <option value="performance">Performance Review</option>
                                    </Select>
                                    <Text fontSize="xs" color="gray.500" mt={2}>
                                      Choose the type of review you're providing
                                    </Text>
                                  </FormControl>
                                </CardBody>
                              </Card>

                              <Card bg="gray.50" border="1px" borderColor={borderColor} p={1}>
                                <CardBody p={6}>
                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold" fontSize="md" mb={3}>
                                      <HStack spacing={2}>
                                        <UserCheck size={18} color="#3182CE" />
                                        <Text>Your Relationship</Text>
                                        <Text color="red.500" fontSize="sm">
                                          *
                                        </Text>
                                      </HStack>
                                    </FormLabel>
                                    <Select
                                      value={relationship}
                                      onChange={(e) => setRelationship(e.target.value)}
                                      placeholder="Select relationship"
                                      size="lg"
                                      borderRadius="lg"
                                      bg="white"
                                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                                    >
                                      <option value="coach">Coach</option>
                                      <option value="assistant_coach">Assistant Coach</option>
                                      <option value="trainer">Trainer</option>
                                      <option value="teacher">Teacher</option>
                                      <option value="mentor">Mentor</option>
                                      <option value="teammate">Teammate</option>
                                      <option value="other">Other</option>
                                    </Select>
                                    <Text fontSize="xs" color="gray.500" mt={2}>
                                      How do you know this athlete?
                                    </Text>
                                  </FormControl>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            <Card bg="gray.50" border="1px" borderColor={borderColor} p={1}>
                              <CardBody p={6}>
                                <FormControl isRequired>
                                  <FormLabel fontWeight="bold" fontSize="md" mb={3}>
                                    <HStack spacing={2}>
                                      <Calendar size={18} color="#3182CE" />
                                      <Text>Time Known</Text>
                                      <Text color="red.500" fontSize="sm">
                                        *
                                      </Text>
                                    </HStack>
                                  </FormLabel>
                                  <Input
                                    value={yearsKnown}
                                    onChange={(e) => setYearsKnown(e.target.value)}
                                    placeholder="e.g., 2 years, 6 months"
                                    size="lg"
                                    borderRadius="lg"
                                    bg="white"
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                                  />
                                  <Text fontSize="xs" color="gray.500" mt={2}>
                                    How long have you known this athlete?
                                  </Text>
                                </FormControl>
                              </CardBody>
                            </Card>
                          </VStack>
                        </Box>

                        <Divider />

                        {/* Rating Categories */}
                        <Box>
                          <VStack spacing={6} align="stretch">
                            <HStack spacing={3} mb={2}>
                              <Award size={28} color="#3182CE" />
                              <VStack align="start" spacing={1}>
                                <Heading size="md" color="gray.700">
                                  Rate This Athlete
                                </Heading>
                                <Text color="gray.600" fontSize="md">
                                  Please rate the athlete on a scale of 1-10 in each category
                                </Text>
                              </VStack>
                            </HStack>

                            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                              {renderSlider(athleticism, setAthleticism, "Athleticism & Skill", <Target size={20} />)}
                              {renderSlider(character, setCharacter, "Character & Integrity", <Heart size={20} />)}
                              {renderSlider(workEthic, setWorkEthic, "Work Ethic", <Zap size={20} />)}
                              {renderSlider(leadership, setLeadership, "Leadership", <TrendingUp size={20} />)}
                              {renderSlider(coachability, setCoachability, "Coachability", <CheckCircle size={20} />)}
                              {renderSlider(teamwork, setTeamwork, "Teamwork", <Users size={20} />)}
                            </SimpleGrid>
                          </VStack>
                        </Box>

                        <Divider />

                        {/* Written Review */}
                        <FormControl isRequired>
                          <FormLabel fontWeight="semibold" fontSize="lg">
                            Your Detailed Review
                          </FormLabel>
                          <Textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Please provide your honest review of this athlete's performance, character, work ethic, and any other relevant details..."
                            rows={8}
                            resize="vertical"
                            size="lg"
                            borderRadius="lg"
                          />
                        </FormControl>

                        {/* Final Rating and Recommendation */}
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                          <FormControl isRequired>
                            <FormLabel fontWeight="semibold" fontSize="lg">
                              Overall Rating
                            </FormLabel>
                            <Select
                              value={rating}
                              onChange={(e) => setRating(e.target.value)}
                              placeholder="Select a rating"
                              size="lg"
                              borderRadius="lg"
                            >
                              <option value="5">⭐⭐⭐⭐⭐ Excellent (5 stars)</option>
                              <option value="4">⭐⭐⭐⭐ Very Good (4 stars)</option>
                              <option value="3">⭐⭐⭐ Good (3 stars)</option>
                              <option value="2">⭐⭐ Fair (2 stars)</option>
                              <option value="1">⭐ Poor (1 star)</option>
                            </Select>
                            {rating && (
                              <HStack mt={3} justify="center">
                                <Text fontSize="sm" color="gray.600">
                                  Preview:
                                </Text>
                                <HStack spacing={1}>{renderStars(Number.parseInt(rating))}</HStack>
                              </HStack>
                            )}
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontWeight="semibold" fontSize="lg">
                              Recruiter Recommendation
                            </FormLabel>
                            <Select
                              value={wouldRecommend}
                              onChange={(e) => setWouldRecommend(e.target.value)}
                              placeholder="Select recommendation"
                              size="lg"
                              borderRadius="lg"
                            >
                              <option value="highly_recommend">Highly Recommend</option>
                              <option value="recommend">Recommend</option>
                              <option value="recommend_with_reservations">Recommend with Reservations</option>
                              <option value="do_not_recommend">Do Not Recommend</option>
                            </Select>
                          </FormControl>
                        </SimpleGrid>

                        {error && (
                          <Alert status="error" borderRadius="lg">
                            <AlertIcon />
                            {error}
                          </Alert>
                        )}

                        <VStack spacing={4}>
                          <Button
                            type="submit"
                            colorScheme="green"
                            size="xl"
                            isLoading={submitting}
                            loadingText="Submitting Review..."
                            leftIcon={<Shield size={20} />}
                            borderRadius="xl"
                            px={12}
                            py={6}
                            fontSize="lg"
                            fontWeight="bold"
                            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                            transition="all 0.2s"
                          >
                            Submit Verified Review
                          </Button>

                          <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
                            By submitting this review, you confirm that it is based on your direct experience with this
                            athlete and is truthful and accurate.
                          </Text>
                        </VStack>
                      </VStack>
                    </form>
                  </CardBody>
                </Card>
              </>
            )}
          </VStack>
        </Container>
      </Box>
      <SiteFooter />
    </>
  )
}
