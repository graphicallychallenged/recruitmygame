"use client"

import { useState, useEffect } from "react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Checkbox,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Box,
  Divider,
  Icon,
} from "@chakra-ui/react"
import { Bell, Mail, Video, ImageIcon, Calendar, Star, Trophy } from "lucide-react"

interface NotificationType {
  id: string
  type: string
  name: string
  description: string
  required_tier: string
  is_active: boolean
}

interface ProfileUpdateSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  athleteId: string
  athleteName: string
  athleteTier: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  cardBgColor: string
  borderColor: string
  isDarkTheme: boolean
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "new_video":
      return Video
    case "new_photos":
      return ImageIcon
    case "schedule_updates":
      return Calendar
    case "new_reviews":
      return Star
    case "new_awards":
      return Trophy
    default:
      return Bell
  }
}

export function ProfileUpdateSubscriptionModal({
  isOpen,
  onClose,
  athleteId,
  athleteName,
  athleteTier,
  primaryColor,
  secondaryColor,
  textColor,
  cardBgColor,
  borderColor,
  isDarkTheme,
}: ProfileUpdateSubscriptionModalProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchNotificationTypes()
    }
  }, [isOpen, athleteId])

  const fetchNotificationTypes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/notifications/types?athleteId=${athleteId}`)
      if (!response.ok) throw new Error("Failed to fetch notification types")

      const data = await response.json()
      setNotificationTypes(data.types || [])

      // Auto-select all available types by default
      setSelectedTypes(data.types?.map((type: NotificationType) => type.type) || [])
    } catch (error) {
      console.error("Error fetching notification types:", error)
      toast({
        title: "Error",
        description: "Failed to load notification options",
        status: "error",
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!email || selectedTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please enter your email and select at least one notification type",
        status: "error",
        duration: 3000,
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          athleteId,
          email,
          name: name || null,
          notificationTypes: selectedTypes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      toast({
        title: "Success!",
        description: "Please check your email to verify your subscription",
        status: "success",
        duration: 5000,
      })

      onClose()
      setEmail("")
      setName("")
      setSelectedTypes([])
    } catch (error) {
      console.error("Error subscribing:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe",
        status: "error",
        duration: 3000,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handleSelectAll = () => {
    if (selectedTypes.length === notificationTypes.length) {
      setSelectedTypes([])
    } else {
      setSelectedTypes(notificationTypes.map((type) => type.type))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg={cardBgColor} borderColor={borderColor} border="1px">
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Icon as={Bell} boxSize={6} color={primaryColor} />
            <Box>
              <Text color={textColor} fontSize="lg" fontWeight="bold">
                Get Updates from {athleteName}
              </Text>
              <Text fontSize="sm" fontWeight="normal" color="gray.500">
                Subscribe to receive email notifications about profile updates
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color={textColor} />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            <Alert
              status="info"
              bg={isDarkTheme ? "blue.900" : "blue.50"}
              borderColor={isDarkTheme ? "blue.700" : "blue.200"}
              border="1px"
            >
              <AlertIcon color={primaryColor} />
              <Box>
                <AlertTitle fontSize="sm" color={textColor}>
                  Stay Connected
                </AlertTitle>
                <AlertDescription fontSize="xs" color={textColor} opacity={0.8}>
                  Get notified when {athleteName} adds new content or updates their profile
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color={textColor} fontWeight="semibold">
                  Email Address
                </FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  bg={isDarkTheme ? "gray.700" : "white"}
                  color={textColor}
                  borderColor={borderColor}
                  _hover={{ borderColor: primaryColor }}
                  _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                />
                <FormHelperText color="gray.500">
                  We'll send a verification email to confirm your subscription
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="semibold">
                  Your Name (Optional)
                </FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  bg={isDarkTheme ? "gray.700" : "white"}
                  color={textColor}
                  borderColor={borderColor}
                  _hover={{ borderColor: primaryColor }}
                  _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                />
                <FormHelperText color="gray.500">Help us personalize your notifications</FormHelperText>
              </FormControl>
            </VStack>

            <Divider borderColor={borderColor} />

            <Box>
              <HStack justify="space-between" mb={4}>
                <Text fontWeight="bold" color={textColor} fontSize="md">
                  Choose Your Notifications
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  color={primaryColor}
                  onClick={handleSelectAll}
                  _hover={{ bg: isDarkTheme ? "gray.700" : "gray.100" }}
                >
                  {selectedTypes.length === notificationTypes.length ? "Deselect All" : "Select All"}
                </Button>
              </HStack>

              {loading ? (
                <VStack spacing={3}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} h="60px" bg="gray.200" borderRadius="md" w="full" />
                  ))}
                </VStack>
              ) : (
                <VStack spacing={3} align="stretch">
                  {notificationTypes.map((type) => {
                    const IconComponent = getNotificationIcon(type.type)
                    const isSelected = selectedTypes.includes(type.type)

                    return (
                      <HStack
                        key={type.id}
                        justify="space-between"
                        p={4}
                        bg={isSelected ? (isDarkTheme ? "gray.700" : "gray.50") : "transparent"}
                        borderRadius="lg"
                        border="2px"
                        borderColor={isSelected ? primaryColor : borderColor}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{
                          borderColor: primaryColor,
                          bg: isDarkTheme ? "gray.700" : "gray.50",
                        }}
                        onClick={() => handleTypeToggle(type.type)}
                      >
                        <HStack spacing={3} flex={1}>
                          <Icon as={IconComponent} boxSize={5} color={isSelected ? primaryColor : "gray.500"} />
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="semibold" color={textColor} fontSize="sm">
                              {type.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500" lineHeight="short">
                              {type.description}
                            </Text>
                          </VStack>
                        </HStack>
                        <Checkbox
                          isChecked={isSelected}
                          onChange={() => handleTypeToggle(type.type)}
                          colorScheme="blue"
                          size="lg"
                        />
                      </HStack>
                    )
                  })}
                </VStack>
              )}
            </Box>

            <Alert
              status="warning"
              size="sm"
              bg={isDarkTheme ? "orange.900" : "orange.50"}
              borderColor={isDarkTheme ? "orange.700" : "orange.200"}
              border="1px"
            >
              <AlertIcon />
              <AlertDescription fontSize="xs" color={textColor} opacity={0.8}>
                You can unsubscribe at any time using the link in any notification email
              </AlertDescription>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            color={textColor}
            _hover={{ bg: isDarkTheme ? "gray.700" : "gray.100" }}
          >
            Cancel
          </Button>
          <Button
            bg={primaryColor}
            color="white"
            onClick={handleSubmit}
            isLoading={submitting}
            loadingText="Subscribing..."
            isDisabled={!email || selectedTypes.length === 0}
            leftIcon={<Mail size={16} />}
            _hover={{ opacity: 0.9 }}
            _active={{ transform: "scale(0.98)" }}
          >
            Subscribe to Updates
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
