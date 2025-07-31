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
  HStack,
  Icon,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react"
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  // Theme colors
  const bgOverlay = "linear-gradient(135deg, rgba(132, 204, 22, 0.9) 0%, rgba(20, 184, 166, 0.8) 50%, rgba(6, 182, 212, 0.9) 100%)"
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")

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

  const handleSocialLogin = async (provider: "google" | "facebook" | "github") => {
    setSocialLoading(provider)
    setMessage("")

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error

      // OAuth will redirect, so we don't need to handle success here
    } catch (error: any) {
      console.error(`${provider} auth error:`, error)
      setMessage(error.message || `Failed to sign in with ${provider}`)
      setMessageType("error")
    } finally {
      setSocialLoading(null)
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
    <Box
      minH="100vh"
      position="relative"
      backgroundImage="url('/landing/landing.png')"
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
    
    >
      {/* Background overlay */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} bg={bgOverlay} zIndex={1}/>

      {/* Content */}
      <Flex
        position="relative"
        zIndex={2}
        minH="100vh"
        align="center"
        justify="center"
        py={{ base: 6, md: 12 }}
        px={{ base: 4, md: 6 }}
      >
        <Container maxW="md">
          <Card shadow="2xl" bg={cardBg} borderRadius="xl">
            <CardHeader textAlign="center" pb={{ base: 4, md: 6 }}>
              <img src="/logo-h.png"/>
              <Heading size={{ base: "lg", md: "xl" }} mb={2} color={textColor}>
                {isSignUp ? "Join RecruitMyGame" : "Welcome Back"}
              </Heading>
              <Text color={mutedColor} fontSize={{ base: "sm", md: "md" }}>
                {isSignUp ? "Create your athlete recruitment profile" : "Sign in to your athlete dashboard"}
              </Text>
            </CardHeader>

            <CardBody pt={0}>
              {/* Social Login Buttons */}
              <VStack spacing={3} mb={6}>
                <Button
                  leftIcon={<Icon as={FaGoogle} />}
                  colorScheme="red"
                  variant="outline"
                  width="full"
                  size="lg"
                  isLoading={socialLoading === "google"}
                  loadingText="Connecting..."
                  onClick={() => handleSocialLogin("google")}
                  _hover={{ bg: "red.50", borderColor: "red.300" }}
                >
                  Continue with Google
                </Button>

              {/*   <Button
                  leftIcon={<Icon as={FaFacebook} />}
                  colorScheme="facebook"
                  variant="outline"
                  width="full"
                  size="lg"
                  isLoading={socialLoading === "facebook"}
                  loadingText="Connecting..."
                  onClick={() => handleSocialLogin("facebook")}
                  _hover={{ bg: "blue.50", borderColor: "blue.300" }}
                >
                  Continue with Facebook
                </Button>

                <Button
                  leftIcon={<Icon as={FaGithub} />}
                  colorScheme="gray"
                  variant="outline"
                  width="full"
                  size="lg"
                  isLoading={socialLoading === "github"}
                  loadingText="Connecting..."
                  onClick={() => handleSocialLogin("github")}
                  _hover={{ bg: "gray.50", borderColor: "gray.300" }}
                >
                  Continue with GitHub
                </Button> */}
              </VStack>

              <HStack>
                <Divider />
                <Text fontSize="sm" color={mutedColor} whiteSpace="nowrap">
                  or continue with email
                </Text>
                <Divider />
              </HStack>

              {/* Email/Password Form */}
              <form onSubmit={handleAuth}>
                <VStack spacing={{ base: 4, md: 5 }} mt={6}>
                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      Email Address
                    </FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      size="lg"
                      borderRadius="lg"
                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "sm", md: "md" }} color={textColor}>
                      Password
                    </FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      minLength={6}
                      size="lg"
                      borderRadius="lg"
                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                    />
                  </FormControl>

                  {message && (
                    <Alert status={messageType} borderRadius="lg">
                      <AlertIcon />
                      <Text fontSize={{ base: "sm", md: "md" }}>{message}</Text>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    colorScheme="teal"
                    width="full"
                    size="lg"
                    borderRadius="lg"
                    isLoading={loading}
                    loadingText={isSignUp ? "Creating account..." : "Signing in..."}
                    _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                    transition="all 0.2s"
                  >
                    {isSignUp ? "Create Account" : "Sign In"}
                  </Button>
                </VStack>
              </form>

              <Box textAlign="center" mt={{ base: 6, md: 8 }}>
                <Link
                  color="blue.500"
                  onClick={() => setIsSignUp(!isSignUp)}
                  cursor="pointer"
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="medium"
                  _hover={{ textDecoration: "underline" }}
                >
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </Link>
              </Box>

              {/* Development helper - remove in production */}
              <Box mt={{ base: 6, md: 8 }}>
                <Divider />
                <Text textAlign="center" fontSize="xs" color={mutedColor} mt={3} mb={3}>
                  Development Only
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  width="full"
                  onClick={handleQuickSignIn}
                  isLoading={loading}
                  borderRadius="lg"
                >
                  Quick Test Sign In
                </Button>
              </Box>
            </CardBody>
          </Card>
        </Container>
      </Flex>
    </Box>
  )
}
