"use client"

import { Box, Container, Flex, HStack, Button, Image } from "@chakra-ui/react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function SiteHeader() {
  return (
    <Box as="nav" py={4} px={6} bg="white" borderBottom="1px" borderColor="gray.200" shadow="sm">
      <Container maxW="7xl">
        <Flex justify="space-between" align="center">
          <Link href="/">
            <Image src="/logo-h.png" alt="RecruitMyGame" height="80px" cursor="pointer" />
          </Link>
          <HStack spacing={4}>
            <Link href="/login">
              <Button variant="ghost" color="gray.700" _hover={{ bg: "gray.50", color: "teal.600" }}>
                Sign In
              </Button>
            </Link>
            <Link href="/subscription">
              <Button
                bg="teal.500"
                color="white"
                _hover={{ bg: "teal.600", transform: "translateY(-2px)", shadow: "lg" }}
                rightIcon={<ArrowRight size={16} />}
                transition="all 0.3s"
              >
                Get Started
              </Button>
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
