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
  Switch,
  useToast,
  useDisclosure,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  Spinner,
} from "@chakra-ui/react"
import { CreditCard, Download, QrCode, Mail, Phone, Eye, EyeOff, RefreshCw, ExternalLink } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useSearchParams, useRouter } from "next/navigation"

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
  preview_url: string
  description: string
  canva_template_id: string
  created_at?: string
}

interface CardOptions {
  includeEmail: boolean
  includePhone: boolean
  includeQR: boolean
  includePhoto: boolean
}

export function BusinessCardGenerator({ athlete, subscription_tier }: BusinessCardGeneratorProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedDesign, setSelectedDesign] = useState<string>("")
  const [generating, setGenerating] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [generatedCard, setGeneratedCard] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [templates, setTemplates] = useState<CardDesign[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [hasShownConnectedToast, setHasShownConnectedToast] = useState(false)
  const [cardOptions, setCardOptions] = useState<CardOptions>({
    includeEmail: true,
    includePhone: true,
    includeQR: true,
    includePhoto: true,
  })

  const toast = useToast()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const canUseFeature = subscription_tier === "pro"

  useEffect(() => {
    // Check for OAuth callback results
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success === "connected" && !hasShownConnectedToast) {
      setIsConnected(true)
      loadTemplates()
      setHasShownConnectedToast(true)
      toast({
        title: "Connected to Canva!",
        description: "You can now generate professional business cards.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
      // Clear the URL parameters
      router.replace("/dashboard/business-cards")
    } else if (error && !hasShownConnectedToast) {
      setHasShownConnectedToast(true)
      toast({
        title: "Connection failed",
        description: "Failed to connect to Canva. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      // Clear the URL parameters
      router.replace("/dashboard/business-cards")
    }

    // Check if user is already connected
    checkCanvaConnection()
  }, [searchParams, hasShownConnectedToast])

  const checkCanvaConnection = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from("canva_tokens").select("expires_at").eq("user_id", user.id).single()

      if (data && new Date(data.expires_at) > new Date()) {
        setIsConnected(true)
        loadTemplates()
      }
    } catch (error) {
      console.error("Error checking Canva connection:", error)
    }
  }

  const connectToCanva = async () => {
    setConnecting(true)
    try {
      const response = await fetch("/api/canva/auth")
      const data = await response.json()

      if (data.auth_url) {
        window.location.href = data.auth_url
      } else {
        throw new Error("Failed to get authorization URL")
      }
    } catch (error: any) {
      console.error("Error connecting to Canva:", error)
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to Canva",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setConnecting(false)
    }
  }

  const disconnectFromCanva = async () => {
    setDisconnecting(true)
    try {
      const response = await fetch("/api/canva/disconnect", {
        method: "POST",
      })

      if (response.ok) {
        setIsConnected(false)
        setTemplates([])
        setGeneratedCard(null)
        setSelectedDesign("")
        setHasShownConnectedToast(false)
        toast({
          title: "Disconnected from Canva",
          description: "You can now connect with a different Canva account.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
      } else {
        throw new Error("Failed to disconnect")
      }
    } catch (error: any) {
      console.error("Error disconnecting from Canva:", error)
      toast({
        title: "Disconnect failed",
        description: error.message || "Failed to disconnect from Canva",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setDisconnecting(false)
    }
  }

  const loadTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const response = await fetch("/api/canva/templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
        if (data.templates?.length > 0) {
          setSelectedDesign(data.templates[0].canva_template_id)
        }
      } else {
        console.error("Failed to load templates")
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    } finally {
      setLoadingTemplates(false)
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

    if (!selectedDesign) {
      toast({
        title: "Select a template",
        description: "Please select a business card template first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setGenerating(true)
    try {
      const cardData = {
        template_id: selectedDesign,
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

      const response = await fetch("/api/canva/generate-business-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardData),
      })

      const result = await response.json()

      if (response.status === 401 && result.auth_url) {
        window.location.href = result.auth_url
        return
      }

      if (!response.ok) {
        throw new Error(result.error || "Generation failed")
      }

      if (result.success) {
        setGeneratedCard(result.preview_url || result.download_url)
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
            {!isConnected ? (
              <>
                <Alert status="info" colorScheme="teal">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="medium">Connect to Canva</Text>
                    <Text fontSize="sm">
                      You'll need to authorize with Canva to generate professional business cards.
                    </Text>
                  </Box>
                </Alert>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Generate professional business cards featuring your athletic profile, complete with QR codes that link
                  directly to your RecruitMyGame profile.
                </Text>

                <Button
                  leftIcon={<ExternalLink size={16} />}
                  colorScheme="purple"
                  onClick={connectToCanva}
                  isLoading={connecting}
                  loadingText="Connecting..."
                  w="full"
                >
                  Connect to Canva
                </Button>
              </>
            ) : (
              <>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">
                    Generate professional business cards featuring your athletic profile, complete with QR codes that
                    link directly to your RecruitMyGame profile.
                  </Text>
                  <Button
                    size="md"
                    padding={5}
                    variant="outline"
                    colorScheme="red"
                    onClick={disconnectFromCanva}
                    isLoading={disconnecting}
                    loadingText="Disconnecting..."
                  >
                    Disconnect
                  </Button>
                </HStack>

                <HStack spacing={2} fontSize="sm" color="gray.500" w="full" justify="center">
                  <QrCode size={16} />
                  <Text>Includes QR code to your profile</Text>
                </HStack>

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

                {/* Template Selection */}
                <Box w="full">
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="medium">Card Templates</Text>
                    <Button size="sm" variant="ghost" leftIcon={<RefreshCw size={14} />} onClick={loadTemplates}>
                      Refresh
                    </Button>
                  </HStack>

                  {loadingTemplates ? (
                    <VStack spacing={3} py={8}>
                      <Spinner size="lg" color="purple.500" />
                      <Text fontSize="sm" color="gray.600">
                        Loading your Canva templates...
                      </Text>
                    </VStack>
                  ) : templates.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="medium">No templates found</Text>
                        <Text fontSize="sm">
                          Create business card templates in Canva first, then refresh to see them here.
                        </Text>
                      </Box>
                    </Alert>
                  ) : (
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      {templates.map((template) => (
                        <GridItem key={template.id}>
                          <Box
                            borderRadius="md"
                            overflow="hidden"
                            border="2px solid"
                            borderColor={selectedDesign === template.canva_template_id ? "purple.500" : "gray.200"}
                            cursor="pointer"
                            onClick={() => setSelectedDesign(template.canva_template_id)}
                            transition="all 0.2s"
                            _hover={{ borderColor: "purple.300" }}
                          >
                            <Image
                              src={template.preview_url || "/placeholder.svg?height=120&width=200&text=Business+Card"}
                              alt={template.name}
                              w="full"
                              h="120px"
                              objectFit="cover"
                            />
                            <Box p={3}>
                              <Text fontWeight="medium" fontSize="sm">
                                {template.name}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                {template.description}
                              </Text>
                            </Box>
                          </Box>
                        </GridItem>
                      ))}
                    </Grid>
                  )}
                </Box>

                {generatedCard ? (
                  <VStack spacing={3} w="full">
                    <Box borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                      <Image src={generatedCard || "/placeholder.svg"} alt="Generated Business Card" w="full" />
                    </Box>
                    <HStack spacing={2} w="full">
                      <Button leftIcon={<Download size={16} />} colorScheme="green" onClick={downloadCard} flex={1}>
                        Download Card
                      </Button>
                      <Button variant="outline" onClick={() => setGeneratedCard(null)} flex={1}>
                        Generate New
                      </Button>
                    </HStack>
                  </VStack>
                ) : (
                  <Button
                    leftIcon={<CreditCard size={16} />}
                    colorScheme="purple"
                    onClick={generateBusinessCard}
                    w="full"
                    isLoading={generating}
                    loadingText="Generating..."
                    isDisabled={!selectedDesign}
                  >
                    Generate Business Card
                  </Button>
                )}
              </>
            )}
          </VStack>
        </CardBody>
      </Card>
    </>
  )
}
