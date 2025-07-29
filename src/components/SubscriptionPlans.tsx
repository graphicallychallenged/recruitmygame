"use client"
import {
  Box,
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
  Grid,
  GridItem,
  Icon,
} from "@chakra-ui/react"
import { Check, X, Crown, Star, Zap, ArrowRight } from "lucide-react"
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
      "Team History",
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
      "Business Card Generator with QR Code (250 cards)",
      "Advanced Analytics",
      "Priority support",
    ],
  },
]

interface SubscriptionPlansProps {
  athlete?: AthleteProfile | null
  showCurrentPlan?: boolean
  onSubscribe?: (planId: string) => void
  onManageBilling?: () => void
  processingPlan?: string | null
  variant?: "landing" | "subscription"
}

export function SubscriptionPlans({
  athlete,
  showCurrentPlan = false,
  onSubscribe,
  onManageBilling,
  processingPlan,
  variant = "subscription",
}: SubscriptionPlansProps) {
  const toast = useToast()
  const currentTier = athlete?.subscription_tier || "free"

  const handlePlanAction = (planId: string) => {
    if (variant === "landing") {
      // For landing page, redirect to subscription page
      window.location.href = "/subscription"
    } else if (onSubscribe) {
      // For subscription page, call the provided handler
      onSubscribe(planId)
    }
  }

  const getButtonText = (plan: PricingPlan) => {
    if (variant === "landing") {
      return plan.id === "free" ? "Get Started Free" : `Choose ${plan.name}`
    }

    if (currentTier === plan.id) {
      return "Current Plan"
    }

    return plan.id === "free" ? "Downgrade to Free" : `Upgrade to ${plan.name}`
  }

  const isButtonDisabled = (plan: PricingPlan) => {
    if (variant === "landing") return false
    return currentTier === plan.id
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <Box textAlign="center">
        <Heading size="xl" mb={4}>
          Choose Your Plan
        </Heading>
        <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
          {variant === "landing"
            ? "Start free and upgrade as your recruitment journey progresses"
            : "Unlock powerful features to showcase your athletic achievements and connect with coaches and recruiters."}
        </Text>
      </Box>

      {/* Current Plan Status - Only show on subscription page */}
      {showCurrentPlan && currentTier !== "free" && athlete && (
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
              {onManageBilling && (
                <Button colorScheme="blue" variant="outline" onClick={onManageBilling}>
                  Manage Billing
                </Button>
              )}
            </HStack>
          </CardBody>
        </Card>
      )}

      {/* Pricing Cards */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} maxW="6xl" mx="auto" pt={6}>
        {PRICING_PLANS.map((plan) => (
          <GridItem key={plan.id}>
            <Card
              h="full"
              position="relative"
              borderWidth={plan.popular ? "2px" : "1px"}
              borderColor={plan.popular ? "blue.500" : "gray.200"}
              bg={showCurrentPlan && currentTier === plan.id ? "blue.50" : "white"}
              shadow={variant === "landing" ? "xl" : "md"}
              borderRadius="2xl"
              overflow="visible"
              _hover={variant === "landing" ? { transform: "translateY(-8px)", shadow: "2xl" } : undefined}
              transition="all 0.3s"
            >
              {plan.popular && (
                <Badge
                  position="absolute"
                  top="-12px"
                  left="50%"
                  transform="translateX(-50%)"
                  colorScheme="blue"
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="bold"
                  zIndex={10}
                  boxShadow="md"
                >
                  {variant === "landing" ? "Most Popular" : "Most Popular"}
                </Badge>
              )}

              <CardBody p={variant === "landing" ? 8 : 6}>
                <VStack spacing={variant === "landing" ? 6 : 4} align="stretch">
                  {/* Plan Header */}
                  <Box textAlign="center">
                    <HStack justify="center" mb={2}>
                      <Icon as={plan.icon} boxSize={6} color={`${plan.color}.500`} />
                      <Heading size="lg">{plan.name}</Heading>
                      {showCurrentPlan && currentTier === plan.id && (
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
                    <Button
                      w="full"
                      colorScheme={plan.color}
                      size={variant === "landing" ? "lg" : "md"}
                      onClick={() => handlePlanAction(plan.id)}
                      isLoading={processingPlan === plan.id}
                      loadingText="Processing..."
                      isDisabled={isButtonDisabled(plan)}
                      rightIcon={variant === "landing" && plan.id !== "free" ? <ArrowRight size={16} /> : undefined}
                    >
                      {getButtonText(plan)}
                    </Button>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      {/* Trust Indicators - Only show on landing page */}
      {variant === "landing" && (
        <Box textAlign="center" pt={8}>
          <Text fontSize="sm" color="gray.500">
            All plans include a 7-day free trial. Cancel anytime.
          </Text>
        </Box>
      )}
    </VStack>
  )
}
