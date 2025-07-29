"use client"

import { Box, VStack, HStack, Text, Heading, Card, CardBody, Badge, SimpleGrid, Icon, Divider } from "@chakra-ui/react"
import { Users, Hash, Trophy } from "lucide-react"
import type { AthleteTeam } from "@/types/database"

interface TeamsSectionProps {
  teams: AthleteTeam[]
  primaryColor: string
  textColor: string
  mutedTextColor: string
  cardBgColor: string
  borderColor: string
  isDarkTheme?: boolean
}

export function TeamsSection({
  teams,
  primaryColor,
  textColor,
  mutedTextColor,
  cardBgColor,
  borderColor,
  isDarkTheme = false,
}: TeamsSectionProps) {
  if (teams.length === 0) {
    return null
  }

  // Separate current and past teams
  const currentTeams = teams.filter((team) => team.is_current)
  const pastTeams = teams.filter((team) => !team.is_current)

  return (
    <Box>
      <Heading size="lg" mb={6} color={textColor}>
        <HStack spacing={2}>
          <Icon as={Users} color={primaryColor} />
          <Text>Teams & Organizations</Text>
        </HStack>
      </Heading>

      <VStack spacing={6} align="stretch">
        {/* Current Teams */}
        {currentTeams.length > 0 && (
          <Box>
            <Heading size="md" mb={4} color={textColor}>
              Current Teams
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {currentTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  primaryColor={primaryColor}
                  textColor={textColor}
                  mutedTextColor={mutedTextColor}
                  cardBgColor={cardBgColor}
                  borderColor={borderColor}
                  isDarkTheme={isDarkTheme}
                />
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Past Teams */}
        {pastTeams.length > 0 && (
          <Box>
            <Heading size="md" mb={4} color={textColor}>
              Previous Teams
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {pastTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  primaryColor={primaryColor}
                  textColor={textColor}
                  mutedTextColor={mutedTextColor}
                  cardBgColor={cardBgColor}
                  borderColor={borderColor}
                  isDarkTheme={isDarkTheme}
                />
              ))}
            </SimpleGrid>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

interface TeamCardProps {
  team: AthleteTeam
  primaryColor: string
  textColor: string
  mutedTextColor: string
  cardBgColor: string
  borderColor: string
  isDarkTheme: boolean
}

function TeamCard({
  team,
  primaryColor,
  textColor,
  mutedTextColor,
  cardBgColor,
  borderColor,
  isDarkTheme,
}: TeamCardProps) {
  const stats = (team.stats as Record<string, any>) || {}
  const hasStats = Object.keys(stats).length > 0

  return (
    <Card bg={cardBgColor} borderColor={borderColor} variant="outline">
      <CardBody>
        <VStack spacing={3} align="stretch">
          {/* Team Header */}
          <VStack spacing={1} align="start">
            <HStack spacing={2} align="center">
              <Heading size="sm" color={textColor}>
                {team.team_name}
              </Heading>
              {team.is_current && (
                <Badge colorScheme="green" variant="subtle" size="sm">
                  Current
                </Badge>
              )}
            </HStack>
            {team.league && (
              <Text fontSize="sm" color={mutedTextColor}>
                {team.league}
              </Text>
            )}
          </VStack>

          {/* Team Details */}
          <VStack spacing={2} align="stretch">
            {team.position && (
              <HStack>
                <Text fontSize="sm" fontWeight="medium" color={textColor} minW="16">
                  Position:
                </Text>
                <Text fontSize="sm" color={mutedTextColor}>
                  {team.position}
                </Text>
              </HStack>
            )}

            {team.jersey_number && (
              <HStack>
                <Icon as={Hash} size={14} color={primaryColor} />
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  {team.jersey_number}
                </Text>
              </HStack>
            )}

            {team.season && (
              <HStack>
                <Text fontSize="sm" fontWeight="medium" color={textColor} minW="16">
                  Season:
                </Text>
                <Text fontSize="sm" color={mutedTextColor}>
                  {team.season}
                </Text>
              </HStack>
            )}
          </VStack>

          {/* Statistics */}
          {hasStats && (
            <>
              <Divider borderColor={borderColor} />
              <Box>
                <HStack spacing={2} mb={2}>
                  <Icon as={Trophy} size={14} color={primaryColor} />
                  <Text fontSize="sm" fontWeight="medium" color={textColor}>
                    Statistics
                  </Text>
                </HStack>
                <SimpleGrid columns={2} spacing={2}>
                  {Object.entries(stats).map(([key, value]) => (
                    <VStack key={key} spacing={0} align="start">
                      <Text fontSize="xs" color={mutedTextColor}>
                        {key}
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        {value}
                      </Text>
                    </VStack>
                  ))}
                </SimpleGrid>
              </Box>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
