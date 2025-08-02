import { Container, Flex, Spinner } from "@chakra-ui/react"

export default function AnalyticsLoading() {
  return (
    <Container maxW="7xl" py={8}>
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="purple.500" />
      </Flex>
    </Container>
  )
}
