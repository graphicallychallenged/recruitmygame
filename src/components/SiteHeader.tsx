"use client"

import { Box, Container, Flex, HStack, Button, Image } from "@chakra-ui/react"
import { ArrowRight, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

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
