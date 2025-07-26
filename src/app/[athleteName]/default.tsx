import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react"

export default function Default() {
  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md" textAlign="center">
        <VStack spacing={4}>
          <Heading size="lg" color="gray.600">
            Loading Profile...
          </Heading>
          <Text color="gray.500">Please wait while we load the athlete profile.</Text>
        </VStack>
      </Container>
    </Box>
  )
}
