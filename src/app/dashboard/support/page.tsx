"use client"

import { useState, useEffect } from "react"
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  Card,
  CardBody,
  Badge,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
} from "@chakra-ui/react"
import { HelpCircle, MessageSquare, Mail, Phone, Clock, CheckCircle } from "lucide-react"
import { supabase } from "@/utils/supabase/client"

interface SupportTicket {
  id: string
  subject: string
  category: string
  priority: "low" | "medium" | "high"
  status: "open" | "in_progress" | "resolved" | "closed"
  created_at: string
  updated_at: string
}

const faqData = [
  {
    question: "How do I make my profile public?",
    answer:
      "Go to your Profile settings and toggle the 'Make Profile Public' switch. This will make your profile visible to coaches and recruiters.",
  },
  {
    question: "How do I upload videos to my profile?",
    answer:
      "Navigate to the Videos section in your dashboard. Click 'Add Video' and either upload a file or paste a YouTube/Vimeo link. Videos help showcase your skills to recruiters.",
  },
  {
    question: "What's the difference between Free, Premium, and Pro plans?",
    answer:
      "Free includes basic profile features. Premium adds unlimited photos/videos and advanced analytics. Pro includes everything plus priority support and custom branding.",
  },
  {
    question: "How do coaches find my profile?",
    answer:
      "Coaches can search by sport, location, graduation year, and other criteria. Having a complete profile with recent stats and videos increases your visibility.",
  },
  {
    question: "Can I change my username after creating my profile?",
    answer:
      "Yes, you can change your username in Profile settings. Note that this will change your public profile URL, so update any links you've shared.",
  },
  {
    question: "How do I add my academic information?",
    answer:
      "In your Profile section, scroll to Academic Information and add your GPA, test scores, and academic achievements. This helps coaches evaluate your eligibility.",
  },
]

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"faq" | "contact" | "tickets">("faq")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "medium" as const,
    description: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          setFormData((prev) => ({ ...prev, email: session.user.email || "" }))
        }
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  useEffect(() => {
    if (user && activeTab === "tickets") {
      fetchTickets()
    }
  }, [user, activeTab])

  const fetchTickets = async () => {
    if (!user) return

    setLoadingTickets(true)
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (error: any) {
      console.error("Error fetching tickets:", error)
      toast({
        title: "Error loading tickets",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoadingTickets(false)
    }
  }

  const handleSubmitTicket = async () => {
    if (!formData.subject || !formData.description || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to submit a support ticket",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        contact_email: formData.email,
        status: "open",
      })

      if (error) throw error

      toast({
        title: "Support Ticket Created",
        description: "We'll get back to you within 24 hours",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      setFormData({
        subject: "",
        category: "",
        priority: "medium",
        description: "",
        email: user.email || "",
      })

      // Refresh tickets if on tickets tab
      if (activeTab === "tickets") {
        fetchTickets()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red"
      case "medium":
        return "orange"
      case "low":
        return "green"
      default:
        return "gray"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "green"
      case "in_progress":
        return "blue"
      case "open":
        return "orange"
      case "closed":
        return "gray"
      default:
        return "gray"
    }
  }

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  return (
    <Box maxW="6xl" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack spacing={3} mb={2}>
            <Icon as={HelpCircle} size={28} color="blue.500" />
            <Heading size="lg">Support Center</Heading>
          </HStack>
          <Text color="gray.600">Get help with your athlete profile and account</Text>
        </Box>

        {/* Quick Help Alert */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Need immediate help?</AlertTitle>
            <AlertDescription>Check our FAQ section below for quick answers to common questions.</AlertDescription>
          </Box>
        </Alert>

        {/* Navigation Tabs */}
        <HStack spacing={4} borderBottom="1px" borderColor="gray.200" pb={4}>
          <Button
            variant={activeTab === "faq" ? "solid" : "ghost"}
            colorScheme="blue"
            leftIcon={<HelpCircle size={18} />}
            onClick={() => setActiveTab("faq")}
          >
            FAQ
          </Button>
          <Button
            variant={activeTab === "contact" ? "solid" : "ghost"}
            colorScheme="blue"
            leftIcon={<MessageSquare size={18} />}
            onClick={() => setActiveTab("contact")}
          >
            Contact Support
          </Button>
          <Button
            variant={activeTab === "tickets" ? "solid" : "ghost"}
            colorScheme="blue"
            leftIcon={<Clock size={18} />}
            onClick={() => setActiveTab("tickets")}
          >
            My Tickets
          </Button>
        </HStack>

        {/* FAQ Section */}
        {activeTab === "faq" && (
          <Box>
            <Heading size="md" mb={4}>
              Frequently Asked Questions
            </Heading>
            <Accordion allowToggle>
              {faqData.map((faq, index) => (
                <AccordionItem key={index}>
                  <AccordionButton py={4}>
                    <Box flex="1" textAlign="left">
                      <Text fontWeight="medium">{faq.question}</Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Text color="gray.600">{faq.answer}</Text>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        )}

        {/* Contact Support Section */}
        {activeTab === "contact" && (
          <Box>
            <Heading size="md" mb={4}>
              Contact Support
            </Heading>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Subject</FormLabel>
                      <Input
                        value={formData.subject}
                        onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                        placeholder="Brief description of your issue"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={formData.category}
                        onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                        placeholder="Select category"
                      >
                        <option value="profile">Profile Issues</option>
                        <option value="upload">Photo/Video Upload</option>
                        <option value="account">Account Settings</option>
                        <option value="billing">Billing & Subscription</option>
                        <option value="technical">Technical Issues</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>
                  </HStack>

                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        value={formData.priority}
                        onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as any }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Select>
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                      />
                    </FormControl>
                  </HStack>

                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Please describe your issue in detail..."
                      rows={6}
                    />
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    onClick={handleSubmitTicket}
                    isLoading={isSubmitting}
                    loadingText="Submitting..."
                    size="lg"
                  >
                    Submit Support Ticket
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Divider my={6} />

            {/* Contact Information */}
            <Box>
              <Heading size="sm" mb={4}>
                Other Ways to Reach Us
              </Heading>
              <VStack spacing={3} align="stretch">
                <HStack spacing={3}>
                  <Icon as={Mail} color="blue.500" />
                  <Text>Email: support@recruitmygame.com</Text>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={Phone} color="blue.500" />
                  <Text>Phone: 1-800-RECRUIT (Mon-Fri, 9AM-6PM EST)</Text>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={Clock} color="blue.500" />
                  <Text>Response Time: Within 24 hours</Text>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

        {/* My Tickets Section */}
        {activeTab === "tickets" && (
          <Box>
            <Heading size="md" mb={4}>
              My Support Tickets
            </Heading>
            {loadingTickets ? (
              <Center py={8}>
                <Spinner size="lg" color="blue.500" />
              </Center>
            ) : tickets.length === 0 ? (
              <Card>
                <CardBody textAlign="center" py={8}>
                  <Icon as={CheckCircle} size={48} color="gray.400" mb={4} />
                  <Text color="gray.500" fontSize="lg">
                    No support tickets yet
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    When you submit a support request, it will appear here
                  </Text>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={4} align="stretch">
                {tickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardBody>
                      <HStack justify="space-between" align="start" mb={2}>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="semibold">{ticket.subject}</Text>
                          <HStack spacing={2}>
                            <Badge colorScheme={getPriorityColor(ticket.priority)}>
                              {ticket.priority.toUpperCase()}
                            </Badge>
                            <Badge colorScheme={getStatusColor(ticket.status)}>
                              {ticket.status.replace("_", " ").toUpperCase()}
                            </Badge>
                            {ticket.category && (
                              <Text fontSize="sm" color="gray.500">
                                {ticket.category}
                              </Text>
                            )}
                          </HStack>
                        </VStack>
                        <VStack align="end" spacing={1}>
                          <Text fontSize="sm" color="gray.500">
                            Created: {new Date(ticket.created_at).toLocaleDateString()}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Updated: {new Date(ticket.updated_at).toLocaleDateString()}
                          </Text>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  )
}
