"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Button,
  Badge,
  List,
  ListItem,
  ListIcon,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Flex,
  Icon,
} from "@chakra-ui/react"
import { Check, X, Crown, Star, Zap, ArrowLeft } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { AthleteProfile } from "@/types/database"

interface PricingPlan {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  unavailable?: string[]
  popular?: boolean
  icon: any
  color: string
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with your athlete profile",
    icon: Star,
    color: "gray",
    features: [
      "5 Photos",
      "Public profile link",
      "Basic stats display",
      "Profile customization",
      "Mobile responsive design",
    ],
    unavailable: ["Videos", "Awards & Honors", "Reviews", "Custom theming", "Schedule management", "Analytics"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99",
    period: "per month",
    description: "Enhanced features for serious athletes",
    icon: Crown,
    color: "blue",
    popular: true,
    features: [
      "Everything in Free",
      "15 Photos (3x more)",
      "5 Videos",
      "Awards & Honors section",
      "Manual Reviews",
      "Custom theming",
      "Priority email support",
    ],
    unavailable: [
      "Unlimited content",
      "Schedule management",
      "Validated Reviews",
      "Custom URL",
      "Business Card Generator",
      "Analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19.99",
    period: "per month",
    description: "Complete solution for elite athletes and recruitment",
    icon: Zap,
    color: "purple",
    features: [
      "Everything in Premium",
      "Unlimited videos and images",
      "Schedule management",
      "Validated Reviews",
      "Custom URL",
      "Business Card Generator with QR Code",
      "Advanced Analytics",
      "Priority support",
    ],
  },
]

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

  const currentTier = athlete.subscription_tier || "free"

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Back to Dashboard Button */}
        <Box>
          <Button as={Link} href="/dashboard" leftIcon={<ArrowLeft />} variant="ghost" colorScheme="blue">
            Back to Dashboard
          </Button>
        </Box>

        {/* Header */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            Choose Your Plan
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
            Unlock powerful features to showcase your athletic achievements and connect with coaches and recruiters.
          </Text>
        </Box>

        {/* Current Plan Status */}
        {currentTier !== "free" && (
          <Card bg="blue.50" borderColor="blue.200">
            <CardBody>
              <HStack justify="space-between" align="center">
                <Box>
                  <Text fontWeight="semibold" color="blue.700">
                    Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    {athlete.subscription_status === "active"
                      ? "Active subscription"
                      : "Subscription status: " + athlete.subscription_status}
                  </Text>
                </Box>
                <Button colorScheme="blue" variant="outline" onClick={handleManageBilling}>
                  Manage Billing
                </Button>
              </HStack>
            </CardBody>
          </Card>
        )}

        {/* Pricing Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {PRICING_PLANS.map((plan) => (
            <GridItem key={plan.id}>
              <Card
                h="full"
                position="relative"
                borderWidth={plan.popular ? "2px" : "1px"}
                borderColor={plan.popular ? "blue.500" : "gray.200"}
                bg={currentTier === plan.id ? "blue.50" : "white"}
              >
                {plan.popular && (
                  <Badge
                    position="absolute"
                    top="-10px"
                    left="50%"
                    transform="translateX(-50%)"
                    colorScheme="blue"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    Most Popular
                  </Badge>
                )}

                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    {/* Plan Header */}
                    <Box textAlign="center">
                      <HStack justify="center" mb={2}>
                        <Icon as={plan.icon} boxSize={6} color={`${plan.color}.500`} />
                        <Heading size="lg">{plan.name}</Heading>
                        {currentTier === plan.id && (
                          <Badge colorScheme="green" ml={2}>
                            Current
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="3xl" fontWeight="bold" color={`${plan.color}.500`}>
                        {plan.price}
                        <Text as="span" fontSize="sm" color="gray.500" ml={1}>
                          {plan.period}
                        </Text>
                      </Text>
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        {plan.description}
                      </Text>
                    </Box>

                    {/* Features */}
                    <Box>
                      <List spacing={2}>
                        {plan.features.map((feature, index) => (
                          <ListItem key={index} fontSize="sm">
                            <ListIcon as={Check} color="green.500" />
                            {feature}
                          </ListItem>
                        ))}
                        {plan.unavailable?.map((feature, index) => (
                          <ListItem key={`unavailable-${index}`} fontSize="sm" color="gray.400">
                            <ListIcon as={X} color="gray.400" />
                            {feature}
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    {/* Action Button */}
                    <Box pt={4}>
                      {currentTier === plan.id ? (
                        <Button w="full" colorScheme="green" variant="outline" isDisabled>
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          w="full"
                          colorScheme={plan.color}
                          onClick={() => handleSubscribe(plan.id)}
                          isLoading={processingPlan === plan.id}
                          loadingText="Processing..."
                        >
                          {plan.id === "free" ? "Downgrade to Free" : `Upgrade to ${plan.name}`}
                        </Button>
                      )}
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>

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
