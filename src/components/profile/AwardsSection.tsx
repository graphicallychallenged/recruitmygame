"use client"

import { Box, Card, CardBody, Heading, VStack, HStack, Text, Badge, Divider, Icon } from "@chakra-ui/react"
import { Trophy, GraduationCap, Users, Award, Star } from "lucide-react"
import type { AthleteAward } from "@/types/database"

interface AwardsSectionProps {
  awards: AthleteAward[]
  primaryColor: string
  secondaryColor: string
  textColor: string
  mutedTextColor: string
  cardBgColor: string
  borderColor: string
  isDarkTheme: boolean
}

export function AwardsSection({
  awards,
  primaryColor,
  secondaryColor,
  textColor,
  mutedTextColor,
  cardBgColor,
  borderColor,
  isDarkTheme,
}: AwardsSectionProps) {
  if (awards.length === 0) return null

  const getAwardTypeInfo = (type: string) => {
    const types = {
      academic: { icon: GraduationCap },
      athletic: { icon: Trophy },
      leadership: { icon: Users },
      community: { icon: Award },
      other: { icon: Star },
    }
    return types[type as keyof typeof types] || types.other
  }

  return (
    <Card h="fit-content" bg={cardBgColor} borderColor={borderColor}>
      <CardBody>
        <Heading size="md" mb={4} color={textColor}>
          <HStack spacing={2}>
            <Icon as={Trophy} color={primaryColor} />
            <Text>Awards & Honors</Text>
          </HStack>
        </Heading>
        <VStack spacing={4} align="stretch">
          {awards.slice(0, 5).map((award) => {
            const typeInfo = getAwardTypeInfo(award.award_type)

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
                      <Text fontSize="sm" color={mutedTextColor}>
                        {award.organization}
                      </Text>
                      {award.description && (
                        <Text fontSize="sm" color={mutedTextColor}>
                          {award.description}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  <VStack align="end" spacing={1}>
                    <Badge fontSize="xs" bg={secondaryColor} color="white">
                      {new Date(award.award_date).getFullYear()}
                    </Badge>
                    <Badge fontSize="xs" variant="outline" borderColor={secondaryColor} color={secondaryColor}>
                      {award.award_type.charAt(0).toUpperCase() + award.award_type.slice(1)}
                    </Badge>
                  </VStack>
                </HStack>
                <Divider mt={3} borderColor={borderColor} />
              </Box>
            )
          })}
          {awards.length > 5 && (
            <Text fontSize="sm" color={mutedTextColor} textAlign="center">
              +{awards.length - 5} more awards
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
