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
  Wrap,
  WrapItem,
  Avatar,
  SimpleGrid,
  IconButton,
} from "@chakra-ui/react"
import {
  MapPin,
  Calendar,
  GraduationCap,
  Mail,
  Phone,
  Hand,
  Footprints,
  ChevronDown,
  Instagram,
  Facebook,
  Music,
  Twitter,
  Youtube,
  Linkedin,
  Globe,
} from "lucide-react"
import type { AthleteProfile, RecruitingProfile } from "@/types/database"
import { keyframes } from "@emotion/react"

interface HeroSectionProps {
  athlete: AthleteProfile
  heroImage: string
  primaryColor: string
  secondaryColor: string
  onContactClick: () => void
}

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`

export function HeroSection({ athlete, heroImage, primaryColor, secondaryColor, onContactClick }: HeroSectionProps) {
  const scrollToContent = () => {
    const heroHeight = window.innerHeight
    window.scrollTo({
      top: heroHeight,
      behavior: "smooth",
    })
  }

  return (
    <Box
      position="relative"
      h={{ base: "100vh", md: "500px" }}
      bgImage={`url('${heroImage}')`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
    >
      {/* Overlay */}
      <Box position="absolute" inset={0} bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center">
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 4, md: 6 }} textAlign="center" color="white">
            {athlete.profile_picture_url && (
              <Avatar
                size={{ base: "xl", md: "2xl" }}
                src={athlete.profile_picture_url}
                name={athlete.athlete_name}
                border="4px solid white"
              />
            )}
            <VStack spacing={{ base: 3, md: 2 }}>
              <Heading size={{ base: "xl", md: "2xl" }} fontWeight="bold">
                {athlete.athlete_name}
              </Heading>

              {/* Sport and Additional Sports */}
              <VStack spacing={2}>
                <Badge
                  variant="solid"
                  fontSize={{ base: "sm", md: "md" }}
                  px={3}
                  py={1}
                  bg={primaryColor}
                  color="white"
                >
                  {athlete.sport}
                </Badge>
                {athlete.sports && athlete.sports.length > 0 && (
                  <Wrap justify="center" spacing={2}>
                    {athlete.sports.map((sport) => (
                      <WrapItem key={sport}>
                        <Badge variant="solid" fontSize="xs" px={2} py={1} bg={secondaryColor} color="white">
                          {sport}
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </VStack>

              {/* Positions */}
              {athlete.positions_played && athlete.positions_played.length > 0 && (
                <Wrap justify="center" spacing={2}>
                  {athlete.positions_played.map((position) => (
                    <WrapItem key={position}>
                      <Badge
                        colorScheme="green"
                        variant="outline"
                        fontSize="xs"
                        px={2}
                        py={1}
                        color="white"
                        borderColor="white"
                      >
                        {position}
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              )}

              {/* Athlete Information - Mobile Optimized */}
              <VStack spacing={{ base: 2, md: 4 }} fontSize={{ base: "sm", md: "lg" }}>
                {/* School */}
                {athlete.school && (
                  <HStack spacing={2}>
                    <GraduationCap size={16} />
                    <Text fontWeight="medium">{athlete.school}</Text>
                  </HStack>
                )}

                {/* Location and Graduation Year */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="full">
                  {athlete.location && (
                    <HStack justify="center" spacing={2}>
                      <MapPin size={16} />
                      <Text>{athlete.location}</Text>
                    </HStack>
                  )}
                  {athlete.graduation_year && (
                    <HStack justify="center" spacing={2}>
                      <Calendar size={16} />
                      <Text>Class of {athlete.graduation_year}</Text>
                    </HStack>
                  )}
                </SimpleGrid>

                {/* Dominant Foot and Hand */}
                {(athlete.dominant_foot || athlete.dominant_hand) && (
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="full">
                    {athlete.dominant_foot && (
                      <HStack justify="center" spacing={2}>
                        <Footprints size={16} />
                        <Text>Dominant {athlete.dominant_foot} Foot</Text>
                      </HStack>
                    )}
                    {athlete.dominant_hand && (
                      <HStack justify="center" spacing={2}>
                        <Hand size={16} />
                        <Text>Dominant {athlete.dominant_hand} Hand</Text>
                      </HStack>
                    )}
                  </SimpleGrid>
                )}
              </VStack>

              {/* Contact Buttons - Mobile Optimized */}
              <VStack spacing={3} w="full" maxW={{ base: "280px", md: "400px" }}>
                <HStack spacing={2} w="full">
                  {athlete.email && athlete.show_email && (
                    <Button
                      as="a"
                      href={`mailto:${athlete.email}`}
                      leftIcon={<Mail size={14} />}
                      size={{ base: "sm", md: "md" }}
                      variant="solid"
                      bg={primaryColor}
                      color="white"
                      _hover={{ opacity: 0.8 }}
                      flex={1}
                      fontSize={{ base: "xs", md: "sm" }}
                    >
                      Email
                    </Button>
                  )}
                  {athlete.phone && athlete.show_phone && (
                    <Button
                      as="a"
                      href={`tel:${athlete.phone}`}
                      leftIcon={<Phone size={14} />}
                      size={{ base: "sm", md: "md" }}
                      variant="solid"
                      bg={secondaryColor}
                      color="white"
                      _hover={{ opacity: 0.8 }}
                      flex={1}
                      fontSize={{ base: "xs", md: "sm" }}
                    >
                      Call
                    </Button>
                  )}
                </HStack>

              </VStack>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Scroll Down Arrow - Mobile Only */}
      <Box
        position="absolute"
        bottom={6}
        left="50%"
        transform="translateX(-50%)"
        display={{ base: "block", md: "none" }}
      >
        <IconButton
          aria-label="Scroll to content"
          icon={<ChevronDown size={24} />}
          variant="ghost"
          color="white"
          size="lg"
          onClick={scrollToContent}
          animation={`${bounce} 2s infinite`}
          _hover={{
            bg: "whiteAlpha.200",
            transform: "scale(1.1)",
          }}
          transition="all 0.2s"
        />
      </Box>
    </Box>
  )
}
