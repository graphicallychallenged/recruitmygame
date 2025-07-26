"use client"

import { Image, Box, Text } from "@chakra-ui/react"
import { useState } from "react"

interface LogoProps {
  width?: string | number
  height?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
}

export function Logo({ width = 8, height = 8, maxWidth, maxHeight }: LogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageError = () => {
    console.error("Logo failed to load from /logo.png")
    setImageError(true)
  }

  const handleImageLoad = () => {
    console.log("Logo loaded successfully from /logo.png")
    setImageLoaded(true)
  }

  // If image failed to load, show fallback
  if (imageError) {
    return (
      <Box
        w={width}
        h={height}
        maxW={maxWidth}
        maxH={maxHeight}
        bg="blue.500"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
        fontSize="xs"
        fontWeight="bold"
      >
        RMG
      </Box>
    )
  }

  return (
    <Image
      src="/logo-sm.png"
      alt="Recruit My Game Logo"
      w={width}
      h={height}
      maxW={maxWidth}
      maxH={maxHeight}
      onError={handleImageError}
      onLoad={handleImageLoad}
      fallback={
        <Box
          w={width}
          h={height}
          maxW={maxWidth}
          maxH={maxHeight}
          bg="gray.200"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="xs" color="gray.500">
            Loading...
          </Text>
        </Box>
      }
    />
  )
}
