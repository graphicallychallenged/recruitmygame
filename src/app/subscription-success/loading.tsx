"use client"

import { Container, VStack, Spinner, Text } from "@chakra-ui/react"

export default function SubscriptionSuccessLoading() {
  return (
    <Container maxW="md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Spinner size="xl" color="blue.500" />
        <Text color="gray.600">Verifying your subscription...</Text>
      </VStack>
    </Container>
  )
}
