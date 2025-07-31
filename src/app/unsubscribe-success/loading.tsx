"use client"

import { Container, VStack, Spinner, Text } from "@chakra-ui/react"

export default function UnsubscribeSuccessLoading() {
  return (
    <Container maxW="md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Spinner size="xl" color="orange.500" />
        <Text color="gray.600">Processing your unsubscribe request...</Text>
      </VStack>
    </Container>
  )
}
