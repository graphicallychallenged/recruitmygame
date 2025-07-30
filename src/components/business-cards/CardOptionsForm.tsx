"use client"

import { Box, Text, VStack, HStack, Switch, Badge } from "@chakra-ui/react"
import { Mail, Phone, QrCode, Eye, EyeOff } from "lucide-react"
import type { CardOptions, AthleteCardData } from "@/types/canva"

interface CardOptionsFormProps {
  options: CardOptions
  onChange: (options: CardOptions) => void
  athlete: AthleteCardData
}

export function CardOptionsForm({ options, onChange, athlete }: CardOptionsFormProps) {
  const updateOption = (key: keyof CardOptions, value: boolean) => {
    onChange({ ...options, [key]: value })
  }

  return (
    <Box w="full" p={4} bg="gray.50" borderRadius="md">
      <Text fontWeight="medium" mb={3} fontSize="sm">
        Card Information
      </Text>
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Mail size={16} />
            <Text fontSize="sm">Include Email</Text>
            {!athlete.email && (
              <Badge size="sm" colorScheme="orange">
                Not Set
              </Badge>
            )}
          </HStack>
          <Switch
            isChecked={options.includeEmail}
            onChange={(e) => updateOption("includeEmail", e.target.checked)}
            isDisabled={!athlete.email}
          />
        </HStack>

        <HStack justify="space-between">
          <HStack spacing={2}>
            <Phone size={16} />
            <Text fontSize="sm">Include Phone</Text>
            {!athlete.phone && (
              <Badge size="sm" colorScheme="orange">
                Not Set
              </Badge>
            )}
          </HStack>
          <Switch
            isChecked={options.includePhone}
            onChange={(e) => updateOption("includePhone", e.target.checked)}
            isDisabled={!athlete.phone}
          />
        </HStack>

        <HStack justify="space-between">
          <HStack spacing={2}>
            <QrCode size={16} />
            <Text fontSize="sm">Include QR Code</Text>
          </HStack>
          <Switch isChecked={options.includeQR} onChange={(e) => updateOption("includeQR", e.target.checked)} />
        </HStack>

        <HStack justify="space-between">
          <HStack spacing={2}>
            {options.includePhoto ? <Eye size={16} /> : <EyeOff size={16} />}
            <Text fontSize="sm">Include Profile Photo</Text>
            {!athlete.profile_picture_url && (
              <Badge size="sm" colorScheme="orange">
                Not Set
              </Badge>
            )}
          </HStack>
          <Switch
            isChecked={options.includePhoto}
            onChange={(e) => updateOption("includePhoto", e.target.checked)}
            isDisabled={!athlete.profile_picture_url}
          />
        </HStack>
      </VStack>
    </Box>
  )
}
