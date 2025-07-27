"use client"

import  React from "react"

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
} from "@chakra-ui/react"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  athleteName: string
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  primaryColor: string
  textColor: string
  cardBgColor: string
  borderColor: string
  isDarkTheme: boolean
}

export function ContactModal({
  isOpen,
  onClose,
  athleteName,
  onSubmit,
  isSubmitting,
  primaryColor,
  textColor,
  cardBgColor,
  borderColor,
  isDarkTheme,
}: ContactModalProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  })

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev:any) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e)
    setFormData({ name: "", email: "", organization: "", message: "" })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={cardBgColor}>
        <ModalHeader color={textColor}>Contact {athleteName}</ModalHeader>
        <ModalCloseButton color={textColor} />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textColor}>Your Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  bg={isDarkTheme ? "gray.700" : "white"}
                  color={textColor}
                  borderColor={borderColor}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color={textColor}>Email Address</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  bg={isDarkTheme ? "gray.700" : "white"}
                  color={textColor}
                  borderColor={borderColor}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Organization</FormLabel>
                <Input
                  value={formData.organization}
                  onChange={(e) => handleFormChange("organization", e.target.value)}
                  placeholder="School, team, or organization (optional)"
                  bg={isDarkTheme ? "gray.700" : "white"}
                  color={textColor}
                  borderColor={borderColor}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color={textColor}>Message</FormLabel>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleFormChange("message", e.target.value)}
                  placeholder="Enter your message..."
                  rows={4}
                  bg={isDarkTheme ? "gray.700" : "white"}
                  color={textColor}
                  borderColor={borderColor}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} color={textColor}>
              Cancel
            </Button>
            <Button
              type="submit"
              bg={primaryColor}
              color="white"
              _hover={{ opacity: 0.8 }}
              isLoading={isSubmitting}
              loadingText="Sending..."
            >
              Send Message
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
