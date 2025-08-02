"use client"

import { Box, Container, SimpleGrid, VStack, HStack, Text, Heading, Image, Icon } from "@chakra-ui/react"
import { Facebook, Instagram } from "lucide-react"
import Link from "next/link"

// Custom TikTok icon component
const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

export function SiteFooter() {
  return (
    <Box bg="gray.900" color="white" py={16}>
      <Container maxW="7xl">
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={12}>
          <VStack align="start" spacing={6}>
            <Link href="/">
              <Image
                src="/logo-h.png"
                alt="RecruitMyGame"
                height="30px"
                cursor="pointer"
                filter="brightness(0) invert(1)"
              />
            </Link>
            <Text fontSize="lg" color="gray.400" maxW="sm">
              The complete platform for student-athlete recruitment profiles. Showcase your athletic ability, character,
              and availability.
            </Text>
            <HStack spacing={4}>
              <Box
                as="a"
                href="https://facebook.com/recruitmygame"
                target="_blank"
                rel="noopener noreferrer"
                p={2}
                bg="gray.800"
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: "blue.600" }}
                transition="all 0.3s"
              >
                <Icon as={Facebook} size={20} />
              </Box>
              <Box
                as="a"
                href="https://instagram.com/recruitmygame"
                target="_blank"
                rel="noopener noreferrer"
                p={2}
                bg="gray.800"
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: "pink.500" }}
                transition="all 0.3s"
              >
                <Icon as={Instagram} size={20} />
              </Box>
              <Box
                as="a"
                href="https://tiktok.com/@recruitmygame"
                target="_blank"
                rel="noopener noreferrer"
                p={2}
                bg="gray.800"
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: "gray.600" }}
                transition="all 0.3s"
              >
                <TikTokIcon size={20} />
              </Box>
            </HStack>
          </VStack>

          <VStack align="start" spacing={4}>
            <Heading size="md">Product</Heading>
            <Link href="/subscription">
              <Text color="gray.400" _hover={{ color: "white" }} cursor="pointer">
                Pricing
              </Text>
            </Link>
            <Link href="/demo">
              <Text color="gray.400" _hover={{ color: "white" }} cursor="pointer">
                Demo
              </Text>
            </Link>
            <Link href="/getting-started">
              <Text color="gray.400" _hover={{ color: "white" }} cursor="pointer">
                Getting Started
              </Text>
            </Link>
          </VStack>

          <VStack align="start" spacing={4}>
            <Heading size="md">Support</Heading>
            <Link href="/contact">
              <Text color="gray.400" _hover={{ color: "white" }} cursor="pointer">
                Contact Us
              </Text>
            </Link>
            <Text color="gray.400" _hover={{ color: "white" }} cursor="pointer">
              Help Center
            </Text>
            <Link href="www.facebook.com/groups/recruitmygamecommunity/">
            <Text color="gray.400" _hover={{ color: "white" }} cursor="pointer">
              Community
            </Text>
            </Link>
          </VStack>

          <VStack align="start" spacing={4}>
            <Heading size="md">Legal</Heading>
            <Link href="/privacy">
              <Text color="gray.400" _hover={{ color: "white" }} cursor="pointer">
                Privacy Policy
              </Text>
            </Link>
            <Link href="/terms">
              <Text color="gray.400" _hover={{ color: "white" }} cursor="pointer">
                Terms of Service
              </Text>
            </Link>
            <Link href="/cookies">
              <Text color="gray.400" _hover={{ color: "white" }} cursor="pointer">
                Cookie Policy
              </Text>
            </Link>
          </VStack>
        </SimpleGrid>

        <Box borderTop="1px" borderColor="gray.700" mt={12} pt={8} textAlign="center">
          <Text color="gray.400" fontSize="lg">
            © 2025 Recruit My Game, Inc. All rights reserved. Built for student-athletes by student-athlete parents who want to help their kid showcase their complete
            story. Yes, we are a US-based, family run business!
          </Text>
        </Box>
      </Container>
    </Box>
  )
}
