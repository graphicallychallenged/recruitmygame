"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Card,
  CardBody,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  SimpleGrid,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Switch,
  Divider,
} from "@chakra-ui/react"
import { CreditCard, Download, ExternalLink, Settings, Palette } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import type { AthleteProfile } from "@/types/database"
import { hasFeature, getTierDisplayName, getTierColor } from "@/utils/tierFeatures"
import Link from "next/link"

interface BusinessCardTemplate {
  id: string
  name: string
  description: string
  preview_url: string
  canva_template_id: string
  category: "modern" | "classic" | "athletic" | "minimal"
}

const BUSINESS_CARD_TEMPLATES: BusinessCardTemplate[] = [
  {
    id: "modern-1",
    name: "Modern Athletic",
    description: "Clean, modern design with bold typography",
    preview_url: "/placeholder.svg?height=200&width=350&text=Modern+Athletic",
    canva_template_id: "template_modern_1",
    category: "modern",
  },
  {
    id: "classic-1",
    name: "Classic Professional",
    description: "Traditional business card layout",
    preview_url: "/placeholder.svg?height=200&width=350&text=Classic+Professional",
    canva_template_id: "template_classic_1",
    category: "classic",
  },
  {
    id: "athletic-1",
    name: "Sports Focus",
    description: "Dynamic design highlighting athletic achievements",
    preview_url: "/placeholder.svg?height=200&width=350&text=Sports+Focus",
    canva_template_id: "template_athletic_1",
    category: "athletic",
  },
  {
    id: "minimal-1",
    name: "Minimal Clean",
    description: "Simple, elegant design with essential information",
    preview_url: "/placeholder.svg?height=200&width=350&text=Minimal+Clean",
    canva_template_id: "template_minimal_1",
    category: "minimal",
  },
]

