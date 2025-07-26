"use client"

import { Box, VStack, HStack, Text, Heading, Badge, Card, CardBody, SimpleGrid, Divider } from "@chakra-ui/react"
import { Trophy, Medal, Star, Calendar } from "lucide-react"

interface Award {
  id: string
  title: string
  description: string
  award_type: string
  award_date: string
  organization: string
  level: string
}

interface AwardsDisplayProps {
  awards: Award[]
  primaryColor?: string
  showStats?: boolean
  compact?: boolean
}

const AWARD_TYPES = [
  { value: "academic", label: "Academic", icon: Star, color: "blue" },
  { value: "athletic", label: "Athletic", icon: Trophy, color: "yellow" },
  { value: "leadership", label: "Leadership", icon: Trophy, color: "purple" },
  { value: "community", label: "Community Service", icon: Medal, color: "green" },
  { value: "other", label: "Other", icon: Trophy, color: "gray" },
]

export function AwardsDisplay({
  awards,
  primaryColor = "#1a202c",
  showStats = true,
  compact = false,
}: AwardsDisplayProps) {
  if (!awards || awards.length === 0) {
    return (
      <Box textAlign="center" py={8} color="gray.500">
        <Trophy size={32} style={{ margin: "0 auto 16px" }} />
        <Text>No awards to display yet</Text>
      </Box>
    )
  }

  const getAwardTypeInfo = (type: string) => {
    return AWARD_TYPES.find((t) => t.value === type) || AWARD_TYPES[4]
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "international":
        return "red"
      case "national":
        return "purple"
      case "state":
        return "blue"
      case "regional":
        return "green"
      case "local":
        return "gray"
      default:
        return "gray"
    }
  }

  const groupAwardsByYear = (awards: Award[]) => {
    const grouped = awards.reduce(
      (acc, award) => {
        const year = new Date(award.award_date).getFullYear().toString()
        if (!acc[year]) {
          acc[year] = []
        }
        acc[year].push(award)
        return acc
      },
      {} as Record<string, Award[]>,
    )

    return Object.keys(grouped)
      .sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
      .reduce(
        (acc, year) => {
          acc[year] = grouped[year]
          return acc
        },
        {} as Record<string, Award[]>,
      )
  }

  const awardStats = AWARD_TYPES.map((type) => ({
    ...type,
    count: awards.filter((award) => award.award_type === type.value).length,
  })).filter((stat) => stat.count > 0)

  const groupedAwards = groupAwardsByYear(awards)

  if (compact) {
    return (
      <VStack spacing={4} align="stretch">
        {awards.slice(0, 6).map((award) => {
          const typeInfo = getAwardTypeInfo(award.award_type)
          return (
            <HStack key={award.id} spacing={3} p={3} bg="gray.50" borderRadius="md">
              <Box color={`${typeInfo.color}.500`} flexShrink={0}>
                <typeInfo.icon size={20} />
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <Text fontWeight="semibold" fontSize="sm">
                  {award.title}
                </Text>
                {award.organization && (
                  <Text fontSize="xs" color="gray.600">
                    {award.organization}
                  </Text>
                )}
                <HStack spacing={2}>
                  <Badge colorScheme={getLevelBadgeColor(award.level)} variant="outline" fontSize="xs">
                    {award.level.charAt(0).toUpperCase() + award.level.slice(1)}
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(award.award_date).getFullYear()}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          )
        })}
        {awards.length > 6 && (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            +{awards.length - 6} more awards
          </Text>
        )}
      </VStack>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Award Statistics */}
      {showStats && awardStats.length > 0 && (
        <Card>
          <CardBody>
            <Heading size="sm" mb={4} color={primaryColor}>
              Recognition Summary
            </Heading>
            <SimpleGrid columns={{ base: 2, md: awardStats.length > 3 ? 4 : awardStats.length }} spacing={4}>
              {awardStats.map((stat) => (
                <VStack key={stat.value} spacing={2} textAlign="center">
                  <Box color={`${stat.color}.500`}>
                    <stat.icon size={24} />
                  </Box>
                  <Text fontSize="xl" fontWeight="bold">
                    {stat.count}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {stat.label}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* Awards Timeline */}
      <VStack spacing={6} align="stretch">
        {Object.entries(groupedAwards).map(([year, yearAwards]) => (
          <Box key={year}>
            <HStack spacing={3} mb={4}>
              <Calendar size={20} color="gray.500" />
              <Heading size="md" color={primaryColor}>
                {year}
              </Heading>
              <Badge colorScheme="blue" variant="subtle">
                {yearAwards.length} award{yearAwards.length !== 1 ? "s" : ""}
              </Badge>
            </HStack>

            <VStack spacing={4} align="stretch">
              {yearAwards.map((award, index) => {
                const typeInfo = getAwardTypeInfo(award.award_type)
                return (
                  <Box key={award.id}>
                    <HStack spacing={4} align="start" p={4} bg="gray.50" borderRadius="md">
                      <Box color={`${typeInfo.color}.500`} flexShrink={0} mt={1}>
                        <typeInfo.icon size={24} />
                      </Box>
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack spacing={2} wrap="wrap">
                          <Heading size="sm">{award.title}</Heading>
                          <Badge colorScheme={typeInfo.color} variant="subtle" fontSize="xs">
                            {typeInfo.label}
                          </Badge>
                          <Badge colorScheme={getLevelBadgeColor(award.level)} variant="outline" fontSize="xs">
                            {award.level.charAt(0).toUpperCase() + award.level.slice(1)}
                          </Badge>
                        </HStack>
                        {award.organization && (
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            {award.organization}
                          </Text>
                        )}
                        {award.description && (
                          <Text fontSize="sm" color="gray.700">
                            {award.description}
                          </Text>
                        )}
                        <Text fontSize="xs" color="gray.500">
                          {new Date(award.award_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Text>
                      </VStack>
                    </HStack>
                    {index < yearAwards.length - 1 && <Divider mt={4} />}
                  </Box>
                )
              })}
            </VStack>
          </Box>
        ))}
      </VStack>
    </VStack>
  )
}
