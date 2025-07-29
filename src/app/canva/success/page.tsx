"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from "@chakra-ui/react"
import { CheckCircle, XCircle, CreditCard } from "lucide-react"

export default function CanvaSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const error = searchParams.get("error")

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard/business-cards")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  const isSuccess = success === "connected"
  const isError = error === "authorization_failed" || error === "connection_failed"

  return (
    <Container maxW="md" py={16}>
      <VStack spacing={8} textAlign="center">
        <Box color={isSuccess ? "green.500" : "red.500"}>
          {isSuccess ? <CheckCircle size={64} /> : <XCircle size={64} />}
        </Box>

        <VStack spacing={4}>
          <Heading size="lg">{isSuccess ? "Canva Connected!" : "Connection Failed"}</Heading>

          {isSuccess && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Successfully Connected!</AlertTitle>
                <AlertDescription>
                  Your Canva account has been connected. You can now generate professional business cards.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {isError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Connection Failed!</AlertTitle>
                <AlertDescription>
                  {error === "authorization_failed"
                    ? "Authorization was cancelled or failed. Please try again."
                    : "There was an error connecting to Canva. Please try again later."}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          <Text color="gray.600">You will be redirected to your business cards page in a few seconds...</Text>
        </VStack>

        <Button
          leftIcon={<CreditCard size={16} />}
          colorScheme="purple"
          onClick={() => router.push("/dashboard/business-cards")}
        >
          Go to Business Cards
        </Button>
      </VStack>
    </Container>
  )
}
