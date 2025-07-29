"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Box,
  Image,
  FormControl,
  FormLabel,
  Switch,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Grid,
  GridItem,
  Divider,
  Alert,
  AlertIcon,
} from "@chakra-ui/react"
import { CreditCard, Download, QrCode, Mail, Phone, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useSearchParams } from "next/navigation"

type SubscriptionTier = "free" | "premium" | "pro"

interface BusinessCardGeneratorProps {
  athlete: {
    athlete_name: string
    sport: string
    school?: string
    location?: string
    username: string
    profile_picture_url?: string
    primary_color?: string
    secondary_color?: string
    email?: string
    phone?: string
  }
  subscription_tier: SubscriptionTier
}

interface CardDesign {
  id: string
  name: string
  preview: string
  description: string
  canva_template_id: string
}

interface CardOptions {
  includeEmail: boolean
  includePhone: boolean
  includeQR: boolean
  includePhoto: boolean
}

const CARD_DESIGNS: CardDesign[] = [
  {
    id: "modern",
    name: "Modern",
    preview: "/placeholder.svg?height=200&width=350&text=Modern+Design",
    description: "Clean, professional design with bold typography",
    canva_template_id: "BAFpY8H1wQs", // Replace with actual Canva template ID
  },
  {
    id: "athletic",
    name: "Athletic",
    preview: "/placeholder.svg?height=200&width=350&text=Athletic+Design",
    description: "Sports-focused design with dynamic elements",
    canva_template_id: "BAFpY8H1wQt", // Replace with actual Canva template ID
  },
  {
    id: "classic",
    name: "Classic",
    preview: "/placeholder.svg?height=200&width=350&text=Classic+Design",
    description: "Traditional business card layout",
    canva_template_id: "BAFpY8H1wQu", // Replace with actual Canva template ID
  },
  {
    id: "bold",
    name: "Bold",
    preview: "/placeholder.svg?height=200&width=350&text=Bold+Design",
    description: "Eye-catching design with vibrant colors",
    canva_template_id: "BAFpY8H1wQv", // Replace with actual Canva template ID
  },
]

