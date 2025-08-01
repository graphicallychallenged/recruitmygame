"use client"

import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Button,
  Avatar,
  Icon,
  Wrap,
  WrapItem,
  IconButton,
} from "@chakra-ui/react"
import { Mail, Phone, Star, ChevronDown, Bell } from "lucide-react"
import type { AthleteProfile } from "@/types/database"
import { keyframes } from "@emotion/react"
import { useState } from "react"
import { ProfileUpdateSubscriptionModal } from "./ProfileUpdateSubscriptionModal"

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0) translateX(-50%);
  }
  40% {
    transform: translateY(-10px) translateX(-50%);
  }
  60% {
    transform: translateY(-5px) translateX(-50%);
  }
`

interface HeroSectionProps {
  athlete: AthleteProfile
  heroImage: string
  primaryColor: string
  secondaryColor: string
  onContactClick: () => void
  showLocation?: boolean
}

export function HeroSection({ athlete, heroImage, primaryColor, secondaryColor, onContactClick, showLocation=true }: HeroSectionProps) {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  // Determine theme colors based on athlete's theme
  const isDarkTheme = athlete.theme_mode === "dark"
  const textColor = isDarkTheme ? "white" : "gray.800"
  const cardBgColor = isDarkTheme ? "gray.800" : "white"
  const borderColor = isDarkTheme ? "gray.600" : "gray.200"

  // Get positions organized by sport
  const getPositionsBySport = () => {
    const sportPositions = athlete.sport_positions as Record<string, string[]> | null
    const result: { sport: string; positions: string[]; isPrimary: boolean }[] = []

    // Add primary sport positions
    if (athlete.sport) {
      const primaryPositions = sportPositions?.[athlete.sport] || athlete.positions_played || []
      if (primaryPositions.length > 0) {
        result.push({
          sport: athlete.sport,
          positions: primaryPositions,
          isPrimary: true,
        })
      }
    }

    // Add additional sports positions
    if (athlete.sports && athlete.sports.length > 0) {
      athlete.sports.forEach((sport) => {
        if (sport !== athlete.sport) {
          const positions = sportPositions?.[sport] || []
          if (positions.length > 0) {
            result.push({
              sport,
              positions,
              isPrimary: false,
            })
          }
        }
      })
    }

    return result
  }

  const positionsBySport = getPositionsBySport()

  // Create tagline from school, location, graduation year
  const createTagline = () => {
    const parts = []
    if (athlete.school) parts.push(athlete.school)
    if (athlete.location && showLocation) parts.push(athlete.location)
    if (athlete.graduation_year) parts.push(`Class of ${athlete.graduation_year}`)
    return parts.join(" • ")
  }

  const handleScrollDown = () => {
    const heroHeight = window.innerHeight
    window.scrollTo({
      top: heroHeight,
      behavior: "smooth",
    })
  }

  return (
    <Box
      position="relative"
      minH={{ base: "100vh", md: "600px" }}
      bgImage={`url(${heroImage})`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      width='100%'
    >
      {/* Overlay */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="blackAlpha.600" />

      {/* Subscription Button - Top Right */}
      {/* <Box position="absolute" top={15} right={15} zIndex={2}>
        <Button
          leftIcon={<Bell size={16} />}
          variant="solid"
          size="sm"
          bg="whiteAlpha.200"
          color="white"
          _hover={{ bg: "whiteAlpha.300", transform: "translateY(-1px)" }}
          _active={{ transform: "translateY(0)" }}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="whiteAlpha.300"
          borderRadius="full"
          fontWeight="semibold"
          transition="all 0.2s"
          onClick={() => setShowSubscriptionModal(true)}
        >
        Subscribe to Athlete Updates
        </Button>
      </Box> */}

      {/* Content */}
      <Container maxW="7xl" position="relative" zIndex={1}>
        <VStack spacing={{ base: 6, md: 8 }} py={{ base: 12, md: 16 }} align="center">
          {/* Profile Picture */}
          <Box position="relative">
            <Avatar
              size="2xl"
              src={athlete.profile_picture_url || undefined}
              name={athlete.athlete_name}
              border="4px solid"
              borderColor="white"
              shadow="xl"
            />

            {/* Subscription Button - Centered under profile, slightly overlapping */}
            <Box position="absolute" bottom="-6" left="50%" transform="translateX(-50%)">
              <Button
                leftIcon={<Bell size={16} />}
                variant="solid"
                size="sm"
                bg="whiteAlpha.200"
                color="white"
                _hover={{ bg: "whiteAlpha.300", transform: "translateY(-1px)" }}
                _active={{ transform: "translateY(0)" }}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius="full"
                fontWeight="semibold"
                transition="all 0.2s"
                onClick={() => setShowSubscriptionModal(true)}
              >
                Subscribe to Athlete Updates
              </Button>
            </Box>
          </Box>

          {/* Name and Tagline */}
          <VStack spacing={2}>
            <Heading size="2xl" color="white" textAlign="center" textShadow="2px 2px 4px rgba(0,0,0,0.5)">
              {athlete.athlete_name}
            </Heading>
            {createTagline() && (
              <Text fontSize="md" color="white" opacity={0.9} textAlign="center">
                {createTagline()}
              </Text>
            )}
          </VStack>

          {/* Sports and Positions - Horizontal Layout */}
          <VStack spacing={4} w="full" maxW="4xl">
            {/* Primary Sport */}
            {athlete.sport && (
              <Badge
                variant="solid"
                fontSize="lg"
                px={6}
                py={3}
                bg={primaryColor}
                color="white"
                borderRadius="full"
                fontWeight="bold"
                textTransform="uppercase"
              >
                <HStack spacing={2}>
                  <Icon as={Star} size={16} fill="currentColor" />
                  <Text>{athlete.sport}</Text>
                </HStack>
              </Badge>
            )}

            {/* Additional Sports */}
            {athlete.sports && athlete.sports.filter((sport) => sport !== athlete.sport).length > 0 && (
              <VStack spacing={3}>
                <Text fontSize="sm" color="white" fontWeight="medium" opacity={0.9}>
                  Also plays:
                </Text>
                <Wrap justify="center" spacing={3}>
                  {athlete.sports
                    .filter((sport) => sport !== athlete.sport)
                    .map((sport) => (
                      <WrapItem key={sport}>
                        <Badge
                          variant="solid"
                          fontSize="sm"
                          px={4}
                          py={2}
                          bg={secondaryColor}
                          color="white"
                          borderRadius="full"
                          textTransform="uppercase"
                        >
                          {sport}
                        </Badge>
                      </WrapItem>
                    ))}
                </Wrap>
              </VStack>
            )}

            {/* Positions by Sport */}
            {positionsBySport.length > 0 && (
              <VStack spacing={4}>
                <Text fontSize="sm" color="white" fontWeight="medium" opacity={0.9}>
                  Positions:
                </Text>
                <HStack spacing={3}>
                  {positionsBySport.map((sportData) => (
                    <VStack key={sportData.sport} spacing={2}>
                      {positionsBySport.length > 1 && (
                        <Text fontSize="xs" color="white" fontWeight="medium" opacity={0.8}>
                          {sportData.sport}:
                        </Text>
                      )}
                      <Wrap justify="center" spacing={2}>
                        {sportData.positions.map((position) => (
                          <WrapItem key={`${sportData.sport}-${position}`}>
                            <Badge
                              variant="outline"
                              fontSize="xs"
                              px={3}
                              py={1}
                              borderColor="white"
                              color="white"
                              borderRadius="full"
                              borderWidth="2px"
                              textTransform="uppercase"
                            >
                              {position}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </VStack>
                  ))}
                </HStack>
              </VStack>
            )}
          </VStack>

          {/* Contact Buttons */}
          <HStack spacing={4}>
            {athlete.email && athlete.show_email && (
              <Button
                leftIcon={<Mail size={16} />}
                variant="solid"
                size="md"
                bg={primaryColor}
                color="white"
                _hover={{ opacity: 0.8 }}
                as="a"
                href={`mailto:${athlete.email}`}
              >
                Email
              </Button>
            )}

            {athlete.phone && athlete.show_phone && (
              <Button
                leftIcon={<Phone size={16} />}
                variant="solid"
                size="md"
                bg={secondaryColor}
                color="white"
                _hover={{ opacity: 0.8 }}
                as="a"
                href={`tel:${athlete.phone}`}
              >
                Call
              </Button>
            )}

            <Button
              leftIcon={<Mail size={16} />}
              variant="solid"
              size="md"
              bg={primaryColor}
              color="white"
              _hover={{ opacity: 0.8 }}
              onClick={onContactClick}
            >
              Contact
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/* Scroll Down Arrow - positioned lower to avoid overlap */}
      <Box position="absolute" bottom={4} left="52%" transform="translateX(-50%)" zIndex={100}>
        <IconButton
          aria-label="Scroll to content"
          icon={<ChevronDown size={24} />}
          variant="ghost"
          color="white"
          size="lg"
          bg="whiteAlpha.200"
          _hover={{ bg: "whiteAlpha.300" }}
          borderRadius="full"
          animation={`${bounce} 2s infinite`}
          onClick={handleScrollDown}
        />
      </Box>

      {/* Subscription Modal */}
      <ProfileUpdateSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        athleteId={athlete.id}
        athleteName={athlete.athlete_name}
        athleteTier={athlete.subscription_tier || "free"}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        textColor={textColor}
        cardBgColor={cardBgColor}
        borderColor={borderColor}
        isDarkTheme={isDarkTheme}
      />
    </Box>
  )
}
