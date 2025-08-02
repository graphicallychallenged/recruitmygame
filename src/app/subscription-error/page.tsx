"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  Icon,
} from "@chakra-ui/react"
import { ArrowLeftCircle, AlertTriangle } from "lucide-react"

export default function SubscriptionErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "missing-token":
        return {
          title: "Invalid Link",
          description: "The verification link is missing required information. Please check the link in your email.",
          status: "error" as const,
        }
      case "invalid-token":
        return {
          title: "Invalid or Expired Link",
          description:
            "This verification link is invalid or has already been used. Please request a new subscription if needed.",
          status: "error" as const,
        }
      case "expired-token":
        return {
          title: "Link Expired",
          description:
            "This verification link has expired. Please subscribe again to receive a new verification email.",
          status: "warning" as const,
        }
      case "verification-failed":
        return {
          title: "Verification Failed",
          description:
            "We encountered an error while verifying your subscription. Please try again or contact support.",
          status: "error" as const,
        }
      case "server-error":
        return {
          title: "Server Error",
          description:
            "We encountered a technical issue. Please try again later or contact support if the problem persists.",
          status: "error" as const,
        }
      default:
        return {
          title: "Subscription Error",
          description: "There was an issue with your subscription verification. Please try again.",
          status: "error" as const,
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      <Container maxW="md">
        <VStack spacing={8} align="center">
          <Box textAlign="center">
            <Icon as={AlertTriangle} w={16} h={16} color="red.500" mb={4} />
            <Heading size="lg" color="red.600" mb={2}>
              {errorInfo.title}
            </Heading>
          </Box>

          <Card w="full" shadow="lg">
            <CardBody>
              <VStack spacing={6}>
                <Alert status={errorInfo.status} borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>{errorInfo.title}</AlertTitle>
                    <AlertDescription>{errorInfo.description}</AlertDescription>
                  </Box>
                </Alert>

                <VStack spacing={4} w="full">
                  <Button as={Link} href="/" leftIcon={<ArrowLeftCircle />} colorScheme="blue" size="lg" w="full">
                    Return to Home
                  </Button>

                  {(error === "expired-token" || error === "invalid-token") && (
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      You can subscribe again by visiting the athlete's profile page.
                    </Text>
                  )}

                  {(error === "server-error" || error === "verification-failed") && (
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      If this problem continues, please{" "}
                      <Link href="/contact">
                        <Text as="span" color="blue.500" textDecoration="underline">
                          contact support
                        </Text>
                      </Link>
                      .
                    </Text>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}