export function BusinessCardGenerator({ athlete, subscription_tier }: BusinessCardGeneratorProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedDesign, setSelectedDesign] = useState<string>("modern")
  const [generating, setGenerating] = useState(false)
  const [generatedCard, setGeneratedCard] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [cardOptions, setCardOptions] = useState<CardOptions>({
    includeEmail: true,
    includePhone: true,
    includeQR: true,
    includePhoto: true,
  })

  const toast = useToast()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const canUseFeature = subscription_tier === "pro"

  useEffect(() => {
    // Check for OAuth callback results
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success === "connected") {
      setIsConnected(true)
      toast({
        title: "Connected to Canva!",
        description: "You can now generate professional business cards.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } else if (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Canva. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }

    // Check if user is already connected
    checkCanvaConnection()
  }, [searchParams])

  const checkCanvaConnection = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from("canva_tokens").select("expires_at").eq("user_id", user.id).single()

      if (data && new Date(data.expires_at) > new Date()) {
        setIsConnected(true)
      }
    } catch (error) {
      console.error("Error checking Canva connection:", error)
    }
  }

  const generateBusinessCard = async () => {
    if (!canUseFeature) {
      toast({
        title: "Pro Feature Required",
        description: "Business card generation is available for Pro subscribers only.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setGenerating(true)
    try {
      const selectedTemplate = CARD_DESIGNS.find((d) => d.id === selectedDesign)
      if (!selectedTemplate) {
        throw new Error("Template not found")
      }

      // Prepare card data with user preferences
      const cardData = {
        template_id: selectedTemplate.canva_template_id,
        athlete_data: {
          name: athlete.athlete_name,
          sport: athlete.sport,
          school: athlete.school,
          location: athlete.location,
          email: cardOptions.includeEmail ? athlete.email : null,
          phone: cardOptions.includePhone ? athlete.phone : null,
          profile_picture: cardOptions.includePhoto ? athlete.profile_picture_url : null,
          profile_url: `${window.location.origin}/${athlete.username}`,
          primary_color: athlete.primary_color || "#3182CE",
          secondary_color: athlete.secondary_color || "#805AD5",
        },
        options: cardOptions,
      }

      // Call your API endpoint that handles Canva integration
      const response = await fetch("/api/canva/generate-business-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardData),
      })

      const result = await response.json()

      if (response.status === 401 && result.auth_url) {
        // User needs to authorize with Canva
        window.location.href = result.auth_url
        return
      }

      if (!response.ok) {
        throw new Error(result.error || "Generation failed")
      }

      if (result.success) {
        setGeneratedCard(result.preview_url || result.download_url)
        onClose()
        toast({
          title: "Business card generated!",
          description: "Your professional business card is ready for download.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
      } else {
        throw new Error(result.error || "Generation failed")
      }
    } catch (error: any) {
      console.error("Error generating business card:", error)
      toast({
        title: "Error generating card",
        description: error.message || "Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setGenerating(false)
    }
  }

  const downloadCard = () => {
    if (generatedCard) {
      const link = document.createElement("a")
      link.href = generatedCard
      link.download = `${athlete.athlete_name}-business-card.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download started",
        description: "Your business card is being downloaded.",
        status: "info",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (!canUseFeature) {
    return (
      <Card>
        <CardBody>
          <VStack spacing={4} textAlign="center">
            <Box color="gray.400">
              <CreditCard size={48} />
            </Box>
            <Box>
              <Heading size="md" mb={2}>
                Business Card Generator
              </Heading>
              <Text color="gray.600" mb={4}>
                Create professional business cards with QR codes linking to your profile
              </Text>
              <Badge colorScheme="purple" variant="outline">
                Pro Feature
              </Badge>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Box>
              <Heading size="md">Business Card Generator</Heading>
              <Text color="gray.600">Create professional business cards with QR codes</Text>
            </Box>
            <HStack spacing={2}>
              {isConnected && (
                <Badge colorScheme="green" variant="solid">
                  Connected
                </Badge>
              )}
              <Badge colorScheme="purple" variant="solid">
                Pro
              </Badge>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            {!isConnected && (
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">Connect to Canva</Text>
                  <Text fontSize="sm">
                    You'll need to authorize with Canva to generate professional business cards.
                  </Text>
                </Box>
              </Alert>
            )}

            <Text fontSize="sm" color="gray.600">
              Generate professional business cards featuring your athletic profile, complete with QR codes that link
              directly to your RecruitMyGame profile.
            </Text>

            <HStack spacing={2} fontSize="sm" color="gray.500" w="full" justify="center">
              <QrCode size={16} />
              <Text>Includes QR code to your profile</Text>
            </HStack>

            {generatedCard ? (
              <VStack spacing={3} w="full">
                <Box borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                  <Image src={generatedCard || "/placeholder.svg"} alt="Generated Business Card" w="full" />
                </Box>
                <HStack spacing={2} w="full">
                  <Button leftIcon={<Download size={16} />} colorScheme="green" onClick={downloadCard} flex={1}>
                    Download Card
                  </Button>
                  <Button variant="outline" onClick={onOpen} flex={1}>
                    Generate New
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <Button leftIcon={<CreditCard size={16} />} colorScheme="purple" onClick={onOpen} w="full">
                Generate Business Card
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Business Card Generator Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <CreditCard size={20} />
              <Text>Generate Business Card</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6}>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Choose a design template and customize what information appears on your professional business card.
              </Text>

              {/* Card Options */}
              <Box w="full" p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="medium" mb={3} fontSize="sm">
                  Card Information
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Mail size={16} />
                      <Text fontSize="sm">Include Email</Text>
                      {!athlete.email && (
                        <Badge size="sm" colorScheme="orange">
                          Not Set
                        </Badge>
                      )}
                    </HStack>
                    <Switch
                      isChecked={cardOptions.includeEmail}
                      onChange={(e) => setCardOptions({ ...cardOptions, includeEmail: e.target.checked })}
                      isDisabled={!athlete.email}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Phone size={16} />
                      <Text fontSize="sm">Include Phone</Text>
                      {!athlete.phone && (
                        <Badge size="sm" colorScheme="orange">
                          Not Set
                        </Badge>
                      )}
                    </HStack>
                    <Switch
                      isChecked={cardOptions.includePhone}
                      onChange={(e) => setCardOptions({ ...cardOptions, includePhone: e.target.checked })}
                      isDisabled={!athlete.phone}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <QrCode size={16} />
                      <Text fontSize="sm">Include QR Code</Text>
                    </HStack>
                    <Switch
                      isChecked={cardOptions.includeQR}
                      onChange={(e) => setCardOptions({ ...cardOptions, includeQR: e.target.checked })}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      {cardOptions.includePhoto ? <Eye size={16} /> : <EyeOff size={16} />}
                      <Text fontSize="sm">Include Profile Photo</Text>
                      {!athlete.profile_picture_url && (
                        <Badge size="sm" colorScheme="orange">
                          Not Set
                        </Badge>
                      )}
                    </HStack>
                    <Switch
                      isChecked={cardOptions.includePhoto}
                      onChange={(e) => setCardOptions({ ...cardOptions, includePhoto: e.target.checked })}
                      isDisabled={!athlete.profile_picture_url}
                    />
                  </HStack>
                </VStack>
              </Box>

              <Divider />

              <FormControl>
                <FormLabel>Card Design</FormLabel>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  {CARD_DESIGNS.map((design) => (
                    <GridItem key={design.id}>
                      <Box
                        borderRadius="md"
                        overflow="hidden"
                        border="2px solid"
                        borderColor={selectedDesign === design.id ? "purple.500" : "gray.200"}
                        cursor="pointer"
                        onClick={() => setSelectedDesign(design.id)}
                        transition="all 0.2s"
                        _hover={{ borderColor: "purple.300" }}
                      >
                        <Image
                          src={design.preview || "/placeholder.svg"}
                          alt={design.name}
                          w="full"
                          h="120px"
                          objectFit="cover"
                        />
                        <Box p={3}>
                          <Text fontWeight="medium" fontSize="sm">
                            {design.name}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {design.description}
                          </Text>
                        </Box>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </FormControl>

              <Box p={4} bg="purple.50" borderRadius="md" w="full">
                <Text fontSize="sm" color="purple.700" fontWeight="medium" mb={2}>
                  📱 Your card will include:
                </Text>
                <VStack align="start" spacing={1} fontSize="xs" color="purple.600">
                  <Text>• Your name and sport</Text>
                  <Text>• School/organization (if provided)</Text>
                  {cardOptions.includeEmail && athlete.email && <Text>• Email address</Text>}
                  {cardOptions.includePhone && athlete.phone && <Text>• Phone number</Text>}
                  {cardOptions.includeQR && <Text>• QR code linking to your profile</Text>}
                  {cardOptions.includePhoto && athlete.profile_picture_url && <Text>• Profile photo</Text>}
                  <Text>• Professional design layout</Text>
                  <Text>• High-resolution download (300 DPI)</Text>
                </VStack>
              </Box>

              <Button
                colorScheme="purple"
                onClick={generateBusinessCard}
                w="full"
                isLoading={generating}
                loadingText="Generating..."
                leftIcon={<CreditCard size={16} />}
              >
                Generate Business Card
              </Button>

              <Text fontSize="xs" color="gray.500" textAlign="center">
                Your business card will be generated using Canva's professional templates and delivered as a
                high-quality PNG file ready for printing or digital sharing.
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
