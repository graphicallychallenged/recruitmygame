"use client"

import { Container, VStack, Heading, Text, Card, CardBody, Button, Icon, Box } from "@chakra-ui/react"
import { CheckCircle, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function VerifyReviewSuccessPage() {
  const router = useRouter()

  return (
    <Container maxW="md" py={12}>
      <Card>
        <CardBody>
          <VStack spacing={6} align="center" textAlign="center">
            <Box>
              <Icon as={CheckCircle} color="green.500" boxSize={16} mb={4} />
              <Icon as={Shield} color="green.500" boxSize={8} />
            </Box>

            <VStack spacing={2}>
              <Heading size="lg" color="green.600">
                Review Submitted Successfully!
              </Heading>
              <Text color="gray.600">
                Thank you for providing your verified review. Your review has been marked as verified and will help this
                athlete in their recruiting process.
              </Text>
            </VStack>

            <VStack spacing={3} w="full">
              <Text fontSize="sm" color="gray.500">
                Your review is now live and marked with a verified badge.
              </Text>

              <Button colorScheme="green" onClick={() => router.push("/")} size="lg">
                Close
              </Button>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  )
}
