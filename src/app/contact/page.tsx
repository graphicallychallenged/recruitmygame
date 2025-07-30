"use client"

import type React from "react"

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
} from "@chakra-ui/react"
import { Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
      status: "success",
      duration: 5000,
      isClosable: true,
    })

    setFormData({ name: "", email: "", subject: "", category: "", message: "" })
    setIsSubmitting(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      value: "support@recruitmygame.com",
      description: "Get help with your account or technical issues",
    },
    {
      icon: Phone,
      title: "Phone Support",
      value: "(770) 337-3229",
      description: "Monday - Friday, 9 AM - 6 PM EST",
    },
    {
      icon: MapPin,
      title: "Headquarters",
      value: "Grayson, GA",
      description: "Meet with us for partnership opportunities",
    },
    {
      icon: Clock,
      title: "Response Time",
      value: "Within 24 hours",
      description: "We typically respond much faster!",
    },
  ]

  return (
    <Box minH="100vh">
      <SiteHeader />

      <Box bg="gray.50" py={12}>
        <Container maxW="6xl">
          <VStack spacing={12} align="stretch">
            {/* Header */}
            <Box textAlign="center">
              <Heading size="2xl" mb={4}>
                Contact Us
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
                Have questions about RecruitMyGame? We're here to help you succeed in your athletic journey.
              </Text>
            </Box>

            <HStack spacing={12} align="start">
              {/* Contact Form */}
              <Box flex={2}>
                <Card shadow="sm">
                  <CardBody p={8}>
                    <Heading size="lg" mb={6}>
                      Send us a Message
                    </Heading>
                    <form onSubmit={handleSubmit}>
                      <VStack spacing={4}>
                        <HStack spacing={4} w="full">
                          <FormControl isRequired>
                            <FormLabel>Name</FormLabel>
                            <Input
                              value={formData.name}
                              onChange={(e) => handleChange("name", e.target.value)}
                              placeholder="Your full name"
                            />
                          </FormControl>
                          <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleChange("email", e.target.value)}
                              placeholder="your@email.com"
                            />
                          </FormControl>
                        </HStack>

                        <HStack spacing={4} w="full">
                          <FormControl isRequired>
                            <FormLabel>Subject</FormLabel>
                            <Input
                              value={formData.subject}
                              onChange={(e) => handleChange("subject", e.target.value)}
                              placeholder="What's this about?"
                            />
                          </FormControl>
                          <FormControl isRequired>
                            <FormLabel>Category</FormLabel>
                            <Select
                              value={formData.category}
                              onChange={(e) => handleChange("category", e.target.value)}
                              placeholder="Select category"
                            >
                              <option value="technical">Technical Support</option>
                              <option value="billing">Billing & Subscriptions</option>
                              <option value="profile">Profile Help</option>
                              <option value="recruiting">Recruiting Questions</option>
                              <option value="partnership">Partnership Inquiry</option>
                              <option value="other">Other</option>
                            </Select>
                          </FormControl>
                        </HStack>

                        <FormControl isRequired>
                          <FormLabel>Message</FormLabel>
                          <Textarea
                            value={formData.message}
                            onChange={(e) => handleChange("message", e.target.value)}
                            placeholder="Tell us how we can help you..."
                            rows={6}
                          />
                        </FormControl>

                        <Button
                          type="submit"
                          bg="teal.500"
                          color="white"
                          _hover={{ bg: "teal.600" }}
                          size="lg"
                          w="full"
                          isLoading={isSubmitting}
                          loadingText="Sending..."
                        >
                          Send Message
                        </Button>
                      </VStack>
                    </form>
                  </CardBody>
                </Card>
              </Box>

              {/* Contact Info */}
              <Box flex={1}>
                <VStack spacing={6}>
                  <Card w="full" shadow="sm">
                    <CardBody>
                      <Heading size="md" mb={4}>
                        Get in Touch
                      </Heading>
                      <VStack spacing={4} align="stretch">
                        {contactInfo.map((info, index) => (
                          <HStack key={index} spacing={3} align="start">
                            <Icon as={info.icon} size={20} color="teal.500" flexShrink={0} mt={1} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" fontSize="sm">
                                {info.title}
                              </Text>
                              <Text color="teal.600" fontSize="sm">
                                {info.value}
                              </Text>
                              <Text color="gray.600" fontSize="xs">
                                {info.description}
                              </Text>
                            </VStack>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card w="full" shadow="sm">
                    <CardBody>
                      <Heading size="md" mb={4}>
                        Quick Help
                      </Heading>
                      <VStack spacing={3}>
                        <Button
                          as={Link}
                          href="/getting-started"
                          variant="outline"
                          w="full"
                          leftIcon={<Icon as={HelpCircle} />}
                          size="sm"
                        >
                          Getting Started Guide
                        </Button>
                        <Button
                          as={Link}
                          href="/dashboard/support"
                          variant="outline"
                          w="full"
                          leftIcon={<Icon as={MessageCircle} />}
                          size="sm"
                        >
                          Support Center
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card w="full" shadow="sm" bg="teal.50">
                    <CardBody>
                      <Heading size="sm" mb={2}>
                        Need Immediate Help?
                      </Heading>
                      <Text fontSize="sm" color="gray.600" mb={3}>
                        For urgent technical issues or account problems, email us directly:
                      </Text>
                      <Button
                        as={Link}
                        href="mailto:urgent@recruitmygame.com"
                        bg="teal.500"
                        color="white"
                        _hover={{ bg: "teal.600" }}
                        size="sm"
                        w="full"
                      >
                        urgent@recruitmygame.com
                      </Button>
                    </CardBody>
                  </Card>
                </VStack>
              </Box>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <SiteFooter />
    </Box>
  )
}
