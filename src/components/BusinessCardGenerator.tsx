"use client"

import { useState } from "react"
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
} from "@chakra-ui/react"
import { CreditCard, Download, QrCode } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

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
  }
  subscription_tier: SubscriptionTier
}

interface CardDesign {
  id: string
  name: string
  preview: string
  description: string
}

const CARD_DESIGNS: CardDesign[] = [
  {
    id: "modern",
    name: "Modern",
    preview: "/placeholder.svg?height=200&width=350&text=Modern+Design",
    description: "Clean, professional design with bold typography",
  },
  {
    id: "athletic",
    name: "Athletic",
    preview: "/placeholder.svg?height=200&width=350&text=Athletic+Design",
    description: "Sports-focused design with dynamic elements",
  },
  {
    id: "classic",
    name: "Classic",
    preview: "/placeholder.svg?height=200&width=350&text=Classic+Design",
    description: "Traditional business card layout",
  },
  {
    id: "bold",
    name: "Bold",
    preview: "/placeholder.svg?height=200&width=350&text=Bold+Design",
    description: "Eye-catching design with vibrant colors",
  },
]

export function BusinessCardGenerator({ athlete, subscription_tier }: BusinessCardGeneratorProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedDesign, setSelectedDesign] = useState<string>("modern")
  const [generating, setGenerating] = useState(false)
  const [generatedCard, setGeneratedCard] = useState<string | null>(null)
  const toast = useToast()
  const supabase = createClient()

  const canUseFeature = subscription_tier === "pro"

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
      // Generate QR code URL (in a real app, this would be a proper QR code service)
      const profileUrl = `${window.location.origin}/${athlete.username}`
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`

      // Generate the business card (in a real app, this would create an actual card image)
      const cardData = {
        athlete_name: athlete.athlete_name,
        sport: athlete.sport,
        school: athlete.school,
        profile_url: profileUrl,
        qr_code_url: qrCodeUrl,
        design: selectedDesign,
        profile_picture: athlete.profile_picture_url,
      }

      // For demo purposes, we'll create a placeholder card URL
      const cardUrl = `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(`${athlete.athlete_name} - ${athlete.sport} Business Card`)}`
      setGeneratedCard(cardUrl)

      console.log("Business card generated:", cardData)

      toast({
        title: "Business card generated!",
        description: "Your professional business card is ready for download.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error: any) {
      console.error("Error generating business card:", error)
      toast({
        title: "Error generating card",
        description: "Please try again later.",
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
      // In a real app, this would download the actual card file
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
            <Badge colorScheme="purple" variant="solid">
              Pro
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
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
                Choose a design template for your professional business card. Your card will include your name, sport,
                school, and a QR code linking to your profile.
              </Text>

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
                  <Text>• QR code linking to your profile</Text>
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
                Your business card will be generated as a high-quality PNG file ready for printing or digital sharing.
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
