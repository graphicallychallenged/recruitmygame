"use client"

import { useState } from "react"
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Divider,
} from "@chakra-ui/react"
import { Trash2, AlertTriangle } from "lucide-react"

export function AccountDeletionManager() {
  const [reason, setReason] = useState("")
  const [deleting, setDeleting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const handleDeleteRequest = async () => {
    setDeleting(true)
    try {
      const response = await fetch("/api/compliance/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reason.trim() || undefined,
          deletion_type: "full_deletion",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to request account deletion")
      }

      const data = await response.json()

      toast({
        title: "Deletion Request Submitted",
        description: data.message,
        status: "info",
        duration: 8000,
      })

      onClose()
      setReason("")
    } catch (error) {
      console.error("Deletion request error:", error)
      toast({
        title: "Error",
        description: "Failed to submit deletion request",
        status: "error",
        duration: 5000,
      })
    } finally {
      setDeleting(false)
    }
  }

  const dataToBeDeleted = [
    "Your athlete profile and personal information",
    "All uploaded photos and videos",
    "Awards, achievements, and accomplishments",
    "Schedule data and event history",
    "Coach reviews and ratings",
    "Team affiliations and history",
    "Account settings and preferences",
    "Subscription and billing information",
    "All generated business cards and templates",
  ]

  return (
    <Card>
      <CardHeader>
        <HStack spacing={3}>
          <Trash2 size={24} />
          <VStack align="start" spacing={0}>
            <Heading size="md">Delete Account</Heading>
            <Text fontSize="sm" color="gray.600">
              Permanently remove your account and all data
            </Text>
          </VStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">This action cannot be undone!</AlertTitle>
              <AlertDescription fontSize="sm">
                Account deletion is permanent and irreversible. All your data will be completely removed from our
                systems.
              </AlertDescription>
            </Box>
          </Alert>

          <VStack spacing={4} align="stretch">
            <Text fontWeight="semibold">The following data will be permanently deleted:</Text>
            <VStack align="start" spacing={2} pl={4}>
              {dataToBeDeleted.map((item, index) => (
                <HStack key={index} spacing={2}>
                  <Text fontSize="sm" color="red.600">
                    •
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    {item}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>

          <Divider />

          <VStack spacing={4} align="stretch">
            <Text fontWeight="semibold">Before you delete your account:</Text>
            <VStack align="start" spacing={2} pl={4}>
              <Text fontSize="sm" color="gray.700">
                • Export your data if you want to keep a copy
              </Text>
              <Text fontSize="sm" color="gray.700">
                • Cancel any active subscriptions
              </Text>
              <Text fontSize="sm" color="gray.700">
                • Download any important files or information
              </Text>
              <Text fontSize="sm" color="gray.700">
                • Consider if you might want to return in the future
              </Text>
            </VStack>
          </VStack>

          <Button leftIcon={<Trash2 size={16} />} colorScheme="red" variant="outline" onClick={onOpen} size="lg">
            Request Account Deletion
          </Button>

          <Box pt={4} borderTop="1px" borderColor="gray.200">
            <Text fontSize="xs" color="gray.500">
              Account deletion requests are processed within 30 days in compliance with data protection regulations. You
              will receive email confirmation once the deletion is complete.
            </Text>
          </Box>
        </VStack>
      </CardBody>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <AlertTriangle size={20} color="red" />
              <Text>Confirm Account Deletion</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="error">
                <AlertIcon />
                <AlertDescription>
                  This will permanently delete your account and all associated data. This action cannot be undone.
                </AlertDescription>
              </Alert>

              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Reason for deletion (optional):
                </Text>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Help us improve by telling us why you're leaving..."
                  rows={3}
                />
              </Box>

              <Text fontSize="sm" color="gray.600">
                After submitting this request, you will receive an email with a verification link. Your account will be
                deleted once you confirm via email.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteRequest} isLoading={deleting} loadingText="Submitting...">
              Submit Deletion Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  )
}
