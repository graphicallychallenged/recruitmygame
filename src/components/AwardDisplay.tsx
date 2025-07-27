"use client"

import { Box, VStack, HStack, Text, Badge, Icon, Divider } from "@chakra-ui/react"
import { Trophy, GraduationCap, Users, Award, Star } from "lucide-react"
import type { AthleteAward } from "@/types/database"

interface AwardsDisplayProps {
  awards: AthleteAward[]
  maxDisplay?: number
  primaryColor: string
  secondaryColor: string
  textColor: string
  mutedTextColor: string
  borderColor: string
  isDarkTheme: boolean
}

const AWARD_TYPES = {
  academic: { icon: GraduationCap, label: "Academic" },
  athletic: { icon: Trophy, label: "Athletic" },
  leadership: { icon: Users, label: "Leadership" },
  community: { icon: Award, label: "Community" },
  other: { icon: Star, label: "Other" },
}

export function AwardsDisplay({
  awards,
  maxDisplay = 5,
  primaryColor,
  secondaryColor,
  textColor,
  mutedTextColor,
  borderColor,
  isDarkTheme,
}: AwardsDisplayProps) {
  const displayedAwards = awards.slice(0, maxDisplay)

  const getAwardTypeInfo = (type: string) => {
    return AWARD_TYPES[type as keyof typeof AWARD_TYPES] || AWARD_TYPES.other
  }

  return (
    <VStack spacing={4} align="stretch">
      {displayedAwards.map((award, index) => {
        const typeInfo = getAwardTypeInfo(award.award_type)
        const isLast = index === displayedAwards.length - 1

        return (
          <Box key={award.id}>
            <HStack justify="space-between" align="start">
              <HStack spacing={3} flex={1}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg={isDarkTheme ? "gray.700" : "gray.100"}
                  color={secondaryColor}
                  flexShrink={0}
                >
                  <Icon as={typeInfo.icon} size={20} />
                </Box>
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="semibold" color={textColor}>
                    {award.title}
                  </Text>
                  {award.organization && (
                    <Text fontSize="sm" color={mutedTextColor}>
                      {award.organization}
                    </Text>
                  )}
                  {award.description && (
                    <Text fontSize="sm" color={mutedTextColor}>
                      {award.description}
                    </Text>
                  )}
                  {award.level && (
                    <Badge fontSize="xs" variant="outline" borderColor={secondaryColor} color={secondaryColor}>
                      {award.level}
                    </Badge>
                  )}
                </VStack>
              </HStack>
              <VStack align="end" spacing={1}>
                <Badge fontSize="xs" bg={secondaryColor} color="white">
                  {new Date(award.award_date).getFullYear()}
                </Badge>
                <Badge fontSize="xs" variant="outline" borderColor={secondaryColor} color={secondaryColor}>
                  {typeInfo.label}
                </Badge>
              </VStack>
            </HStack>
            {!isLast && <Divider mt={3} borderColor={borderColor} />}
          </Box>
        )
      })}
      {awards.length > maxDisplay && (
        <Text fontSize="sm" color={mutedTextColor} textAlign="center">
          +{awards.length - maxDisplay} more awards
        </Text>
      )}
    </VStack>
  )
}
