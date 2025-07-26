"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Grid,
  Badge,
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  useColorModeValue,
  Spinner,
  Center,
} from "@chakra-ui/react"
import { Check, Star, Zap, Crown, ArrowRight, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client"
import { type SubscriptionTier, getTierColor, getTierDisplayName } from "@/utils/tierFeatures"

interface AthleteProfile {
  id: string
  subscription_tier: SubscriptionTier
  athlete_name: string
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Basic profile creation",
      "Up to 3 videos",
      "Up to 10 photos",
      "Awards & achievements showcase",
      "Public profile URL",
      "Mobile responsive design",
    ],
    limitations: ["No schedule management", "No coach reviews", "Limited customization", "Community support only"],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false,
    icon: Star,
    tier: "free" as SubscriptionTier,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "per month",
    description: "Most popular for serious athletes",
    features: [
      "Everything in Free",
      "Up to 10 videos",
      "Up to 50 photos",
      "Schedule management",
      "Coach review system",
      "Advanced profile customization",
      "Custom branding colors",
      "Priority support",
      "Advanced analytics",
    ],
    limitations: ["No business cards", "No verified reviews", "No multiple sports"],
    buttonText: "Upgrade to Premium",
    buttonVariant: "solid" as const,
    popular: true,
    icon: Zap,
    tier: "premium" as SubscriptionTier,
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "per month",
    description: "Complete solution for elite athletes",
    features: [
      "Everything in Premium",
      "Unlimited videos",
      "Unlimited photos",
      "Business card generator",
      "Verified coach review requests",
      "Multiple sports support",
      "Advanced video analytics",
      "Recruiting timeline tracker",
      "College coach outreach tools",
      "Custom domain (yourname.com)",
      "White-label branding",
      "API access",
      "Dedicated account manager",
    ],
    limitations: [],
    buttonText: "Upgrade to Pro",
    buttonVariant: "solid" as const,
    popular: false,
    icon: Crown,
    tier: "pro" as SubscriptionTier,
  },
]

const faqs = [
  {
    question: "Can I change my plan at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "Yes, we offer a 14-day free trial for both Premium and Pro plans. No credit card required to start your trial.",
  },
  {
    question: "What happens to my content if I downgrade?",
    answer:
      "Your content remains safe, but some features may be limited based on your new plan. For example, if you downgrade from Premium to Free, schedule and reviews features will be disabled.",
  },
  {
    question: "Do you offer student discounts?",
    answer:
      "Yes! We offer a 50% student discount on all paid plans. Contact our support team with your student ID for verification.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time from your account settings. Your plan will remain active until the end of your current billing period.",
  },
  {
    question: "What's the difference between regular and verified reviews?",
    answer:
      "Regular reviews (Premium) allow you to collect testimonials from coaches. Verified reviews (Pro) let you send secure, authenticated review requests that coaches can respond to directly through a verified link.",
  },
]

