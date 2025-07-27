"use client"

import type React from "react"

import { useState } from "react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Text,
} from "@chakra-ui/react"
import { supabase } from "@/utils/supabase/client"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  athleteId: string
  athleteName: string
}

export function ContactModal({ isOpen, onClose, athleteId, athleteName, }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  })
  const [sending, setSending] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setSending(true)
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        athlete_id: athleteId,
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        message: formData.message,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Message sent!",
        description: "Your message has been sent successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        organization: "",
        message: "",
      })
      onClose()
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      organization: "",
      message: "",
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Contact {athleteName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text mb={4} color="gray.600">
            Send a message to {athleteName}. They will receive your contact information and message.
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Your Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email address"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Organization (Optional)</FormLabel>
                <Input
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="School, team, company, etc."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your message here..."
                  rows={4}
                />
              </FormControl>

              <Button type="submit" colorScheme="blue" size="lg" w="full" isLoading={sending} loadingText="Sending...">
                Send Message
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
