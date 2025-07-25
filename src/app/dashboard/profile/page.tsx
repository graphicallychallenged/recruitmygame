"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
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
  HStack,
  Grid,
  GridItem,
  Select,
  Alert,
  AlertIcon,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Spinner,
  Flex,
} from "@chakra-ui/react"
import { Plus } from "lucide-react"

export default function ProfilePage() {
  const [athlete, setAthlete] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [newPosition, setNewPosition] = useState("")

  const [formData, setFormData] = useState({
    username: "",
    athlete_name: "",
    sport: "",
    school: "",
    location: "",
    grade: "",
    gpa: "",
    graduation_year: "",
    positions_played: [] as string[],
  })

  useEffect(() => {
    const fetchAthlete = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase.from("athletes").select("*").eq("user_id", session.user.id).single()

      if (data) {
        setAthlete(data)
        setFormData({
          username: data.username || "",
          athlete_name: data.athlete_name || "",
          sport: data.sport || "",
          school: data.school || "",
          location: data.location || "",
          grade: data.grade || "",
          gpa: data.gpa?.toString() || "",
          graduation_year: data.graduation_year?.toString() || "",
          positions_played: data.positions_played || [],
        })
      }
      setLoading(false)
    }

    fetchAthlete()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const updateData = {
        ...formData,
        gpa: formData.gpa ? Number.parseFloat(formData.gpa) : null,
        graduation_year: formData.graduation_year ? Number.parseInt(formData.graduation_year) : null,
        updated_at: new Date().toISOString(),
      }

      if (athlete) {
        // Update existing athlete
        const { error } = await supabase.from("athletes").update(updateData).eq("id", athlete.id)

        if (error) throw error
        setMessage("Profile updated successfully!")
      } else {
        // Create new athlete
        const { error } = await supabase.from("athletes").insert({
          ...updateData,
          user_id: session.user.id,
        })

        if (error) throw error
        setMessage("Profile created successfully!")

        // Refetch to get the created athlete
        const { data } = await supabase.from("athletes").select("*").eq("user_id", session.user.id).single()

        if (data) setAthlete(data)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const addPosition = () => {
    if (newPosition.trim() && !formData.positions_played.includes(newPosition.trim())) {
      setFormData({
        ...formData,
        positions_played: [...formData.positions_played, newPosition.trim()],
      })
      setNewPosition("")
    }
  }

  const removePosition = (position: string) => {
    setFormData({
      ...formData,
      positions_played: formData.positions_played.filter((p) => p !== position),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addPosition()
    }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    )
  }

  return (
    <Container maxW="4xl">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            {athlete ? "Edit Profile" : "Create Profile"}
          </Heading>
          <Text color="gray.600">
            {athlete ? "Update your athlete information" : "Set up your athlete recruitment profile"}
          </Text>
        </Box>

        <Card>
          <CardHeader>
            <Heading size="md">Basic Information</Heading>
            <Text color="gray.600">Your core athlete details that will appear on your profile</Text>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Username</FormLabel>
                      <Input
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="your-username"
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        This will be your profile URL: {formData.username}.recruitmygame.com
                      </Text>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        value={formData.athlete_name}
                        onChange={(e) => setFormData({ ...formData, athlete_name: e.target.value })}
                        placeholder="John Smith"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Sport</FormLabel>
                      <Select
                        value={formData.sport}
                        onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                        placeholder="Select sport"
                      >
                        <option value="Football">Football</option>
                        <option value="Basketball">Basketball</option>
                        <option value="Baseball">Baseball</option>
                        <option value="Soccer">Soccer</option>
                        <option value="Track & Field">Track & Field</option>
                        <option value="Swimming">Swimming</option>
                        <option value="Tennis">Tennis</option>
                        <option value="Golf">Golf</option>
                        <option value="Volleyball">Volleyball</option>
                        <option value="Wrestling">Wrestling</option>
                        <option value="Other">Other</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>School</FormLabel>
                      <Input
                        value={formData.school}
                        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                        placeholder="Lincoln High School"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                  <GridItem>
                    <FormControl>
                      <FormLabel>Location</FormLabel>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, State"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Grade</FormLabel>
                      <Select
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="Select grade"
                      >
                        <option value="9th">9th Grade</option>
                        <option value="10th">10th Grade</option>
                        <option value="11th">11th Grade</option>
                        <option value="12th">12th Grade</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                  <GridItem>
                    <FormControl>
                      <FormLabel>GPA</FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        placeholder="3.85"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Graduation Year</FormLabel>
                      <Input
                        type="number"
                        min="2024"
                        max="2030"
                        value={formData.graduation_year}
                        onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                        placeholder="2025"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>

                <FormControl w="full">
                  <FormLabel>Positions Played</FormLabel>
                  <HStack mb={3}>
                    <Input
                      value={newPosition}
                      onChange={(e) => setNewPosition(e.target.value)}
                      placeholder="Add position"
                      onKeyPress={handleKeyPress}
                    />
                    <Button onClick={addPosition} colorScheme="blue" size="sm" leftIcon={<Plus size={16} />}>
                      Add
                    </Button>
                  </HStack>
                  <Wrap>
                    {formData.positions_played.map((position) => (
                      <WrapItem key={position}>
                        <Tag size="md" colorScheme="blue" variant="solid">
                          <TagLabel>{position}</TagLabel>
                          <TagCloseButton onClick={() => removePosition(position)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </FormControl>

                {message && (
                  <Alert status={message.includes("successfully") ? "success" : "error"}>
                    <AlertIcon />
                    {message}
                  </Alert>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  isLoading={saving}
                  loadingText="Saving..."
                >
                  {athlete ? "Update Profile" : "Create Profile"}
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}
