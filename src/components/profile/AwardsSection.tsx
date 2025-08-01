"use client"

import { Box, VStack, HStack, Text, Heading, Badge, Icon, Wrap, WrapItem, Divider } from "@chakra-ui/react"
import { Trophy, Award, Star, Medal, Crown } from "lucide-react"

interface AwardsSectionProps {
  awards: any[]
  primaryColor: string
  secondaryColor: string
  textColor: string
  mutedTextColor: string
  cardBgColor: string
  borderColor: string
  isDarkTheme: boolean
}

const getAwardTypeIcon = (type: string) => {
  switch (type) {
    case "academic":
      return Trophy
    case "athletic":
      return Medal
    case "leadership":
      return Crown
    case "community":
      return Award
    default:
      return Star
  }
}

const getAwardTypeInfo = (type: string) => {
  switch (type) {
    case "academic":
      return { icon: Trophy, label: "Academic" }
    case "athletic":
      return { icon: Medal, label: "Athletic" }
    case "leadership":
      return { icon: Crown, label: "Leadership" }
    case "community":
      return { icon: Award, label: "Community" }
    default:
      return { icon: Star, label: "Other" }
  }
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
  const athleteAwards = awards || []

  if (athleteAwards.length === 0) {
    return (
      <Box py={8}>
        <VStack spacing={4}>
          <Icon as={Trophy} boxSize={12} color={mutedTextColor} />
          <Text color={mutedTextColor} textAlign="center">
            No awards added yet. Check back later to see this athlete's achievements!
          </Text>
        </VStack>
      </Box>
    )
  }

  // Calculate award statistics using primary/secondary colors
  const awardStats = athleteAwards.reduce(
    (acc, award) => {
      acc[award.award_type] = (acc[award.award_type] || 0) + 1
      acc.total++
      return acc
    },
    { academic: 0, athletic: 0, leadership: 0, community: 0, total: 0 },
  )

  return (
    <VStack spacing={8} align="stretch">
      {/* Awards Statistics */}
      <Box>
        <Heading size="lg" color={textColor} mb={6}>
          Awards & Recognition
        </Heading>
        <Wrap spacing={4}>
              <WrapItem>
            <Badge bg={isDarkTheme ? "gray.700" : "gray.900"} color="white" variant="solid" px={1} py={1} borderRadius="none" fontSize="xs">
              <HStack spacing={2}>
                <Icon as={Trophy} boxSize={4} />
                <Text fontWeight="medium">{awardStats.academic} Academic</Text>
              </HStack>
            </Badge>
          </WrapItem>
          <WrapItem>
            <Badge bg={isDarkTheme ? "gray.700" : "gray.900"} color="white" variant="solid" px={1} py={1} borderRadius="none" fontSize="xs">
              <HStack spacing={2}>
                <Icon as={Medal} boxSize={4} />
                <Text fontWeight="medium">{awardStats.athletic} Athletic</Text>
              </HStack>
            </Badge>
          </WrapItem>
          <WrapItem>
            <Badge bg={isDarkTheme ? "gray.700" : "gray.900"} color="white" variant="solid" px={1} py={1} borderRadius="none" fontSize="xs">
              <HStack spacing={2}>
                <Icon as={Crown} boxSize={4} />
                <Text fontWeight="medium">{awardStats.leadership} Leadership</Text>
              </HStack>
            </Badge>
          </WrapItem>
          <WrapItem>
            <Badge bg={isDarkTheme ? "gray.700" : "gray.900"} color="white" variant="solid" px={1} py={1} borderRadius="none" fontSize="xs">
              <HStack spacing={2}>
                <Icon as={Award} boxSize={4} />
                <Text fontWeight="medium">{awardStats.community} Community</Text>
              </HStack>
            </Badge>
          </WrapItem>
        </Wrap>
      </Box>

      {/* Awards Grid */}
      {awards.slice(0, 5).map((award) => {
        const typeInfo = getAwardTypeInfo(award.award_type)
        return (
          <Box key={award.id}>
            <VStack align="stretch" spacing={3}>
              <HStack spacing={3} align="start">
                <Box
                  p={2}
                  borderRadius="lg"
                  bg={secondaryColor}
                  color={"white"}
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
                <HStack align="end" spacing={1} display={{ base: "none", md: "flex" }}>
                  <Badge fontSize="xs" bg={primaryColor} color="white">
                    {award.level || "Local"}
                  </Badge>
                  <Badge fontSize="xs" bg={secondaryColor} color="white">
                    {new Date(award.award_date).getFullYear()}
                  </Badge>
                  <Badge fontSize="xs" variant="outline" borderColor={secondaryColor} color={secondaryColor}>
                    {award.award_type.charAt(0).toUpperCase() + award.award_type.slice(1)}
                  </Badge>
                </HStack>
              </HStack>
              <HStack spacing={1} display={{ base: "flex", md: "none" }} justify="start" pl={12}>
                <Badge fontSize="xs" bg={primaryColor} color="white">
                  {award.level || "Local"}
                </Badge>
                <Badge fontSize="xs" bg={secondaryColor} color="white">
                  {new Date(award.award_date).getFullYear()}
                </Badge>
                <Badge fontSize="xs" variant="outline" borderColor={secondaryColor} color={secondaryColor}>
                  {award.award_type.charAt(0).toUpperCase() + award.award_type.slice(1)}
                </Badge>
              </HStack>
            </VStack>
            <Divider mt={3} borderColor={borderColor} />
          </Box>
        )
      })}
    </VStack>
  )
}
