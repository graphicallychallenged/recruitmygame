"use client"

import { Box, Container, VStack, HStack, Text, Heading, Badge, Button, Wrap, WrapItem, Avatar } from "@chakra-ui/react"
import { MapPin, Calendar, GraduationCap, Mail, Phone } from "lucide-react"
import type { AthleteProfile } from "@/types/database"

interface HeroSectionProps {
  athlete: AthleteProfile
  heroImage: string
  primaryColor: string
  secondaryColor: string
  onContactClick: () => void
}

export function HeroSection({ athlete, heroImage, primaryColor, secondaryColor, onContactClick }: HeroSectionProps) {
  return (
    <Box
      position="relative"
      h={{ base: "400px", md: "500px" }}
      bgImage={`url('${heroImage}')`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
    >
      {/* Overlay */}
      <Box position="absolute" inset={0} bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center">
        <Container maxW="6xl">
          <VStack spacing={4} textAlign="center" color="white">
            {athlete.profile_picture_url && (
              <Avatar
                size="2xl"
                src={athlete.profile_picture_url}
                name={athlete.athlete_name}
                border="4px solid white"
              />
            )}
            <VStack spacing={2}>
              <Heading size="2xl" fontWeight="bold">
                {athlete.athlete_name}
              </Heading>
              <HStack spacing={4} flexWrap="wrap" justify="center">
                <Badge variant="solid" fontSize="md" px={3} py={1} bg={primaryColor} color="white">
                  {athlete.sport}
                </Badge>
                {athlete.sports && athlete.sports.length > 0 && (
                  <>
                    {athlete.sports.map((sport) => (
                      <Badge key={sport} variant="solid" fontSize="sm" px={2} py={1} bg={secondaryColor} color="white">
                        {sport}
                      </Badge>
                    ))}
                  </>
                )}
              </HStack>
              {athlete.positions_played && athlete.positions_played.length > 0 && (
                <Wrap justify="center" mt={2}>
                  {athlete.positions_played.map((position) => (
                    <WrapItem key={position}>
                      <Badge
                        colorScheme="green"
                        variant="outline"
                        fontSize="sm"
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
              <HStack spacing={6} fontSize="lg" flexWrap="wrap" justify="center">
                {athlete.school && (
                  <HStack>
                    <GraduationCap size={20} />
                    <Text>{athlete.school}</Text>
                  </HStack>
                )}
                {athlete.location && (
                  <HStack>
                    <MapPin size={20} />
                    <Text>{athlete.location}</Text>
                  </HStack>
                )}
                {athlete.graduation_year && (
                  <HStack>
                    <Calendar size={20} />
                    <Text>Class of {athlete.graduation_year}</Text>
                  </HStack>
                )}
              </HStack>
              {/* Contact Buttons */}
              <HStack spacing={4} mt={4}>
                {athlete.email && athlete.show_email && (
                  <Button
                    as="a"
                    href={`mailto:${athlete.email}`}
                    leftIcon={<Mail size={16} />}
                    size="md"
                    variant="solid"
                    bg={primaryColor}
                    color="white"
                    _hover={{ opacity: 0.8 }}
                  >
                    Email
                  </Button>
                )}
                {athlete.phone && athlete.show_phone && (
                  <Button
                    as="a"
                    href={`tel:${athlete.phone}`}
                    leftIcon={<Phone size={16} />}
                    size="md"
                    variant="solid"
                    bg={secondaryColor}
                    color="white"
                    _hover={{ opacity: 0.8 }}
                  >
                    Call
                  </Button>
                )}
                <Button
                  leftIcon={<Mail size={16} />}
                  size="md"
                  variant="outline"
                  borderColor="white"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={onContactClick}
                >
                  Contact
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}
