"use client"

import { useSearchParams } from "next/navigation"
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
} from "@chakra-ui/react"
import { CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UnsubscribeSuccessPage() {
  const searchParams = useSearchParams()
  const athleteUsername = searchParams.get("athlete")

  return (
    <Container maxW="2xl" py={16}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <CheckCircle size={64} color="orange" style={{ margin: "0 auto 16px" }} />
          <Heading size="lg" color="orange.600" mb={4}>
            Successfully Unsubscribed
          </Heading>
          <Text fontSize="lg" color="gray.600">
            You've been unsubscribed from updates from {athleteUsername || "this athlete"}
          </Text>
        </Box>

        <Card>
          <CardBody>
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>You're unsubscribed</AlertTitle>
                <AlertDescription>
                  You will no longer receive email notifications from {athleteUsername || "this athlete"}. You can
                  always resubscribe by visiting their profile page.
                </AlertDescription>
              </Box>
            </Alert>
          </CardBody>
        </Card>

        <Box textAlign="center">
          {athleteUsername ? (
            <Button as={Link} href={`/${athleteUsername}`} leftIcon={<ArrowLeft size={16} />} colorScheme="blue">
              Back to {athleteUsername}'s Profile
            </Button>
          ) : (
            <Button as={Link} href="/" leftIcon={<ArrowLeft size={16} />} colorScheme="blue">
              Back to Home
            </Button>
          )}
        </Box>
      </VStack>
    </Container>
  )
}
