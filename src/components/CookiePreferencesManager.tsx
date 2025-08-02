"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Switch,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
  useToast,
} from "@chakra-ui/react"
import { Cookie, Shield, BarChart3, Target, SettingsIcon } from "lucide-react"
import { getCookieConsent, setCookieConsent, resetCookieConsent, type CookieConsent } from "@/utils/cookieConsent"

export function CookiePreferencesManager() {
  const [consent, setConsent] = useState<CookieConsent>(getCookieConsent())
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    // Update state when consent changes
    const handleConsentChange = (event: CustomEvent) => {
      setConsent(event.detail)
    }

    window.addEventListener("cookieConsentChanged", handleConsentChange as EventListener)
    return () => window.removeEventListener("cookieConsentChanged", handleConsentChange as EventListener)
  }, [])

  const handleConsentChange = (type: keyof CookieConsent, value: boolean) => {
    if (type === "essential") return // Essential cookies cannot be disabled
    setConsent((prev) => ({ ...prev, [type]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      setCookieConsent(consent)
      toast({
        title: "Cookie preferences updated",
        description: "Your cookie preferences have been saved successfully.",
        status: "success",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error updating preferences",
        description: "Failed to save cookie preferences. Please try again.",
        status: "error",
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    resetCookieConsent()
    setConsent(getCookieConsent())
    toast({
      title: "Cookie preferences reset",
      description: "Your cookie preferences have been reset to defaults.",
      status: "info",
      duration: 3000,
    })
  }

  const cookieTypes = [
    {
      key: "essential" as keyof CookieConsent,
      icon: Shield,
      title: "Essential Cookies",
      description:
        "Required for basic site functionality, security, and user authentication. These cannot be disabled.",
      required: true,
      examples: "Login sessions, security tokens, form submissions",
    },
    {
      key: "analytics" as keyof CookieConsent,
      icon: BarChart3,
      title: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website to improve user experience.",
      required: false,
      examples: "Page views, session duration, popular content",
    },
    {
      key: "marketing" as keyof CookieConsent,
      icon: Target,
      title: "Marketing Cookies",
      description: "Used to deliver personalized advertisements and track marketing campaign effectiveness.",
      required: false,
      examples: "Ad targeting, conversion tracking, social media integration",
    },
    {
      key: "preferences" as keyof CookieConsent,
      icon: SettingsIcon,
      title: "Preference Cookies",
      description: "Remember your settings and preferences to provide a personalized experience.",
      required: false,
      examples: "Theme preferences, language settings, layout choices",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <HStack spacing={3}>
          <Cookie size={24} />
          <VStack align="start" spacing={1}>
            <Heading size="md">Cookie Preferences</Heading>
            <Text fontSize="sm" color="gray.600">
              Manage how we use cookies when you visit athlete profiles
            </Text>
          </VStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Alert status="info" size="sm">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <AlertTitle fontSize="sm">About Cookies</AlertTitle>
              <AlertDescription fontSize="xs">
                These preferences apply when you visit public athlete profiles. They help us provide better experiences
                while respecting your privacy choices.
              </AlertDescription>
            </VStack>
          </Alert>

          <VStack spacing={4} align="stretch">
            {cookieTypes.map((cookieType) => {
              const IconComponent = cookieType.icon
              const isEnabled = consent[cookieType.key]

              return (
                <Card key={cookieType.key} variant="outline" size="sm">
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between" align="flex-start">
                        <HStack spacing={3} flex={1}>
                          <IconComponent size={20} />
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack spacing={2}>
                              <Text fontWeight="semibold">{cookieType.title}</Text>
                              {cookieType.required && (
                                <Badge colorScheme="red" size="sm">
                                  Required
                                </Badge>
                              )}
                              {!cookieType.required && isEnabled && (
                                <Badge colorScheme="green" size="sm">
                                  Enabled
                                </Badge>
                              )}
                              {!cookieType.required && !isEnabled && (
                                <Badge colorScheme="gray" size="sm">
                                  Disabled
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {cookieType.description}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              <strong>Examples:</strong> {cookieType.examples}
                            </Text>
                          </VStack>
                        </HStack>
                        <Switch
                          isChecked={isEnabled}
                          isDisabled={cookieType.required}
                          onChange={(e) => handleConsentChange(cookieType.key, e.target.checked)}
                          colorScheme="teal"
                        />
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )
            })}
          </VStack>

          <Divider />

          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" color="gray.600">
              <strong>Last updated:</strong> {new Date(consent.timestamp).toLocaleString()}
            </Text>

            <HStack spacing={3} justify="flex-end">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset to Defaults
              </Button>
              <Button colorScheme="teal" size="sm" onClick={handleSave} isLoading={saving}>
                Save Preferences
              </Button>
            </HStack>
          </VStack>

          <Alert status="warning" size="sm">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <AlertTitle fontSize="sm">Privacy Notice</AlertTitle>
              <AlertDescription fontSize="xs">
                Disabling certain cookies may limit functionality. Essential cookies are always active to ensure basic
                site operations. For more details, see our{" "}
                <Text as="span" color="teal.500" textDecoration="underline">
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </Text>
                .
              </AlertDescription>
            </VStack>
          </Alert>
        </VStack>
      </CardBody>
    </Card>
  )
}
