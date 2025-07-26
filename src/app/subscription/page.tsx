"use client"

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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
} from "@chakra-ui/react"
import { Check, X, Star, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function SubscriptionPage() {
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with your recruitment profile",
      icon: Users,
      color: "gray",
      features: [
        "Basic profile setup",
        "Up to 3 photos",
        "1 video upload",
        "Public profile page",
        "Basic contact form",
        "Mobile responsive design",
      ],
      limitations: ["Limited customization", "No analytics", "Basic support only", "RecruitMyGame branding"],
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "per month",
      description: "Enhanced features for serious student athletes",
      icon: Star,
      color: "blue",
      popular: true,
      features: [
        "Everything in Free",
        "Unlimited photos",
        "Up to 10 videos",
        "Custom colors & branding",
        "Advanced profile sections",
        "Coach review system",
        "Schedule management",
        "Awards showcase",
        "Basic analytics",
        "Priority support",
        "Remove RecruitMyGame branding",
      ],
      limitations: ["Limited video storage", "Basic analytics only"],
    },
    {
      name: "Pro",
      price: "$19.99",
      period: "per month",
      description: "Complete solution for elite athletes and serious recruitment",
      icon: Zap,
      color: "purple",
      features: [
        "Everything in Premium",
        "Unlimited videos",
        "Advanced analytics",
        "Custom domain support",
        "Priority profile placement",
        "Advanced contact management",
        "Social media integration",
        "SEO optimization",
        "White-label options",
        "Dedicated support",
        "Early access to new features",
      ],
      limitations: [],
    },
  ]

  const comparisonFeatures = [
    {
      category: "Profile Features",
      features: [
        { name: "Basic Profile Setup", free: true, premium: true, pro: true },
        { name: "Custom Colors & Branding", free: false, premium: true, pro: true },
        { name: "Custom Domain", free: false, premium: false, pro: true },
        { name: "Remove Platform Branding", free: false, premium: true, pro: true },
        { name: "SEO Optimization", free: false, premium: false, pro: true },
      ],
    },
    {
      category: "Media & Content",
      features: [
        { name: "Photos", free: "3", premium: "Unlimited", pro: "Unlimited" },
        { name: "Videos", free: "1", premium: "10", pro: "Unlimited" },
        { name: "Video Storage", free: "100MB", premium: "5GB", pro: "Unlimited" },
        { name: "Awards Showcase", free: false, premium: true, pro: true },
        { name: "Schedule Management", free: false, premium: true, pro: true },
      ],
    },
    {
      category: "Communication",
      features: [
        { name: "Basic Contact Form", free: true, premium: true, pro: true },
        { name: "Coach Review System", free: false, premium: true, pro: true },
        { name: "Advanced Contact Management", free: false, premium: false, pro: true },
        { name: "Social Media Integration", free: false, premium: false, pro: true },
      ],
    },
    {
      category: "Analytics & Insights",
      features: [
        { name: "Profile Views", free: false, premium: "Basic", pro: "Advanced" },
        { name: "Visitor Analytics", free: false, premium: "Basic", pro: "Advanced" },
        { name: "Performance Metrics", free: false, premium: false, pro: true },
        { name: "Recruitment Insights", free: false, premium: false, pro: true },
      ],
    },
    {
      category: "Support",
      features: [
        { name: "Community Support", free: true, premium: true, pro: true },
        { name: "Priority Support", free: false, premium: true, pro: true },
        { name: "Dedicated Support", free: false, premium: false, pro: true },
        { name: "Phone Support", free: false, premium: false, pro: true },
      ],
    },
  ]

  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. When you upgrade, you'll be charged the prorated amount immediately. When you downgrade, the change will take effect at the end of your current billing cycle.",
    },
    {
      question: "What happens to my content if I downgrade?",
      answer:
        "Your content will remain safe, but some features may be limited based on your new plan. For example, if you downgrade from Premium to Free, only your first 3 photos and 1 video will be visible on your public profile.",
    },
    {
      question: "Is there a student discount available?",
      answer:
        "Yes! We offer a 20% student discount on all paid plans. Contact our support team with your student ID or school email address to apply the discount to your account.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Absolutely. You can cancel your subscription at any time from your account settings. Your account will remain active until the end of your current billing period, then automatically switch to the Free plan.",
    },
    {
      question: "Do you offer team or school discounts?",
      answer:
        "Yes! We offer special pricing for teams, schools, and athletic programs. Contact our sales team for custom pricing based on the number of athlete profiles you need.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express, Discover) and PayPal. All payments are processed securely through Stripe.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes! We take data security seriously. All data is encrypted in transit and at rest. We're SOC 2 compliant and follow industry best practices for data protection.",
    },
    {
      question: "Can I get help setting up my profile?",
      answer:
        "Of course! Premium and Pro users get priority support to help with profile setup. We also have comprehensive guides and video tutorials available for all users.",
    },
  ]

  const renderFeatureValue = (value: any) => {
    if (typeof value === "boolean") {
      return value ? <Check size={20} color="green" /> : <X size={16} color="red" />
    }
    return <Text fontSize="sm">{value}</Text>
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="7xl" py={12}>
        <VStack spacing={16} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color="blue.600">
              Choose Your Plan
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Select the perfect plan for your athletic recruitment journey. Start free and upgrade as you grow.
            </Text>
          </VStack>

          {/* Pricing Cards */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8}>
            {plans.map((plan) => (
              <Card
                key={plan.name}
                bg={cardBg}
                shadow={plan.popular ? "2xl" : "lg"}
                border={plan.popular ? "2px solid" : "1px solid"}
                borderColor={plan.popular ? "blue.500" : "gray.200"}
                position="relative"
                _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
                transition="all 0.3s"
              >
                {plan.popular && (
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

                <CardHeader textAlign="center" pb={4}>
                  <VStack spacing={3}>
                    <Box color={`${plan.color}.500`}>
                      <plan.icon size={40} />
                    </Box>
                    <Heading size="lg">{plan.name}</Heading>
                    <VStack spacing={1}>
                      <HStack align="baseline">
                        <Text fontSize="4xl" fontWeight="bold" color={`${plan.color}.600`}>
                          {plan.price}
                        </Text>
                        <Text color="gray.500">/{plan.period}</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        {plan.description}
                      </Text>
                    </VStack>
                  </VStack>
                </CardHeader>

                <CardBody pt={0}>
                  <VStack spacing={6} align="stretch">
                    <List spacing={3}>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} fontSize="sm">
                          <ListIcon as={Check} color="green.500" />
                          {feature}
                        </ListItem>
                      ))}
                    </List>

                    {plan.limitations && plan.limitations.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                          Limitations:
                        </Text>
                        <List spacing={2}>
                          {plan.limitations.map((limitation, index) => (
                            <ListItem key={index} fontSize="sm" color="gray.500">
                              <ListIcon as={X} color="red.400" />
                              {limitation}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    <Button
                      as={Link}
                      href="/dashboard"
                      colorScheme={plan.color}
                      size="lg"
                      variant={plan.popular ? "solid" : "outline"}
                      w="full"
                    >
                      {plan.name === "Free" ? "Get Started Free" : `Choose ${plan.name}`}
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>

          {/* Feature Comparison Table */}
          <VStack spacing={6} align="stretch">
            <Heading size="xl" textAlign="center">
              Detailed Feature Comparison
            </Heading>

            <Card bg={cardBg} shadow="lg">
              <CardBody p={0}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Features</Th>
                        <Th textAlign="center">Free</Th>
                        <Th textAlign="center">
                          <Badge colorScheme="blue" variant="solid">
                            Premium
                          </Badge>
                        </Th>
                        <Th textAlign="center">Pro</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {comparisonFeatures.map((category) => (
                        <>
                          <Tr key={category.category} bg="gray.25">
                            <Td colSpan={4}>
                              <Text fontWeight="bold" color="blue.600">
                                {category.category}
                              </Text>
                            </Td>
                          </Tr>
                          {category.features.map((feature, index) => (
                            <Tr key={index}>
                              <Td>{feature.name}</Td>
                              <Td textAlign="center">{renderFeatureValue(feature.free)}</Td>
                              <Td textAlign="center">{renderFeatureValue(feature.premium)}</Td>
                              <Td textAlign="center">{renderFeatureValue(feature.pro)}</Td>
                            </Tr>
                          ))}
                        </>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </VStack>

          {/* FAQ Section */}
          <VStack spacing={6} align="stretch">
            <Heading size="xl" textAlign="center">
              Frequently Asked Questions
            </Heading>

            <Card bg={cardBg} shadow="lg" maxW="4xl" mx="auto" w="full">
              <CardBody>
                <Accordion allowToggle>
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} border="none" py={2}>
                      <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                        <Box flex="1" textAlign="left">
                          <Text fontWeight="semibold">{faq.question}</Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel px={0} pb={4}>
                        <Text color="gray.600">{faq.answer}</Text>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardBody>
            </Card>
          </VStack>

          {/* CTA Section */}
          <Box textAlign="center" py={12} bg="blue.50" borderRadius="xl">
            <VStack spacing={6}>
              <VStack spacing={3}>
                <Heading size="xl" color="blue.600">
                  Ready to Get Started?
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="2xl">
                  Join thousands of student athletes who are already using RecruitMyGame to showcase their talents and
                  connect with coaches.
                </Text>
              </VStack>

              <HStack spacing={4}>
                <Button as={Link} href="/dashboard" colorScheme="blue" size="lg" leftIcon={<Users size={20} />}>
                  Start Free Today
                </Button>
                <Button as={Link} href="/dashboard" variant="outline" size="lg" leftIcon={<Shield size={20} />}>
                  View Demo Profile
                </Button>
              </HStack>

              <Text fontSize="sm" color="gray.500">
                No credit card required • Cancel anytime • 30-day money-back guarantee
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
