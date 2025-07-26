"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Link,
  Divider,
} from "@chakra-ui/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (isSignUp) {
        console.log("Attempting to sign up with:", email)

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        })

        console.log("Sign up response:", { data, error })

        if (error) throw error

        if (data.user && !data.user.email_confirmed_at) {
          setMessage("Check your email for the confirmation link!")
          setMessageType("success")
        } else if (data.user && data.user.email_confirmed_at) {
          setMessage("Account created successfully! Redirecting to dashboard...")
          setMessageType("success")
          setTimeout(() => router.push("/dashboard"), 2000)
        }
      } else {
        console.log("Attempting to sign in with:", email)

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        console.log("Sign in response:", { data, error })

        if (error) throw error

        setMessage("Signed in successfully! Redirecting...")
        setMessageType("success")
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      setMessage(error.message || "An unexpected error occurred")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  // Quick sign in for development (remove in production)
  const handleQuickSignIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "password123",
      })

      if (error) {
        // If user doesn't exist, create them
        const { error: signUpError } = await supabase.auth.signUp({
          email: "test@example.com",
          password: "password123",
        })

        if (signUpError) throw signUpError
        setMessage("Test account created! You can now sign in.")
        setMessageType("info")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      setMessage(error.message)
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: 6, md: 12 }}>
      <Container maxW="md" px={{ base: 4, md: 6 }}>
        <Card shadow="lg">
          <CardHeader textAlign="center" pb={{ base: 4, md: 6 }}>
            <Heading size={{ base: "md", md: "lg" }} mb={2}>
              {isSignUp ? "Create Account" : "Sign In"}
            </Heading>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
              {isSignUp ? "Create your athlete recruitment profile" : "Access your athlete dashboard"}
            </Text>
          </CardHeader>
          <CardBody pt={0}>
            <form onSubmit={handleAuth}>
              <VStack spacing={{ base: 3, md: 4 }}>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    size={{ base: "md", md: "lg" }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    minLength={6}
                    size={{ base: "md", md: "lg" }}
                  />
                </FormControl>

                {message && (
                  <Alert status={messageType} borderRadius="md">
                    <AlertIcon />
                    <Text fontSize={{ base: "sm", md: "md" }}>{message}</Text>
                  </Alert>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  size={{ base: "md", md: "lg" }}
                  isLoading={loading}
                  loadingText={isSignUp ? "Creating account..." : "Signing in..."}
                >
                  {isSignUp ? "Sign Up" : "Sign In"}
                </Button>
              </VStack>
            </form>

            <Box textAlign="center" mt={{ base: 4, md: 6 }}>
              <Link
                color="blue.500"
                onClick={() => setIsSignUp(!isSignUp)}
                cursor="pointer"
                fontSize={{ base: "sm", md: "md" }}
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </Link>
            </Box>

            {/* Development helper - remove in production */}
            <Box mt={{ base: 4, md: 6 }}>
              <Divider />
              <Text textAlign="center" fontSize="xs" color="gray.500" mt={2} mb={2}>
                Development Only
              </Text>
              <Button variant="outline" size="sm" width="full" onClick={handleQuickSignIn} isLoading={loading}>
                Quick Test Sign In
              </Button>
            </Box>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
