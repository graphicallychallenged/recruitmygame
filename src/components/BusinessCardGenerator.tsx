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
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
} from "@chakra-ui/react"
import { CreditCard, Download, QrCode } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useSearchParams } from "next/navigation"
import { CanvaConnectionStatus } from "./business-cards/CanvaConnectionStatus"
import { CardOptionsForm } from "./business-cards/CardOptionsForm"
import { TemplateSelector } from "./business-cards/TemplateSelector"
import type { CardDesign, CardOptions, AthleteCardData, SubscriptionTier } from "@/types/canva"

interface BusinessCardGeneratorProps {
  athlete: AthleteCardData
  subscription_tier: SubscriptionTier
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
      loadTemplates()
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
            {!isConnected ? (
              <CanvaConnectionStatus
                isConnected={false}
                onConnect={connectToCanva}
                onDisconnect={disconnectFromCanva}
                connecting={connecting}
                disconnecting={disconnecting}
              />
            ) : (
              <>
                <CanvaConnectionStatus
                  isConnected={true}
                  onConnect={connectToCanva}
                  onDisconnect={disconnectFromCanva}
                  connecting={connecting}
                  disconnecting={disconnecting}
                />

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
              </>
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

              <CardOptionsForm options={cardOptions} onChange={setCardOptions} athlete={athlete} />

              <Divider />

              <TemplateSelector
                templates={templates}
                selectedTemplate={selectedDesign}
                onSelectTemplate={setSelectedDesign}
                onRefresh={loadTemplates}
                loading={loadingTemplates}
              />

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
                isDisabled={!selectedDesign}
              >
                Generate Business Card
              </Button>

              <Text fontSize="xs" color="gray.500" textAlign="center">
                Your business card will be generated using your selected Canva template and delivered as a high-quality
                PNG file ready for printing or digital sharing.
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
