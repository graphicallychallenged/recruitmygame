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
} from "@chakra-ui/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage("Check your email for the confirmation link!")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push("/dashboard")
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="md" py={12}>
      <Card>
        <CardHeader textAlign="center">
          <Heading size="lg">{isSignUp ? "Create Account" : "Sign In"}</Heading>
          <Text color="gray.600">
            {isSignUp ? "Create your athlete recruitment profile" : "Access your athlete dashboard"}
          </Text>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleAuth}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  minLength={6}
                />
              </FormControl>

              {message && (
                <Alert status={message.includes("Check your email") ? "success" : "error"}>
                  <AlertIcon />
                  {message}
                </Alert>
              )}

              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={loading}
                loadingText={isSignUp ? "Creating account..." : "Signing in..."}
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </VStack>
          </form>

          <Box textAlign="center" mt={4}>
            <Link color="blue.500" onClick={() => setIsSignUp(!isSignUp)} cursor="pointer">
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Link>
          </Box>
        </CardBody>
      </Card>
    </Container>
  )
}
