"use client"

import { Box, VStack, HStack, Text, Heading, Badge, SimpleGrid, Icon, Tooltip, Flex } from "@chakra-ui/react"
import { keyframes } from "@emotion/react"
import { Target, GraduationCap, Calendar, TrendingUp, Zap, Star, Trophy, Award, Users } from "lucide-react"
import type { AthleteProfile } from "@/types/database"

interface AthleteStatsProps {
  athlete: AthleteProfile
  primaryColor: string
  secondaryColor: string
  isDarkTheme: boolean
  textColor: string
  mutedTextColor: string
  cardBgColor: string
}

// Animation keyframes
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`

export function AthleteStats({
  athlete,
  primaryColor,
  secondaryColor,
  isDarkTheme,
  textColor,
  mutedTextColor,
  cardBgColor,
}: AthleteStatsProps) {
  const getGPAPercentage = (gpa: number | undefined | null) => {
    if (!gpa) return 0
    return Math.min((gpa / 4.0) * 100, 100)
  }

  const getSATPercentage = (score: number | undefined | null) => {
    if (!score) return 0
    return Math.min((score / 1600) * 100, 100)
  }

  const getACTPercentage = (score: number | undefined | null) => {
    if (!score) return 0
    return Math.min((score / 36) * 100, 100)
  }

  // Helper function to convert hex color to RGB values for opacity
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  const enhancedStats = [
    {
      label: "Primary Sport",
      value: athlete.sport,
      icon: Target,
      type: "badge",
      accentColor: primaryColor,
      description: "Main competitive sport",
    },
    {
      label: "Academic Year",
      value: athlete.grade,
      icon: GraduationCap,
      type: "text",
      accentColor: secondaryColor,
      description: "Current grade level",
    },
    {
      label: "Graduation",
      value: athlete.graduation_year?.toString(),
      icon: Calendar,
      type: "text",
      accentColor: primaryColor,
      description: "Expected graduation year",
    },
    {
      label: "Height",
      value: athlete.height,
      icon: TrendingUp,
      type: "text",
      accentColor: secondaryColor,
      description: "Physical measurement",
    },
    {
      label: "Weight",
      value: athlete.weight,
      icon: Zap,
      type: "text",
      accentColor: primaryColor,
      description: "Physical measurement",
    },
    {
      label: "GPA",
      value: athlete.gpa ? athlete.gpa.toFixed(2) : null,
      icon: Star,
      type: "progress",
      accentColor: secondaryColor,
      percentage: getGPAPercentage(athlete.gpa),
      description: "Grade Point Average (4.0 scale)",
    },
    {
      label: "SAT Score",
      value: athlete.sat_score?.toString(),
      icon: Trophy,
      type: "circular",
      accentColor: primaryColor,
      percentage: getSATPercentage(athlete.sat_score),
      description: "Standardized test score (1600 max)",
    },
    {
      label: "ACT Score",
      value: athlete.act_score?.toString(),
      icon: Award,
      type: "circular",
      accentColor: secondaryColor,
      percentage: getACTPercentage(athlete.act_score),
      description: "Standardized test score (36 max)",
    },
  ].filter((stat) => stat.value)

  const renderStatCard = (stat: any, index: number) => {
    const rgb = hexToRgb(stat.accentColor)
    const accentColorRgba = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : "rgba(0, 0, 0, 0.1)"
    const accentColorLight = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` : "rgba(0, 0, 0, 0.2)"

    return (
      <Tooltip key={index} label={stat.description} placement="top" hasArrow>
        <Box
          cursor="pointer"
          transition="all 0.3s ease"
          _hover={{
            transform: "translateY(-4px)",
            shadow: "xl",
            borderColor: stat.accentColor,
          }}
          bg={cardBgColor}
          borderRadius="xl"
          p={6}
          border="2px solid"
          borderColor="transparent"
          position="relative"
          overflow="hidden"
          style={{
            animation: `${fadeIn} 0.6s ease-out`,
            animationDelay: `${index * 0.1}s`,
            animationFillMode: "both",
          }}
        >
          {/* Background gradient accent using athlete's colors */}
          <Box position="absolute" top={0} left={0} right={0} h="4px" bg={stat.accentColor} borderTopRadius="xl" />

          <VStack spacing={4} align="stretch">
            {/* Header with icon and label */}
            <HStack justify="space-between" align="center">
              <HStack spacing={3}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg={accentColorRgba}
                  color={stat.accentColor}
                  border="1px solid"
                  borderColor={accentColorLight}
                >
                  <Icon as={stat.icon} size={20} />
                </Box>
                <Text fontSize="sm" fontWeight="medium" color={mutedTextColor}>
                  {stat.label}
                </Text>
              </HStack>
            </HStack>

            {/* Value display */}
            <Box>
              {stat.type === "badge" && (
                <Badge
                  fontSize="lg"
                  px={4}
                  py={2}
                  borderRadius="lg"
                  fontWeight="bold"
                  bg={stat.accentColor}
                  color="white"
                >
                  {stat.value}
                </Badge>
              )}

              {stat.type === "text" && (
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  {stat.value}
                </Text>
              )}

              {stat.type === "progress" && (
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {stat.value}
                    </Text>
                    <Text fontSize="sm" color={mutedTextColor}>
                      {Math.round(stat.percentage)}%
                    </Text>
                  </HStack>
                  <Box position="relative">
                    <Box h="8px" borderRadius="full" bg={isDarkTheme ? "gray.700" : "gray.100"} overflow="hidden">
                      <Box
                        h="full"
                        bg={stat.accentColor}
                        borderRadius="full"
                        transition="width 1s ease-out"
                        style={{
                          width: `${stat.percentage}%`,
                          animation: `${slideIn} 1s ease-out`,
                          animationDelay: `${index * 0.2 + 0.5}s`,
                          animationFillMode: "both",
                        }}
                      />
                    </Box>
                  </Box>
                </VStack>
              )}

              {stat.type === "circular" && (
                <HStack spacing={4} align="center">
                  <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                    {stat.value}
                  </Text>
                  <Box position="relative">
                    <Box
                      w="60px"
                      h="60px"
                      borderRadius="full"
                      border="6px solid"
                      borderColor={isDarkTheme ? "gray.700" : "gray.100"}
                      position="relative"
                    >
                      <Box
                        position="absolute"
                        top="-6px"
                        left="-6px"
                        w="60px"
                        h="60px"
                        borderRadius="full"
                        border="6px solid transparent"
                        borderTopColor={stat.accentColor}
                        transform={`rotate(${(stat.percentage / 100) * 360}deg)`}
                        transition="transform 1s ease-out"
                        style={{
                          animation: `${pulse} 2s ease-in-out infinite`,
                          animationDelay: `${index * 0.3}s`,
                        }}
                      />
                      <Flex position="absolute" inset={0} align="center" justify="center">
                        <Text fontSize="xs" fontWeight="bold" color={textColor}>
                          {Math.round(stat.percentage)}%
                        </Text>
                      </Flex>
                    </Box>
                  </Box>
                </HStack>
              )}
            </Box>
          </VStack>
        </Box>
      </Tooltip>
    )
  }

  // Don't render the section if no stats have data
  if (enhancedStats.length === 0) {
    return null
  }

  return (
    <Box>
      <Heading size="lg" mb={6} textAlign="center" color={textColor}>
        <HStack spacing={2} justify="center">
          <Icon as={Users} color={primaryColor} />
          <Text>Athlete Profile</Text>
        </HStack>
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {enhancedStats.map((stat, index) => renderStatCard(stat, index))}
      </SimpleGrid>
    </Box>
  )
}
