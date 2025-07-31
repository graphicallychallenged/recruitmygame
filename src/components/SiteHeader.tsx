"use client"

import { Box, Container, Flex, HStack, VStack, Button, Image, useBreakpointValue } from "@chakra-ui/react"
import { ArrowRight, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isMobile) {
    return (
      <Box as="nav" py={4} px={4} bg="white" borderBottom="1px" borderColor="gray.200" shadow="sm">
        <Container maxW="7xl">
          <VStack spacing={4} align="stretch">
            {/* Logo - Full width on mobile */}
            <Box textAlign="center">
              <Link href="/">
                <Image src="/logo-h.png" alt="RecruitMyGame" height="40px" cursor="pointer" mx="auto" />
              </Link>
            </Box>

            {/* Navigation buttons - Full width on mobile */}
            {!loading && (
              <HStack spacing={3} justify="center" flexWrap="wrap">
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      color="gray.700"
                      _hover={{ bg: "gray.50", color: "teal.600" }}
                      leftIcon={<User size={16} />}
                      size="sm"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" color="gray.700" _hover={{ bg: "gray.50", color: "teal.600" }} size="sm">
                      Sign In
                    </Button>
                  </Link>
                )}
                <Link href="/subscription">
                  <Button
                    bg="teal.500"
                    color="white"
                    _hover={{ bg: "teal.600", transform: "translateY(-2px)", shadow: "lg" }}
                    rightIcon={<ArrowRight size={16} />}
                    transition="all 0.3s"
                    size="sm"
                  >
                    Get Started
                  </Button>
                </Link>
              </HStack>
            )}
          </VStack>
        </Container>
      </Box>
    )
  }

  // Desktop layout
  return (
    <Box as="nav" py={4} px={6} bg="white" borderBottom="1px" borderColor="gray.200" shadow="sm">
      <Container maxW="7xl">
        <Flex justify="space-between" align="center">
          <Link href="/">
            <Image src="/logo-h.png" alt="RecruitMyGame" height="40px" cursor="pointer" />
          </Link>
          <HStack spacing={4}>
            {!loading && (
              <>
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      color="gray.700"
                      _hover={{ bg: "gray.50", color: "teal.600" }}
                      leftIcon={<User size={16} />}
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" color="gray.700" _hover={{ bg: "gray.50", color: "teal.600" }}>
                      Sign In
                    </Button>
                  </Link>
                )}
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
              </>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
