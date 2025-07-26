"use client"

import { Box, Container, VStack, Heading, Text, Button } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { Home } from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center">
      <Container maxW="md">
        <VStack spacing={6} textAlign="center">
          <Heading size="2xl" color="gray.700">
            Athlete Not Found
          </Heading>
          <Text fontSize="lg" color="gray.600">
            The athlete profile you're looking for doesn't exist or has been made private.
          </Text>
          <Button leftIcon={<Home size={20} />} colorScheme="blue" size="lg" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}
