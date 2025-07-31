"use client"

import { Container, VStack, Heading, Text, Button, Icon } from "@chakra-ui/react"
import { CheckCircle, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UnsubscribeSuccessPage() {
  const router = useRouter()

  return (
    <Container maxW="md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Icon as={CheckCircle} boxSize={16} color="orange.500" />

        <VStack spacing={4}>
          <Heading size="lg" color="orange.600">
            Successfully Unsubscribed
          </Heading>
          <Text color="gray.600" fontSize="lg">
            You've been unsubscribed from profile update notifications. You won't receive any more emails from this
            athlete.
          </Text>
        </VStack>

        <VStack spacing={4}>
          <Text fontSize="sm" color="gray.500">
            You can always subscribe again by visiting the athlete's profile.
          </Text>

          <Button leftIcon={<Home size={16} />} colorScheme="blue" onClick={() => router.push("/")}>
            Go to Homepage
          </Button>
        </VStack>
      </VStack>
    </Container>
  )
}