export default function BusinessCardsPage() {
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessCardTemplate | null>(null)
  const [generatedCards, setGeneratedCards] = useState<string[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const router = useRouter()

  // Card customization options
  const [cardOptions, setCardOptions] = useState({
    includeQR: true,
    includePhoto: true,
    includeStats: true,
    includeSocial: true,
    customMessage: "",
    cardQuantity: 100,
    paperType: "premium",
    finish: "matte",
  })

  useEffect(() => {
    fetchAthleteData()
  }, [])

  const fetchAthleteData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase.from("athletes").select("*").eq("user_id", user.id).single()

      if (error) {
        console.error("Error fetching athlete:", error)
        toast({
          title: "Error loading profile",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        })
        return
      }

      setAthlete(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const generateBusinessCard = async (template: BusinessCardTemplate) => {
    if (!athlete) return

    setGenerating(true)
    setSelectedTemplate(template)

    try {
      // Prepare data for Canva API
      const cardData = {
        template_id: template.canva_template_id,
        athlete_data: {
          name: athlete.athlete_name,
          sport: athlete.sport,
          school: athlete.school,
          location: athlete.location,
          graduation_year: athlete.graduation_year,
          positions: athlete.positions_played,
          email: cardOptions.includeStats && athlete.show_email ? athlete.email : null,
          phone: cardOptions.includeStats && athlete.show_phone ? athlete.phone : null,
          profile_picture: cardOptions.includePhoto ? athlete.profile_picture_url : null,
          primary_color: athlete.primary_color,
          secondary_color: athlete.secondary_color,
          stats: cardOptions.includeStats
            ? {
                height: athlete.height,
                weight: athlete.weight,
                gpa: athlete.gpa,
                sat_score: athlete.sat_score,
                act_score: athlete.act_score,
              }
            : null,
          social_media: cardOptions.includeSocial
            ? {
                instagram: athlete.instagram,
                twitter: athlete.twitter,
                tiktok: athlete.tiktok,
              }
            : null,
          custom_message: cardOptions.customMessage,
          qr_code_url: cardOptions.includeQR ? `https://recruitmygame.com/${athlete.username}` : null,
        },
        options: {
          quantity: cardOptions.cardQuantity,
          paper_type: cardOptions.paperType,
          finish: cardOptions.finish,
        },
      }

      // Call Canva API (this would be implemented with actual Canva integration)
      const response = await fetch("/api/canva/generate-business-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardData),
      })

      if (!response.ok) {
        throw new Error("Failed to generate business card")
      }

      const result = await response.json()

      // For now, simulate successful generation
      const mockGeneratedCard = `/placeholder.svg?height=400&width=700&text=Generated+${template.name}`
      setGeneratedCards([mockGeneratedCard])

      onOpen()

      toast({
        title: "Business Card Generated!",
        description: `Your ${template.name} business card has been created successfully.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error: any) {
      console.error("Error generating business card:", error)
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate business card. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setGenerating(false)
    }
  }

  const downloadCard = (cardUrl: string) => {
    const link = document.createElement("a")
    link.href = cardUrl
    link.download = `${athlete?.athlete_name}-business-card.png`
    link.click()
  }

  const orderCards = async () => {
    if (!selectedTemplate || !athlete) return

    try {
      // This would integrate with a printing service API
      toast({
        title: "Order Placed!",
        description: `Your order for ${cardOptions.cardQuantity} business cards has been placed.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (loading) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="center">
          <Spinner size="xl" color="purple.500" />
          <Text>Loading business card generator...</Text>
        </VStack>
      </Container>
    )
  }

  if (!athlete) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Profile not found!</AlertTitle>
          <AlertDescription>Unable to load your athlete profile.</AlertDescription>
        </Alert>
      </Container>
    )
  }

  const currentTier = (athlete.subscription_tier || "free") as "free" | "premium" | "pro"
  const hasBusinessCards = hasFeature(currentTier, "business_cards")

  if (!hasBusinessCards) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>
              <HStack spacing={2}>
                <CreditCard size={24} />
                <Text>Business Card Generator</Text>
                <Badge colorScheme="purple" variant="solid">
                  PRO
                </Badge>
              </HStack>
            </Heading>
            <Text color="gray.600">Create professional business cards with your athletic profile</Text>
          </Box>

          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Pro Feature Required</AlertTitle>
              <AlertDescription>
                Business card generation is only available for Pro subscribers. Upgrade your account to access this
                feature.
              </AlertDescription>
            </Box>
          </Alert>

          <Card>
            <CardBody>
              <VStack spacing={6}>
                <Heading size="md" textAlign="center">
                  Upgrade to Pro
                </Heading>
                <Text textAlign="center" color="gray.600">
                  Get access to professional business card generation, unlimited customization options, and direct
                  printing services.
                </Text>
                <Button as={Link} href="/subscription" colorScheme="purple" size="lg">
                  View Pro Plans
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            <HStack spacing={2}>
              <CreditCard size={24} />
              <Text>Business Card Generator</Text>
              <Badge colorScheme={getTierColor(currentTier)} variant="solid">
                {getTierDisplayName(currentTier)}
              </Badge>
            </HStack>
          </Heading>
          <Text color="gray.600">Create professional business cards powered by Canva</Text>
        </Box>

        {/* Customization Options */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">
                <HStack spacing={2}>
                  <Settings size={20} />
                  <Text>Customization Options</Text>
                </HStack>
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack align="stretch" spacing={4}>
                  <FormControl>
                    <HStack justify="space-between">
                      <FormLabel mb={0}>Include Profile Photo</FormLabel>
                      <Switch
                        isChecked={cardOptions.includePhoto}
                        onChange={(e) => setCardOptions({ ...cardOptions, includePhoto: e.target.checked })}
                      />
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <HStack justify="space-between">
                      <FormLabel mb={0}>Include QR Code</FormLabel>
                      <Switch
                        isChecked={cardOptions.includeQR}
                        onChange={(e) => setCardOptions({ ...cardOptions, includeQR: e.target.checked })}
                      />
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <HStack justify="space-between">
                      <FormLabel mb={0}>Include Athletic Stats</FormLabel>
                      <Switch
                        isChecked={cardOptions.includeStats}
                        onChange={(e) => setCardOptions({ ...cardOptions, includeStats: e.target.checked })}
                      />
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <HStack justify="space-between">
                      <FormLabel mb={0}>Include Social Media</FormLabel>
                      <Switch
                        isChecked={cardOptions.includeSocial}
                        onChange={(e) => setCardOptions({ ...cardOptions, includeSocial: e.target.checked })}
                      />
                    </HStack>
                  </FormControl>
                </VStack>

                <VStack align="stretch" spacing={4}>
                  <FormControl>
                    <FormLabel>Custom Message</FormLabel>
                    <Textarea
                      value={cardOptions.customMessage}
                      onChange={(e) => setCardOptions({ ...cardOptions, customMessage: e.target.value })}
                      placeholder="Add a personal message or tagline..."
                      rows={3}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Card Quantity</FormLabel>
                    <Select
                      value={cardOptions.cardQuantity}
                      onChange={(e) =>
                        setCardOptions({ ...cardOptions, cardQuantity: Number.parseInt(e.target.value) })
                      }
                    >
                      <option value={50}>50 cards</option>
                      <option value={100}>100 cards</option>
                      <option value={250}>250 cards</option>
                      <option value={500}>500 cards</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Paper Type</FormLabel>
                    <Select
                      value={cardOptions.paperType}
                      onChange={(e) => setCardOptions({ ...cardOptions, paperType: e.target.value })}
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="luxury">Luxury</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Finish</FormLabel>
                    <Select
                      value={cardOptions.finish}
                      onChange={(e) => setCardOptions({ ...cardOptions, finish: e.target.value })}
                    >
                      <option value="matte">Matte</option>
                      <option value="glossy">Glossy</option>
                      <option value="satin">Satin</option>
                    </Select>
                  </FormControl>
                </VStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Template Selection */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">
                <HStack spacing={2}>
                  <Palette size={20} />
                  <Text>Choose Template</Text>
                </HStack>
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                {BUSINESS_CARD_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    cursor="pointer"
                    borderWidth="2px"
                    borderColor={selectedTemplate?.id === template.id ? "purple.500" : "gray.200"}
                    _hover={{ borderColor: "purple.300", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardBody p={4}>
                      <VStack spacing={3}>
                        <Image
                          src={template.preview_url || "/placeholder.svg"}
                          alt={template.name}
                          borderRadius="md"
                          w="full"
                          h="120px"
                          objectFit="cover"
                        />
                        <VStack spacing={1} align="center">
                          <Text fontWeight="semibold" fontSize="sm" textAlign="center">
                            {template.name}
                          </Text>
                          <Text fontSize="xs" color="gray.600" textAlign="center">
                            {template.description}
                          </Text>
                          <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                            {template.category}
                          </Badge>
                        </VStack>
                        <Button
                          size="sm"
                          colorScheme="purple"
                          variant={selectedTemplate?.id === template.id ? "solid" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation()
                            generateBusinessCard(template)
                          }}
                          isLoading={generating && selectedTemplate?.id === template.id}
                          loadingText="Generating..."
                          w="full"
                        >
                          Generate Card
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Generated Cards Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2}>
                <CreditCard size={20} />
                <Text>Your Business Card</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={6}>
                {generatedCards.map((cardUrl, index) => (
                  <Box key={index} w="full">
                    <Image
                      src={cardUrl || "/placeholder.svg"}
                      alt="Generated Business Card"
                      borderRadius="md"
                      w="full"
                      maxW="500px"
                      mx="auto"
                    />
                  </Box>
                ))}

                <Divider />

                <VStack spacing={4} w="full">
                  <Text fontWeight="semibold">Ready to order?</Text>
                  <HStack spacing={4} w="full" justify="center">
                    <Button
                      leftIcon={<Download size={16} />}
                      variant="outline"
                      onClick={() => generatedCards.forEach(downloadCard)}
                    >
                      Download
                    </Button>
                    <Button leftIcon={<ExternalLink size={16} />} colorScheme="purple" onClick={orderCards}>
                      Order {cardOptions.cardQuantity} Cards
                    </Button>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Cards will be printed on {cardOptions.paperType} paper with {cardOptions.finish} finish
                  </Text>
                </VStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  )
}
