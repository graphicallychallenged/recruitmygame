"use client"

import type React from "react"
import { Box, HStack, IconButton, Tooltip, Text, VStack, useColorModeValue } from "@chakra-ui/react"
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon,
} from "react-share"
import { Share2, Copy, Check } from "lucide-react"
import { useState } from "react"

interface SocialShareButtonsProps {
  url: string
  title: string
  description: string
  athleteName: string
  sport: string
  primaryColor?: string
  isDarkTheme?: boolean
  size?: "sm" | "md" | "lg"
  showLabels?: boolean
}

export function SocialShareButtons({
  url,
  title,
  description,
  athleteName,
  sport,
  primaryColor = "#1a202c",
  isDarkTheme = false,
  size = "md",
  showLabels = false,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const bgColor = useColorModeValue("gray.800", "gray.900")
  const borderColor = useColorModeValue("gray.600", "gray.700")
  const textColor = !isDarkTheme ? "gray.900" : "white"
  const iconColor = useColorModeValue("gray.300", "gray.400")
  const helpTextColor = !isDarkTheme ? "gray.900" : "white"

  const iconSize = size === "sm" ? 32 : size === "md" ? 40 : 48
  const buttonSize = size === "sm" ? "sm" : size === "md" ? "md" : "lg"

  // Enhanced sharing content
  const shareTitle = `Check out ${athleteName}'s ${sport} profile!`
  const shareDescription = `${description.slice(0, 200)}...`
  const hashtags = ["RecruitMyGame", sport.replace(/\s+/g, ""), "Recruiting", "StudentAthlete"]

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: url,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    }
  }

  const ShareButton = ({ children, label }: { children: React.ReactNode; label: string }) => (
    <VStack spacing={1}>
      {children}
      {showLabels && (
        <Text fontSize="xs" color={textColor} textAlign="center">
          {label}
        </Text>
      )}
    </VStack>
  )

  return (
    <Box
      bg={isDarkTheme ? bgColor : useColorModeValue("white", "gray.50")}
      border="1px solid"
      borderColor={isDarkTheme ? borderColor : useColorModeValue("gray.200", "gray.300")}
      borderRadius="lg"
      p={6}
      shadow={isDarkTheme ? "dark-lg" : "sm"}
      backdropFilter={isDarkTheme ? "blur(10px)" : "none"}
      position="relative"
      _before={
        isDarkTheme
          ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "lg",
              background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
              pointerEvents: "none",
            }
          : {}
      }
    >
      <VStack spacing={4}>
        <HStack spacing={2} align="center">
          <Share2 size={18} color={iconColor} />
          <Text fontSize="md" fontWeight="semibold" color={textColor}>
            Share Profile
          </Text>
        </HStack>

        <HStack spacing={4} wrap="wrap" justify="center">
          {/* Facebook */}
          <ShareButton label="Facebook">
            <Box transition="all 0.2s" _hover={{ transform: "translateY(-2px)", filter: "brightness(1.1)" }}>
              <FacebookShareButton url={url} quote={shareTitle} hashtag={`#${hashtags[0]}`}>
                <FacebookIcon size={iconSize} round />
              </FacebookShareButton>
            </Box>
          </ShareButton>

          {/* Twitter */}
          <ShareButton label="Twitter">
            <Box transition="all 0.2s" _hover={{ transform: "translateY(-2px)", filter: "brightness(1.1)" }}>
              <TwitterShareButton url={url} title={shareTitle} hashtags={hashtags} related={["RecruitMyGame"]}>
                <TwitterIcon size={iconSize} round />
              </TwitterShareButton>
            </Box>
          </ShareButton>

          {/* LinkedIn */}
          <ShareButton label="LinkedIn">
            <Box transition="all 0.2s" _hover={{ transform: "translateY(-2px)", filter: "brightness(1.1)" }}>
              <LinkedinShareButton url={url} title={shareTitle} summary={shareDescription} source="RecruitMyGame">
                <LinkedinIcon size={iconSize} round />
              </LinkedinShareButton>
            </Box>
          </ShareButton>

          {/* WhatsApp */}
          <ShareButton label="WhatsApp">
            <Box transition="all 0.2s" _hover={{ transform: "translateY(-2px)", filter: "brightness(1.1)" }}>
              <WhatsappShareButton url={url} title={shareTitle} separator=" - ">
                <WhatsappIcon size={iconSize} round />
              </WhatsappShareButton>
            </Box>
          </ShareButton>

          {/* Email */}
          <ShareButton label="Email">
            <Box transition="all 0.2s" _hover={{ transform: "translateY(-2px)", filter: "brightness(1.1)" }}>
              <EmailShareButton
                url={url}
                subject={shareTitle}
                body={`${shareDescription}\n\nView full profile: ${url}`}
              >
                <EmailIcon size={iconSize} round />
              </EmailShareButton>
            </Box>
          </ShareButton>

          {/* Copy Link */}
          <ShareButton label="Copy Link">
            <Tooltip
              label={copied ? "Copied!" : "Copy link"}
              bg={isDarkTheme ? "gray.700" : "gray.800"}
              color={isDarkTheme ? "white" : "white"}
            >
              <IconButton
                aria-label="Copy link"
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={handleCopyLink}
                size={buttonSize}
                borderRadius="full"
                bg={copied ? "green.500" : isDarkTheme ? "gray.600" : primaryColor}
                color="white"
                transition="all 0.2s"
                _hover={{
                  bg: copied ? "green.600" : isDarkTheme ? "gray.500" : primaryColor,
                  opacity: 0.9,
                  transform: "translateY(-2px)",
                }}
                _active={{
                  transform: "translateY(0px)",
                }}
                width={`${iconSize}px`}
                height={`${iconSize}px`}
                shadow={isDarkTheme ? "dark-lg" : "md"}
              />
            </Tooltip>
          </ShareButton>

          {/* Native Share (Mobile) */}
          {typeof navigator !== "undefined" && navigator.share && (
            <ShareButton label="More">
              <Tooltip label="Share via..." bg={isDarkTheme ? "gray.700" : "gray.800"} color="white">
                <IconButton
                  aria-label="Share via native"
                  icon={<Share2 size={16} />}
                  onClick={handleNativeShare}
                  size={buttonSize}
                  borderRadius="full"
                  bg={isDarkTheme ? "gray.600" : primaryColor}
                  color="white"
                  transition="all 0.2s"
                  _hover={{
                    bg: isDarkTheme ? "gray.500" : primaryColor,
                    opacity: 0.9,
                    transform: "translateY(-2px)",
                  }}
                  _active={{
                    transform: "translateY(0px)",
                  }}
                  width={`${iconSize}px`}
                  height={`${iconSize}px`}
                  shadow={isDarkTheme ? "dark-lg" : "md"}
                />
              </Tooltip>
            </ShareButton>
          )}
        </HStack>

        <Text fontSize="sm" color={helpTextColor} textAlign="center" fontWeight="medium" px={2}>
          Help {athleteName} get discovered by sharing their profile!
        </Text>
      </VStack>
    </Box>
  )
}
