"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  VStack,
  Text,
  Heading,
  Card,
  CardBody,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Flex,
} from "@chakra-ui/react"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { AthleteProfile } from "@/types/database"
import { SubscriptionPlans } from "@/components/SubscriptionPlans"

export default function SubscriptionPage() {
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const toast = useToast()
  const router = useRouter()

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

      const { data: athleteData, error } = await supabase.from("athletes").select("*").eq("user_id", user.id).single()

      if (error) {
        console.error("Error fetching athlete:", error)
        return
      }

      setAthlete(athleteData)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!athlete) return

    if (planId === "free") {
      // Handle downgrade to free
      setProcessingPlan(planId)
      try {
        const { error } = await supabase
          .from("athletes")
          .update({
            subscription_tier: "free",
            subscription_status: "active",
          })
          .eq("id", athlete.id)

        if (error) throw error

        toast({
          title: "Plan Updated",
          description: "You've been downgraded to the Free plan.",
          status: "success",
          duration: 3000,
          isClosable: true,
        })

        // Refresh athlete data
        await fetchAthleteData()
      } catch (error: any) {
        console.error("Error downgrading to free:", error)
        toast({
          title: "Error",
          description: "Failed to downgrade to free plan. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setProcessingPlan(null)
      }
      return
    }

    setProcessingPlan(planId)

    try {
      const priceId =
        planId === "premium"
          ? process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID
          : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: athlete.user_id,
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setProcessingPlan(null)
    }
  }

  const handleManageBilling = async () => {
    if (!athlete) return

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: athlete.stripe_customer_id,
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      console.error("Error creating portal session:", error)
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (loading) {
    return (
      <Container maxW="6xl" py={8}>
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Container>
    )
  }

  if (!athlete) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Profile not found!</AlertTitle>
          <AlertDescription>Unable to load your athlete profile. Please try refreshing the page.</AlertDescription>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Back to Dashboard Button */}
        <Box>
          <Button as={Link} href="/dashboard" leftIcon={<ArrowLeft />} variant="ghost" colorScheme="teal">
            Back to Dashboard
          </Button>
        </Box>

        {/* Subscription Plans Component */}
        <SubscriptionPlans
          athlete={athlete}
          showCurrentPlan={true}
          onSubscribe={handleSubscribe}
          onManageBilling={handleManageBilling}
          processingPlan={processingPlan}
          variant="subscription"
        />

        {/* FAQ Section */}
        <Box>
          <Heading size="lg" mb={6} textAlign="center">
            Frequently Asked Questions
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <GridItem>
              <Card>
                <CardBody>
                  <Heading size="sm" mb={2}>
                    Can I change plans anytime?
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for
                    upgrades, or at the end of your billing cycle for downgrades.
                  </Text>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card>
                <CardBody>
                  <Heading size="sm" mb={2}>
                    What happens to my content if I downgrade?
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Your content remains safe, but some features may become unavailable. You can always upgrade again to
                    regain full access.
                  </Text>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card>
                <CardBody>
                  <Heading size="sm" mb={2}>
                    Is there a free trial?
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    The Free plan gives you access to core features forever. You can upgrade anytime to unlock premium
                    features.
                  </Text>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card>
                <CardBody>
                  <Heading size="sm" mb={2}>
                    How do I cancel my subscription?
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    You can cancel anytime through the billing portal. Your subscription remains active until the end of
                    your billing period.
                  </Text>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </Box>
      </VStack>
    </Container>
  )
}
