"use client"

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  List,
  ListItem,
  ListIcon,
  Grid,
  GridItem,
  useToast,
} from "@chakra-ui/react"
import { Check, Star, Crown } from "lucide-react"
import { SUBSCRIPTION_LIMITS, SUBSCRIPTION_PRICES, type SubscriptionTier } from "@/utils/subscription"

interface SubscriptionUpgradeProps {
  currentTier: SubscriptionTier
  onUpgrade?: (tier: SubscriptionTier) => void
}

export function SubscriptionUpgrade({ currentTier, onUpgrade }: SubscriptionUpgradeProps) {
  const toast = useToast()

  const handleUpgrade = (tier: SubscriptionTier) => {
    // In a real app, this would integrate with Stripe
    toast({
      title: "Upgrade Coming Soon",
      description: `${tier.toUpperCase()} subscription will be available soon!`,
      status: "info",
      duration: 3000,
      isClosable: true,
    })
    onUpgrade?.(tier)
  }

  const plans = [
    {
      name: "Free",
      tier: "free" as SubscriptionTier,
      price: 0,
      icon: null,
      color: "gray",
      features: [
        `${SUBSCRIPTION_LIMITS.free.videos} videos`,
        `${SUBSCRIPTION_LIMITS.free.photos} photos`,
        "Basic profile",
        "Public profile link",
      ],
    },
    {
      name: "Premium",
      tier: "premium" as SubscriptionTier,
      price: SUBSCRIPTION_PRICES.premium.monthly,
      icon: Star,
      color: "blue",
      popular: true,
      features: [
        `${SUBSCRIPTION_LIMITS.premium.videos} videos`,
        `${SUBSCRIPTION_LIMITS.premium.photos} photos`,
        "Custom colors & themes",
        "Profile analytics",
        "Priority listing",
        "Email support",
      ],
    },
    {
      name: "Pro",
      tier: "pro" as SubscriptionTier,
      price: SUBSCRIPTION_PRICES.pro.monthly,
      icon: Crown,
      color: "purple",
      features: [
        `${SUBSCRIPTION_LIMITS.pro.videos} videos`,
        `${SUBSCRIPTION_LIMITS.pro.photos} photos`,
        "Advanced customization",
        "Detailed analytics",
        "Custom domain",
        "Priority support",
        "Coach contact tools",
      ],
    },
  ]

  return (
    <Box>
      <VStack spacing={6} mb={8} textAlign="center">
        <Heading size="lg">Choose Your Plan</Heading>
        <Text color="gray.600" maxW="2xl">
          Upgrade your profile to unlock more features and get better visibility with college coaches.
        </Text>
      </VStack>

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
        {plans.map((plan) => (
          <GridItem key={plan.tier}>
            <Card
              position="relative"
              h="full"
              border={plan.popular ? "2px" : "1px"}
              borderColor={plan.popular ? "blue.500" : "gray.200"}
              shadow={plan.popular ? "lg" : "md"}
            >
              {plan.popular && (
                <Badge
                  position="absolute"
                  top="-10px"
                  left="50%"
                  transform="translateX(-50%)"
                  colorScheme="teal"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  Most Popular
                </Badge>
              )}

              <CardHeader textAlign="center" pb={4}>
                <VStack spacing={2}>
                  {plan.icon && (
                    <Box color={`${plan.color}.500`}>
                      <plan.icon size={32} />
                    </Box>
                  )}
                  <Heading size="md">{plan.name}</Heading>
                  <HStack align="baseline">
                    <Text fontSize="3xl" fontWeight="bold">
                      ${plan.price}
                    </Text>
                    {plan.price > 0 && (
                      <Text color="gray.500" fontSize="sm">
                        /month
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </CardHeader>

              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  <List spacing={2}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} fontSize="sm">
                        <ListIcon as={Check} color="green.500" />
                        {feature}
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    colorScheme={plan.color}
                    variant={currentTier === plan.tier ? "outline" : "solid"}
                    size="lg"
                    width="full"
                    isDisabled={currentTier === plan.tier}
                    onClick={() => handleUpgrade(plan.tier)}
                  >
                    {currentTier === plan.tier ? "Current Plan" : plan.tier === "free" ? "Downgrade" : "Upgrade"}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <Box mt={8} textAlign="center">
        <Text fontSize="sm" color="gray.500">
          All plans include a 7-day free trial. Cancel anytime.
        </Text>
      </Box>
    </Box>
  )
}
