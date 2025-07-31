"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
} from "@chakra-ui/react"
import { User, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client"

export default function CreateProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")

  useEffect(() => {
    checkUserAndProfile()
  }, [])

  const checkUserAndProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      setUser(session.user)

      // Check if user already has a profile
      const { data: athleteData } = await supabase.from("athletes").select("id").eq("user_id", session.user.id).single()

      if (athleteData) {
        // User already has a profile, redirect to dashboard
        router.push("/dashboard")
        return
      }
    } catch (error) {
      console.error("Error checking user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = () => {
    router.push("/dashboard/profile")
  }

  if (loading) {
    return (
      <Center h="100vh" bg={bgColor}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="2xl" py={20}>
        <Center>
          <Card maxW="lg" shadow="xl" bg={cardBg} borderRadius="2xl">
            <CardBody p={12}>
              <VStack spacing={8} textAlign="center">
                <Box p={6} bg="blue.50" borderRadius="full">
                  <Icon as={User} size={48} color="blue.500" />
                </Box>

                <VStack spacing={4}>
                  <Heading size="xl" fontWeight="bold">
                    Welcome to RecruitMyGame
                  </Heading>
                  <Text fontSize="lg" color="gray.600" maxW="md">
                    Create your athlete profile to start showcasing your achievements and connecting with coaches.
                  </Text>
                </VStack>

                <VStack spacing={4} w="full">
                  <Text fontSize="md" color="gray.500">
                    Ready to get started?
                  </Text>
                  <Button
                    size="lg"
                    colorScheme="teal"
                    rightIcon={<ArrowRight size={20} />}
                    onClick={handleCreateProfile}
                    w="full"
                    py={6}
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    Create Your Profile
                  </Button>
                </VStack>

                {user && (
                  <Text fontSize="sm" color="gray.500">
                    Signed in as {user.email}
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Center>
      </Container>
    </Box>
  )
}
