"use client"

import {
  Box,
  Card,
  CardBody,
  Heading,
  HStack,
  VStack,
  Text,
  IconButton,
  Button,
  SimpleGrid,
  Wrap,
  WrapItem,
} from "@chakra-ui/react"
import { Instagram, Facebook, Music, Twitter, Youtube, Linkedin, Globe, Share2 } from "lucide-react"
import type { AthleteProfile, RecruitingProfile } from "@/types/database"

interface SocialMediaSectionProps {
  athlete: AthleteProfile
  primaryColor: string
  secondaryColor: string
  textColor: string
  mutedTextColor: string
  cardBgColor: string
  borderColor: string
  isDarkTheme: boolean
}

export function SocialMediaSection({
  athlete,
  primaryColor,
  secondaryColor,
  textColor,
  mutedTextColor,
  cardBgColor,
  borderColor,
  isDarkTheme,
}: SocialMediaSectionProps) {
  // Check if athlete has any social media or recruiting profiles
  const hasSocialMedia = !!(
    athlete.instagram ||
    athlete.facebook ||
    athlete.tiktok ||
    athlete.twitter ||
    athlete.youtube ||
    athlete.linkedin ||
    athlete.website
  )

  const hasRecruitingProfiles = !!(
    athlete.maxpreps_url ||
    athlete.ncsa_url ||
    (athlete.other_recruiting_profiles as RecruitingProfile[])?.length
  )

  // Don't render if no social media or recruiting profiles
  if (!hasSocialMedia && !hasRecruitingProfiles) {
    return null
  }

  const socialMediaLinks = [
    {
      platform: "Instagram",
      url: athlete.instagram,
      icon: Instagram,
      color: "#E4405F",
      getUrl: (handle: string) =>
        handle.startsWith("http") ? handle : `https://instagram.com/${handle.replace("@", "")}`,
    },
    {
      platform: "Facebook",
      url: athlete.facebook,
      icon: Facebook,
      color: "#1877F2",
      getUrl: (handle: string) => (handle.startsWith("http") ? handle : `https://facebook.com/${handle}`),
    },
    {
      platform: "TikTok",
      url: athlete.tiktok,
      icon: Music,
      color: "#000000",
      getUrl: (handle: string) =>
        handle.startsWith("http") ? handle : `https://tiktok.com/@${handle.replace("@", "")}`,
    },
    {
      platform: "Twitter",
      url: athlete.twitter,
      icon: Twitter,
      color: "#1DA1F2",
      getUrl: (handle: string) =>
        handle.startsWith("http") ? handle : `https://twitter.com/${handle.replace("@", "")}`,
    },
    {
      platform: "YouTube",
      url: athlete.youtube,
      icon: Youtube,
      color: "#FF0000",
      getUrl: (handle: string) => handle,
    },
    {
      platform: "LinkedIn",
      url: athlete.linkedin,
      icon: Linkedin,
      color: "#0A66C2",
      getUrl: (handle: string) => handle,
    },
    {
      platform: "Website",
      url: athlete.website,
      icon: Globe,
      color: primaryColor,
      getUrl: (handle: string) => handle,
    },
  ]

  const activeSocialMedia = socialMediaLinks.filter((link) => link.url)

  return (
    <Card bg={cardBgColor} borderColor={borderColor}>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Heading size="md" color={textColor}>
            <HStack spacing={2}>
              <Share2 size={20} color={primaryColor} />
              <Text>Connect & Follow</Text>
            </HStack>
          </Heading>

          {/* Social Media Links */}
          {hasSocialMedia && (
            <Box>
              <Text fontSize="sm" color={mutedTextColor} mb={4}>
                Follow {athlete.athlete_name} on social media
              </Text>
              <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
                {activeSocialMedia.map((social) => (
                  <IconButton
                    key={social.platform}
                    as="a"
                    href={social.getUrl(social.url!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    icon={<social.icon size={20} />}
                    size="lg"
                    variant="outline"
                    borderColor={borderColor}
                    color={isDarkTheme ? "white" : social.color}
                    _hover={{
                      bg: social.color,
                      color: "white",
                      borderColor: social.color,
                      transform: "translateY(-2px)",
                    }}
                    transition="all 0.2s"
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Recruiting Profiles */}
          {hasRecruitingProfiles && (
            <Box>
              <Text fontSize="sm" color={mutedTextColor} mb={4}>
                View recruiting profiles
              </Text>
              <Wrap spacing={3}>
                {athlete.maxpreps_url && (
                  <WrapItem>
                    <Button
                      as="a"
                      href={athlete.maxpreps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="outline"
                      borderColor={borderColor}
                      color={textColor}
                      _hover={{
                        bg: primaryColor,
                        color: "white",
                        borderColor: primaryColor,
                      }}
                    >
                      MaxPreps
                    </Button>
                  </WrapItem>
                )}

                {athlete.ncsa_url && (
                  <WrapItem>
                    <Button
                      as="a"
                      href={athlete.ncsa_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="outline"
                      borderColor={borderColor}
                      color={textColor}
                      _hover={{
                        bg: primaryColor,
                        color: "white",
                        borderColor: primaryColor,
                      }}
                    >
                      NCSA
                    </Button>
                  </WrapItem>
                )}

                {((athlete.other_recruiting_profiles as RecruitingProfile[]) || []).map(
                  (profile, index) =>
                    profile.name &&
                    profile.url && (
                      <WrapItem key={index}>
                        <Button
                          as="a"
                          href={profile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          variant="outline"
                          borderColor={borderColor}
                          color={textColor}
                          _hover={{
                            bg: primaryColor,
                            color: "white",
                            borderColor: primaryColor,
                          }}
                        >
                          {profile.name}
                        </Button>
                      </WrapItem>
                    ),
                )}
              </Wrap>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