export default function SubscriptionPage() {
  const router = useRouter()
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAthleteData()
  }, [])

  const fetchAthleteData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const { data: athleteData } = await supabase
        .from("athletes")
        .select("id, subscription_tier, athlete_name")
        .eq("user_id", session.user.id)
        .single()

      if (athleteData) {
        setAthlete(athleteData)
      }
    } catch (error) {
      console.error("Error fetching athlete data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  const currentTier = athlete?.subscription_tier || "free"

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="7xl" py={16}>
        <VStack spacing={16}>
          {/* Header */}
          <VStack spacing={6} textAlign="center" maxW="3xl">
            <Badge colorScheme="blue" px={4} py={2} borderRadius="full" fontSize="sm">
              Choose Your Plan
            </Badge>
            <Heading size="2xl" fontWeight="bold">
              Unlock Your Athletic Potential
            </Heading>
            <Text fontSize="xl" color="gray.600">
              Join thousands of student-athletes who are already using RecruitMyGame to showcase their talents and
              connect with college coaches.
            </Text>
            {athlete && (
              <HStack spacing={2}>
                <Text fontSize="lg" color="gray.700">
                  Current Plan:
                </Text>
                <Badge
                  colorScheme={getTierColor(currentTier)}
                  variant="solid"
                  px={3}
                  py={1}
                  borderRadius="full"
                  textTransform="uppercase"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {getTierDisplayName(currentTier)}
                </Badge>
              </HStack>
            )}
          </VStack>

          {/* Pricing Cards */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8} w="full">
            {plans.map((plan) => {
              const IconComponent = plan.icon
              const isCurrentPlan = currentTier === plan.tier
              const canUpgrade = currentTier === "free" && plan.tier !== "free"
              const canUpgradeFromPremium = currentTier === "premium" && plan.tier === "pro"

              return (
                <Card
                  key={plan.name}
                  bg={cardBg}
                  shadow={plan.popular ? "2xl" : "lg"}
                  borderWidth={isCurrentPlan ? 3 : plan.popular ? 2 : 1}
                  borderColor={isCurrentPlan ? "green.500" : plan.popular ? "blue.500" : "gray.200"}
                  position="relative"
                  _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
                  transition="all 0.3s"
                >
                  {plan.popular && !isCurrentPlan && (
                    <Badge
                      colorScheme="blue"
                      position="absolute"
                      top="-12px"
                      left="50%"
                      transform="translateX(-50%)"
                      px={4}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                    >
                      Most Popular
                    </Badge>
                  )}

                  {isCurrentPlan && (
                    <Badge
                      colorScheme="green"
                      position="absolute"
                      top="-12px"
                      left="50%"
                      transform="translateX(-50%)"
                      px={4}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                    >
                      Current Plan
                    </Badge>
                  )}

                  <CardHeader pb={4}>
                    <VStack spacing={4}>
                      <HStack>
                        <IconComponent
                          size={24}
                          color={isCurrentPlan ? "#38A169" : plan.popular ? "#3182CE" : "#718096"}
                        />
                        <Heading size="lg">{plan.name}</Heading>
                        {isCurrentPlan && <CheckCircle size={20} color="#38A169" />}
                      </HStack>

                      <VStack spacing={1}>
                        <HStack align="baseline">
                          <Text
                            fontSize="4xl"
                            fontWeight="bold"
                            color={isCurrentPlan ? "green.500" : plan.popular ? "blue.500" : "gray.900"}
                          >
                            {plan.price}
                          </Text>
                          <Text color="gray.600">/{plan.period}</Text>
                        </HStack>
                        <Text color="gray.600" textAlign="center">
                          {plan.description}
                        </Text>
                      </VStack>
                    </VStack>
                  </CardHeader>

                  <CardBody pt={0}>
                    <VStack spacing={6}>
                      <List spacing={3} w="full">
                        {plan.features.map((feature, index) => (
                          <ListItem key={index} display="flex" alignItems="center">
                            <ListIcon as={Check} color="green.500" />
                            <Text fontSize="sm">{feature}</Text>
                          </ListItem>
                        ))}
                      </List>

                      <Button
                        colorScheme={isCurrentPlan ? "green" : plan.popular ? "blue" : "gray"}
                        variant={isCurrentPlan ? "outline" : plan.buttonVariant}
                        size="lg"
                        w="full"
                        rightIcon={!isCurrentPlan ? <ArrowRight size={16} /> : undefined}
                        onClick={() => {
                          if (!isCurrentPlan && (canUpgrade || canUpgradeFromPremium)) {
                            router.push("/dashboard")
                          }
                        }}
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? "Current Plan" : plan.buttonText}
                      </Button>

                      {plan.name === "Premium" && !isCurrentPlan && (
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          14-day free trial • No credit card required
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )
            })}
          </Grid>

          {/* Feature Comparison */}
          <Box w="full">
            <VStack spacing={8}>
              <Heading size="xl" textAlign="center">
                Compare Plans
              </Heading>

              <Card bg={cardBg} shadow="lg" w="full">
                <CardBody>
                  <Grid templateColumns={{ base: "2fr 1fr 1fr 1fr", md: "3fr 1fr 1fr 1fr" }} gap={4}>
                    {/* Header */}
                    <Text fontWeight="bold" fontSize="lg">
                      Features
                    </Text>
                    <Text fontWeight="bold" textAlign="center">
                      Free
                    </Text>
                    <Text fontWeight="bold" textAlign="center">
                      Premium
                    </Text>
                    <Text fontWeight="bold" textAlign="center">
                      Pro
                    </Text>

                    <Divider gridColumn="1 / -1" />

                    {/* Basic Features */}
                    <Text fontWeight="semibold" color="gray.700">
                      Profile Creation
                    </Text>
                    <Text textAlign="center">✓</Text>
                    <Text textAlign="center">✓</Text>
                    <Text textAlign="center">✓</Text>

                    <Text fontSize="sm" color="gray.600">
                      Videos
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      Up to 3
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      Up to 10
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      Unlimited
                    </Text>

                    <Text fontSize="sm" color="gray.600">
                      Photos
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      Up to 10
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      Up to 50
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      Unlimited
                    </Text>

                    <Text fontSize="sm" color="gray.600">
                      Awards & Achievements
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>

                    <Divider gridColumn="1 / -1" />

                    {/* Premium Features */}
                    <Text fontSize="sm" color="gray.600">
                      Schedule Management
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>

                    <Text fontSize="sm" color="gray.600">
                      Coach Reviews
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>

                    <Text fontSize="sm" color="gray.600">
                      Custom Branding
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>

                    <Text fontSize="sm" color="gray.600">
                      Analytics
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>

                    <Divider gridColumn="1 / -1" />

                    {/* Pro Features */}
                    <Text fontSize="sm" color="gray.600">
                      Business Cards
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>

                    <Text fontSize="sm" color="gray.600">
                      Verified Coach Reviews
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>

                    <Text fontSize="sm" color="gray.600">
                      Multiple Sports
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>

                    <Text fontSize="sm" color="gray.600">
                      Custom Domain
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      -
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      ✓
                    </Text>

                    <Divider gridColumn="1 / -1" />

                    {/* Support */}
                    <Text fontSize="sm" color="gray.600">
                      Support
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      Community
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      Priority
                    </Text>
                    <Text textAlign="center" fontSize="sm">
                      Dedicated
                    </Text>
                  </Grid>
                </CardBody>
              </Card>
            </VStack>
          </Box>

          {/* FAQ Section */}
          <Box w="full" maxW="4xl">
            <VStack spacing={8}>
              <Heading size="xl" textAlign="center">
                Frequently Asked Questions
              </Heading>

              <Accordion allowMultiple w="full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} border="1px" borderColor="gray.200" borderRadius="md" mb={4}>
                    <AccordionButton py={4} _hover={{ bg: "gray.50" }}>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="semibold">{faq.question}</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Text color="gray.600">{faq.answer}</Text>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </VStack>
          </Box>

          {/* CTA Section */}
          <Box w="full" textAlign="center">
            <VStack spacing={6}>
              <Heading size="xl">Ready to Get Recruited?</Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Join thousands of student-athletes who have already created their professional recruitment profiles.
                Start building your future today.
              </Text>
              <HStack spacing={4}>
                {currentTier === "free" && (
                  <Button
                    colorScheme="blue"
                    size="lg"
                    rightIcon={<ArrowRight size={16} />}
                    onClick={() => router.push("/dashboard")}
                  >
                    Start Premium Trial
                  </Button>
                )}
                {currentTier === "premium" && (
                  <Button
                    colorScheme="purple"
                    size="lg"
                    rightIcon={<ArrowRight size={16} />}
                    onClick={() => router.push("/dashboard")}
                  >
                    Upgrade to Pro
                  </Button>
                )}
                <Button variant="outline" size="lg" onClick={() => router.push("/")}>
                  Learn More
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
