"use client"
import { VStack, Button, Alert, AlertIcon, Box, Text } from "@chakra-ui/react"
import { ExternalLink, LogOut } from "lucide-react"

interface CanvaConnectionStatusProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
  connecting: boolean
  disconnecting: boolean
}

export function CanvaConnectionStatus({
  isConnected,
  onConnect,
  onDisconnect,
  connecting,
  disconnecting,
}: CanvaConnectionStatusProps) {
  if (!isConnected) {
    return (
      <>
        <Alert status="info">
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">Connect to Canva</Text>
            <Text fontSize="sm">You'll need to authorize with Canva to generate professional business cards.</Text>
          </Box>
        </Alert>

        <Text fontSize="sm" color="gray.600" textAlign="center">
          Generate professional business cards featuring your athletic profile, complete with QR codes that link
          directly to your RecruitMyGame profile.
        </Text>

        <Button
          leftIcon={<ExternalLink size={16} />}
          colorScheme="purple"
          onClick={onConnect}
          isLoading={connecting}
          loadingText="Connecting..."
          w="full"
        >
          Connect to Canva
        </Button>
      </>
    )
  }

  return (
    <VStack justify="space-between" w="full">
      <Text fontSize="sm" color="gray.600">
        Generate professional business cards featuring your athletic profile, complete with QR codes that link directly
        to your RecruitMyGame profile.
      </Text>
      <Button
        leftIcon={<LogOut size={16} />}
        size="sm"
        variant="outline"
        colorScheme="red"
        onClick={onDisconnect}
        isLoading={disconnecting}
        loadingText="Disconnecting..."
      >
        Disconnect
      </Button>
    </VStack>
  )
}
