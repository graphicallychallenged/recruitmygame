"use client"

import { useState, useEffect } from "react"
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  Spinner,
  Badge,
  Divider,
} from "@chakra-ui/react"
import { Shield, Info } from "lucide-react"
import type { DataProcessingConsent } from "@/types/compliance"

interface ConsentManagerProps {
  onConsentChange?: (consents: DataProcessingConsent[]) => void
}

const CONSENT_TYPES = [
  {
    type: "essential" as const,
    title: "Essential Functionality",
    description: "Required for basic account operation, profile management, and core features",
    required: true,
  },
  {
    type: "analytics" as const,
    title: "Analytics & Performance",
    description: "Help us improve the platform by analyzing usage patterns and performance",
    required: false,
  },
  {
    type: "marketing" as const,
    title: "Marketing Communications",
    description: "Receive updates about new features, tips, and promotional content",
    required: false,
  },
  {
    type: "third_party" as const,
    title: "Third-Party Integrations",
    description: "Enable integrations with external services like Canva, social media platforms",
    required: false,
  },
]

export function ConsentManager({ onConsentChange }: ConsentManagerProps) {
  const [consents, setConsents] = useState<DataProcessingConsent[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    fetchConsents()
  }, [])

  const fetchConsents = async () => {
    try {
      const response = await fetch("/api/compliance/consent")
      if (!response.ok) throw new Error("Failed to fetch consents")

      const data = await response.json()
      setConsents(data.consents || [])
      onConsentChange?.(data.consents || [])
    } catch (error) {
      console.error("Error fetching consents:", error)
      toast({
        title: "Error",
        description: "Failed to load consent preferences",
        status: "error",
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const updateConsent = async (consentType: string, granted: boolean) => {
    setUpdating(consentType)
    try {
      const response = await fetch("/api/compliance/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consent_type: consentType,
          granted,
        }),
      })

      if (!response.ok) throw new Error("Failed to update consent")

      // Update local state
      setConsents((prev) => {
        const updated = prev.map((consent) =>
          consent.consent_type === consentType
            ? { ...consent, granted, updated_at: new Date().toISOString() }
            : consent,
        )

        // If consent doesn't exist, add it
        if (!prev.find((c) => c.consent_type === consentType)) {
          const consentInfo = CONSENT_TYPES.find((t) => t.type === consentType)
          updated.push({
            id: crypto.randomUUID(),
            user_id: "",
            consent_type: consentType as any,
            purpose: consentInfo?.description || "",
            granted,
            granted_at: granted ? new Date().toISOString() : undefined,
            withdrawn_at: !granted ? new Date().toISOString() : undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }

        onConsentChange?.(updated)
        return updated
      })

      toast({
        title: "Success",
        description: `${granted ? "Granted" : "Withdrawn"} consent for ${consentType}`,
        status: "success",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error updating consent:", error)
      toast({
        title: "Error",
        description: "Failed to update consent preference",
        status: "error",
        duration: 3000,
      })
    } finally {
      setUpdating(null)
    }
  }

  const getConsentStatus = (consentType: string) => {
    const consent = consents.find((c) => c.consent_type === consentType)
    return consent?.granted || false
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <Spinner size="lg" />
      </Box>
    )
  }

  return (
    <Card>
      <CardHeader>
        <HStack spacing={3}>
          <Shield size={24} />
          <VStack align="start" spacing={0}>
            <Heading size="md">Data Processing Consent</Heading>
            <Text fontSize="sm" color="gray.600">
              Control how your data is used and processed
            </Text>
          </VStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Alert status="info" size="sm">
            <AlertIcon />
            <AlertDescription fontSize="sm">
              You can withdraw consent at any time. Essential functionality consent is required for account operation.
            </AlertDescription>
          </Alert>

          {CONSENT_TYPES.map((consentType, index) => {
            const isGranted = getConsentStatus(consentType.type)
            const isUpdating = updating === consentType.type

            return (
              <Box key={consentType.type}>
                <HStack justify="space-between" align="start" spacing={4}>
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={2}>
                      <Text fontWeight="semibold">{consentType.title}</Text>
                      {consentType.required && (
                        <Badge colorScheme="red" size="sm">
                          Required
                        </Badge>
                      )}
                      {isGranted && (
                        <Badge colorScheme="green" size="sm">
                          Active
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {consentType.description}
                    </Text>
                  </VStack>

                  <Switch
                    isChecked={isGranted}
                    onChange={(e) => updateConsent(consentType.type, e.target.checked)}
                    isDisabled={consentType.required || isUpdating}
                    colorScheme="blue"
                  />
                </HStack>

                {index < CONSENT_TYPES.length - 1 && <Divider mt={4} />}
              </Box>
            )
          })}

          <Box pt={4} borderTop="1px" borderColor="gray.200">
            <HStack spacing={2} color="gray.500">
              <Info size={16} />
              <Text fontSize="xs">
                Last updated:{" "}
                {consents.length > 0
                  ? new Date(Math.max(...consents.map((c) => new Date(c.updated_at).getTime()))).toLocaleDateString()
                  : "Never"}
              </Text>
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
}
