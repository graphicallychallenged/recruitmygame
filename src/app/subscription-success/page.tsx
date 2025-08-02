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
  Card,
  CardBody,
  Icon,
  HStack,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react"
import { ArrowLeftCircle, CheckCircle } from "lucide-react"

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const athleteName = searchParams.get("athlete") || "the athlete"

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="2xl" py={16}>
        <Card shadow="lg">
          <CardBody p={8}>
            <VStack spacing={6} textAlign="center">
              <Icon as={CheckCircle} boxSize={16} color="green.500" />

              <VStack spacing={2}>
                <Heading size="xl" color="gray.900">
                  Subscription Verified!
                </Heading>
                <Text fontSize="lg" color="gray.600">
                  You're now subscribed to updates from{" "}
                  <Text as="span" fontWeight="bold" color="teal.600">
                    {athleteName}
                  </Text>
                </Text>
              </VStack>

              <Card bg="teal.50" borderColor="teal.200" borderWidth={2} w="full">
                <CardBody p={6}>
                  <Heading size="md" color="teal.800" mb={4}>
                    What happens next?
                  </Heading>
                  <List spacing={3} textAlign="left">
                    <ListItem>
                      <ListIcon as={CheckCircle} color="teal.600" />
                      <Text as="span" color="teal.700">
                        You'll receive email notifications when {athleteName} adds new content
                      </Text>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircle} color="teal.600" />
                      <Text as="span" color="teal.700">
                        Notifications will only be sent for the content types you selected
                      </Text>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircle} color="teal.600" />
                      <Text as="span" color="teal.700">
                        You can unsubscribe at any time using the link in any notification email
                      </Text>
                    </ListItem>
                  </List>
                </CardBody>
              </Card>

              <HStack spacing={4} flexWrap="wrap" justify="center">
                <Button as={Link} href="/" colorScheme="teal" leftIcon={<ArrowLeftCircle />} size="lg">
                  Return to Home
                </Button>
                <Button
                  as={Link}
                  href={`https://${athleteName.toLowerCase().replace(/\s+/g, "")}.recruitmygame.com`}
                  variant="outline"
                  size="lg"
                >
                  View {athleteName}'s Profile
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
