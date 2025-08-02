"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Text,
  HStack,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  Link,
  useColorModeValue,
  Portal,
} from "@chakra-ui/react"
import { Settings, Cookie } from "lucide-react"
import {
  getCookieConsent,
  setCookieConsent,
  isBannerDismissed,
  setBannerDismissed,
  defaultConsent,
  type CookieConsent,
} from "@/utils/cookieConsent"

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const textColor = useColorModeValue("gray.800", "white")

  useEffect(() => {
    // Check if banner should be shown
    const dismissed = isBannerDismissed()
    const currentConsent = getCookieConsent()

    setConsent(currentConsent)
    setShowBanner(!dismissed)
  }, [])

  const handleAcceptAll = () => {
    const newConsent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: Date.now(),
    }

    setCookieConsent(newConsent)
    setBannerDismissed()
    setShowBanner(false)

    // Dispatch event for analytics tracker
    window.dispatchEvent(
      new CustomEvent("cookiePreferencesChanged", {
        detail: newConsent,
      }),
    )
  }

  const handleAcceptEssential = () => {
    setCookieConsent(defaultConsent)
    setBannerDismissed()
    setShowBanner(false)

    // Dispatch event for analytics tracker
    window.dispatchEvent(
      new CustomEvent("cookiePreferencesChanged", {
        detail: defaultConsent,
      }),
    )
  }

  const handleSavePreferences = () => {
    setCookieConsent(consent)
    setBannerDismissed()
    setShowBanner(false)
    onClose()

    // Dispatch event for analytics tracker
    window.dispatchEvent(
      new CustomEvent("cookiePreferencesChanged", {
        detail: consent,
      }),
    )
  }

  const handleConsentChange = (type: keyof CookieConsent, value: boolean) => {
    setConsent((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  if (!showBanner) return null

  return (
    <Portal>
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg={bgColor}
        borderTop="1px solid"
        borderColor={borderColor}
        p={4}
        zIndex={9999}
        boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
      >
        <VStack spacing={4} align="stretch" maxW="6xl" mx="auto">
          <HStack spacing={2}>
            <Cookie size={20} />
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              We use cookies to enhance your experience
            </Text>
          </HStack>

          <Text fontSize="sm" color={textColor}>
            We use essential cookies for basic functionality and optional cookies for analytics and marketing. Analytics
            cookies help PRO athletes understand their profile visitors. You can customize your preferences anytime.{" "}
            <Link href="/cookies" color="blue.500" textDecoration="underline">
              Learn more
            </Link>
          </Text>

          <HStack spacing={3} flexWrap="wrap">
            <Button size="sm" colorScheme="blue" onClick={handleAcceptAll}>
              Accept All
            </Button>

            <Button size="sm" variant="outline" onClick={handleAcceptEssential}>
              Essential Only
            </Button>

            <Button size="sm" variant="ghost" leftIcon={<Settings size={16} />} onClick={onOpen}>
              Customize
            </Button>
          </HStack>
        </VStack>

        {/* Cookie Preferences Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Cookie Preferences</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  Customize which cookies you'd like to allow. Essential cookies are always enabled as they're required
                  for the website to function properly.
                </Text>

                <Divider />

                {/* Essential Cookies */}
                <FormControl>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1} flex={1}>
                      <FormLabel mb={0} fontWeight="medium">
                        Essential Cookies
                      </FormLabel>
                      <Text fontSize="sm" color="gray.600">
                        Required for basic website functionality, security, and user authentication.
                      </Text>
                    </VStack>
                    <Switch isChecked={true} isDisabled={true} colorScheme="blue" />
                  </HStack>
                </FormControl>

                <Divider />

                {/* Analytics Cookies */}
                <FormControl>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1} flex={1}>
                      <FormLabel mb={0} fontWeight="medium">
                        Analytics Cookies
                      </FormLabel>
                      <Text fontSize="sm" color="gray.600">
                        Help PRO athletes understand visitor behavior and improve their profiles. Only available for PRO
                        accounts.
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={consent.analytics}
                      onChange={(e) => handleConsentChange("analytics", e.target.checked)}
                      colorScheme="blue"
                    />
                  </HStack>
                </FormControl>

                <Divider />

                {/* Marketing Cookies */}
                <FormControl>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1} flex={1}>
                      <FormLabel mb={0} fontWeight="medium">
                        Marketing Cookies
                      </FormLabel>
                      <Text fontSize="sm" color="gray.600">
                        Used to deliver personalized content and advertisements relevant to your interests.
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={consent.marketing}
                      onChange={(e) => handleConsentChange("marketing", e.target.checked)}
                      colorScheme="blue"
                    />
                  </HStack>
                </FormControl>

                <Divider />

                {/* Preferences Cookies */}
                <FormControl>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1} flex={1}>
                      <FormLabel mb={0} fontWeight="medium">
                        Preference Cookies
                      </FormLabel>
                      <Text fontSize="sm" color="gray.600">
                        Remember your settings and preferences for a better user experience.
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={consent.preferences}
                      onChange={(e) => handleConsentChange("preferences", e.target.checked)}
                      colorScheme="blue"
                    />
                  </HStack>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Portal>
  )
}
