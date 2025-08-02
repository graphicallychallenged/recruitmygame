"use client"
import { Box, Heading, Text, VStack, HStack, Badge, Grid, GridItem, Divider, Icon } from "@chakra-ui/react"
import { Users, Calendar, MapPin } from "lucide-react"
import type { AthleteTeam } from "@/types/database"

interface TeamsSectionProps {
  teams: AthleteTeam[]
  primaryColor: string
  textColor: string
  mutedTextColor: string
  cardBgColor: string
  borderColor: string
  isDarkTheme: boolean
}

export function TeamsSection({
  teams,
  primaryColor,
  textColor,
  mutedTextColor,
  cardBgColor,
  borderColor,
  isDarkTheme,
}: TeamsSectionProps) {
  const currentTeams = teams.filter((team) => team.is_current)
  const pastTeams = teams.filter((team) => !team.is_current)

  const renderTeam = (team: AthleteTeam) => (
    <Box
      key={team.id}
      p={6}
      bg={cardBgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: "md", borderColor: primaryColor }}
    >
      <VStack align="start" spacing={4}>
        <HStack justify="space-between" w="full">
          <VStack align="start" spacing={1}>
            <Heading size="md" color={textColor}>
              {team.team_name}
            </Heading>
            <HStack spacing={2}>
              {team.is_current && (
                <Badge colorScheme="green" variant="solid" fontSize="xs">
                  Current Team
                </Badge>
              )}
              {!team.is_public && (
                <Badge colorScheme="gray" variant="outline" fontSize="xs">
                  Private
                </Badge>
              )}
            </HStack>
          </VStack>
        </HStack>

        <HStack spacing={6} wrap="wrap">
          {team.position && (
            <HStack spacing={2}>
              <Icon as={Users} size={16} color={primaryColor} />
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                {team.position}
              </Text>
            </HStack>
          )}

          {team.jersey_number && (
            <HStack spacing={2}>
              <Text fontSize="sm" color={primaryColor} fontWeight="bold">
                #
              </Text>
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                {team.jersey_number}
              </Text>
            </HStack>
          )}

          {team.season && (
            <HStack spacing={2}>
              <Icon as={Calendar} size={16} color={primaryColor} />
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                {team.season}
              </Text>
            </HStack>
          )}

          {team.league && (
            <HStack spacing={2}>
              <Icon as={MapPin} size={16} color={primaryColor} />
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                {team.league}
              </Text>
            </HStack>
          )}
        </HStack>

        {team.stats && Object.keys(team.stats).length > 0 && (
          <Box w="full">
            <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={3}>
              Season Statistics
            </Text>
            <Grid templateColumns="repeat(auto-fit, minmax(100px, 1fr))" gap={3}>
              {Object.entries(team.stats).map(([key, value]) => (
                <GridItem key={key}>
                  <Box
                    textAlign="center"
                    p={3}
                    bg={primaryColor}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <Text fontSize="xl" fontWeight="bold" color={"white"}>
                      {String(value)}
                    </Text>
                    <Text fontSize="xs" color={mutedTextColor} textTransform="capitalize" mt={1}>
                      {key.replace(/_/g, " ")}
                    </Text>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}
      </VStack>
    </Box>
  )

  return (
    <VStack align="start" spacing={8} w="full">
      <HStack spacing={3}>
        <Icon as={Users} color={primaryColor} size={24} />
        <Heading size="lg" color={textColor}>
          Teams
        </Heading>
      </HStack>

      {currentTeams.length > 0 && (
        <Box w="full">
          <Heading size="md" color={textColor} mb={4}>
            Current Teams
          </Heading>
          <VStack spacing={4} align="stretch">
            {currentTeams.map(renderTeam)}
          </VStack>
        </Box>
      )}

      {pastTeams.length > 0 && (
        <Box w="full">
          {currentTeams.length > 0 && <Divider my={6} borderColor={borderColor} />}
          <Heading size="md" color={textColor} mb={4}>
            Past Teams
          </Heading>
          <VStack spacing={4} align="stretch">
            {pastTeams.map(renderTeam)}
          </VStack>
        </Box>
      )}

      {teams.length === 0 && (
        <Box textAlign="center" py={12} w="full">
          <Icon as={Users} size={48} color={mutedTextColor} mb={4} />
          <Text color={mutedTextColor} fontSize="lg" fontStyle="italic">
            No teams added yet.
          </Text>
        </Box>
      )}
    </VStack>
  )
}
