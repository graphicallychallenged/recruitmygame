"use client"

import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Button,
} from "@chakra-ui/react"
import { Trophy, Medal, Star, Plus } from "lucide-react"
import Link from "next/link"

interface AwardsSummaryProps {
  awards: { id: string; title: string; award_type: string; award_date: string; organization: string; level: string }[]
  maxDisplay?: number
}

const AWARD_TYPES = [
  { value: "academic", label: "Academic", icon: Star, color: "blue" },
  { value: "athletic", label: "Athletic", icon: Trophy, color: "yellow" },
  { value: "leadership", label: "Leadership", icon: Trophy, color: "purple" },
  { value: "community", label: "Community Service", icon: Medal, color: "green" },
  { value: "other", label: "Other", icon: Trophy, color: "gray" },
]

export function AwardsSummary({ awards, maxDisplay = 3 }: AwardsSummaryProps) {
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

  const recentAwards = awards
    .sort((a, b) => new Date(b.award_date).getTime() - new Date(a.award_date).getTime())
    .slice(0, maxDisplay)

  const awardStats = AWARD_TYPES.map((type) => ({
    ...type,
    count: awards.filter((award) => award.award_type === type.value).length,
  })).filter((stat) => stat.count > 0)

  return (
    <Card>
      <CardHeader pb={2}>
        <HStack justify="space-between" align="center">
          <Heading size="sm">Recent Awards</Heading>
          <Link href="/dashboard/awards">
            <Button size="xs" variant="ghost" rightIcon={<Plus size={12} />}>
              Manage
            </Button>
          </Link>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        {awards.length === 0 ? (
          <VStack spacing={3} py={4} textAlign="center">
            <Box color="gray.400">
              <Trophy size={32} />
            </Box>
            <Text fontSize="sm" color="gray.500">
              No awards added yet
            </Text>
            <Link href="/dashboard/awards">
              <Button size="sm" colorScheme="teal" leftIcon={<Plus size={14} />}>
                Add Award
              </Button>
            </Link>
          </VStack>
        ) : (
          <VStack spacing={4} align="stretch">
            {/* Quick Stats */}
            {awardStats.length > 0 && (
              <SimpleGrid columns={awardStats.length > 2 ? 3 : awardStats.length} spacing={3}>
                {awardStats.slice(0, 3).map((stat) => (
                  <VStack key={stat.value} spacing={1} textAlign="center">
                    <Box color={`${stat.color}.500`}>
                      <stat.icon size={16} />
                    </Box>
                    <Text fontSize="lg" fontWeight="bold">
                      {stat.count}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {stat.label}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            )}

            {/* Recent Awards List */}
            <VStack spacing={3} align="stretch">
              {recentAwards.map((award) => {
                const typeInfo = getAwardTypeInfo(award.award_type)
                return (
                  <HStack key={award.id} spacing={3} p={2} bg="gray.50" borderRadius="md">
                    <Box color={`${typeInfo.color}.500`} flexShrink={0}>
                      <typeInfo.icon size={16} />
                    </Box>
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                        {award.title}
                      </Text>
                      {award.organization && (
                        <Text fontSize="xs" color="gray.600" noOfLines={1}>
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
            </VStack>

            {awards.length > maxDisplay && (
              <Link href="/dashboard/awards">
                <Button size="sm" variant="outline" width="full">
                  View All {awards.length} Awards
                </Button>
              </Link>
            )}
          </VStack>
        )}
      </CardBody>
    </Card>
  )
}
