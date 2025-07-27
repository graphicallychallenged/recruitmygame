"use client"

import type React from "react"

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Text,
  useToast,
  Alert,
  AlertIcon,
} from "@chakra-ui/react"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

interface ReviewerContactModalProps {
  isOpen: boolean
  onClose: () => void
  reviewId: string
  reviewerName: string
  athleteName: string
  primaryColor?: string
}

export function ReviewerContactModal({
  isOpen,
  onClose,
  reviewId,
  reviewerName,
  athleteName,
  primaryColor = "#1a202c",
}: ReviewerContactModalProps) {
  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("reviewer_contact_messages").insert({
        review_id: reviewId,
        sender_name: formData.senderName,
        sender_email: formData.senderEmail,
        sender_phone: formData.senderPhone || null,
        message: formData.message,
      })

      if (error) throw error

      toast({
        title: "Message sent successfully!",
        description: "Your message has been sent to the reviewer.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      // Reset form and close modal
      setFormData({
        senderName: "",
        senderEmail: "",
        senderPhone: "",
        message: "",
      })
      onClose()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color={primaryColor}>
          Contact {reviewerName} about {athleteName}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Your message will be sent to {reviewerName} regarding their review of {athleteName}. Please be
                professional and respectful in your communication.
              </Text>
            </Alert>

            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Your Name</FormLabel>
                  <Input
                    value={formData.senderName}
                    onChange={(e) => handleInputChange("senderName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Your Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.senderEmail}
                    onChange={(e) => handleInputChange("senderEmail", e.target.value)}
                    placeholder="Enter your email address"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Your Phone (Optional)</FormLabel>
                  <Input
                    type="tel"
                    value={formData.senderPhone}
                    onChange={(e) => handleInputChange("senderPhone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder={`Hi ${reviewerName}, I saw your review of ${athleteName} and would like to discuss...`}
                    rows={6}
                    resize="vertical"
                  />
                </FormControl>
              </VStack>
            </form>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            bg={primaryColor}
            color="white"
            _hover={{ opacity: 0.8 }}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Sending..."
            isDisabled={!formData.senderName || !formData.senderEmail || !formData.message}
          >
            Send Message
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
