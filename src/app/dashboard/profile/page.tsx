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
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Spinner,
  Flex,
  Textarea,
  Switch,
  Badge,
  useToast,
} from "@chakra-ui/react"
import { Plus, Save, Eye, EyeOff, ExternalLink } from "lucide-react"
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload"
import Link from "next/link"

interface AthleteProfile {
  id: string
  user_id: string
  username: string
  athlete_name: string
  sport: string
  school: string
  location: string
  grade: string
  gpa: number | null
  graduation_year: number | null
  positions_played: string[]
  profile_picture_url: string
  bio: string
  height: string
  weight: string
  primary_color: string
  secondary_color: string
  content_order: string[]
  is_profile_public: boolean
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPosition, setNewPosition] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [previewMode, setPreviewMode] = useState(false)
  const toast = useToast()

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
    profile_picture_url: "",
    bio: "",
    height: "",
    weight: "",
    primary_color: "#1a202c",
    secondary_color: "#2d3748",
    content_order: ["videos", "awards", "photos", "schedule", "reviews", "contact"] as string[],
    is_profile_public: true,
  })

  useEffect(() => {
    const fetchAthlete = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please log in to access your profile",
            status: "error",
            duration: 5000,
            isClosable: true,
          })
          return
        }

        setUserId(session.user.id)

        const { data, error } = await supabase.from("athletes").select("*").eq("user_id", session.user.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

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
            profile_picture_url: data.profile_picture_url || "",
            bio: data.bio || "",
            height: data.height || "",
            weight: data.weight || "",
            primary_color: data.primary_color || "#1a202c",
            secondary_color: data.secondary_color || "#2d3748",
            content_order: data.content_order || ["videos", "awards", "photos", "schedule", "reviews", "contact"],
            is_profile_public: data.is_profile_public ?? true,
          })
        }
      } catch (error: any) {
        console.error("Error fetching athlete:", error)
        toast({
          title: "Error loading profile",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAthlete()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) throw new Error("Not authenticated")

      // Validate required fields
      if (!formData.username.trim()) {
        throw new Error("Username is required")
      }
      if (!formData.athlete_name.trim()) {
        throw new Error("Full name is required")
      }
      if (!formData.sport.trim()) {
        throw new Error("Sport is required")
      }

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_-]+$/
      if (!usernameRegex.test(formData.username)) {
        throw new Error("Username can only contain letters, numbers, hyphens, and underscores")
      }

      const updateData = {
        ...formData,
        gpa: formData.gpa ? Number.parseFloat(formData.gpa) : null,
        graduation_year: formData.graduation_year ? Number.parseInt(formData.graduation_year) : null,
        updated_at: new Date().toISOString(),
      }

      if (athlete) {
        // Check if username is taken by another user
        if (formData.username !== athlete.username) {
          const { data: existingUser } = await supabase
            .from("athletes")
            .select("id")
            .eq("username", formData.username)
            .neq("id", athlete.id)
            .single()

          if (existingUser) {
            throw new Error("Username is already taken")
          }
        }

        // Update existing athlete
        const { error } = await supabase.from("athletes").update(updateData).eq("id", athlete.id)

        if (error) throw error

        setAthlete({ ...athlete, ...updateData })

        // Dispatch event to notify other components
        window.dispatchEvent(
          new CustomEvent("profilePictureUpdated", {
            detail: { athleteId: athlete.id, newUrl: updateData.profile_picture_url },
          }),
        )

        toast({
          title: "Profile updated!",
          description: "Your athlete profile has been successfully updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        // Check if username is taken
        const { data: existingUser } = await supabase
          .from("athletes")
          .select("id")
          .eq("username", formData.username)
          .single()

        if (existingUser) {
          throw new Error("Username is already taken")
        }

        // Create new athlete
        const { data, error } = await supabase
          .from("athletes")
          .insert({
            ...updateData,
            user_id: session.user.id,
          })
          .select()
          .single()

        if (error) throw error

        setAthlete(data)
        toast({
          title: "Profile created!",
          description: "Your athlete profile has been successfully created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error saving profile",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleProfilePictureUpdate = async (imageUrl: string) => {
    // Update form data immediately for UI
    setFormData({ ...formData, profile_picture_url: imageUrl })

    // Also update in database immediately
    if (athlete) {
      try {
        const { error } = await supabase
          .from("athletes")
          .update({
            profile_picture_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", athlete.id)

        if (error) throw error

        setAthlete({ ...athlete, profile_picture_url: imageUrl })

        // Dispatch event to notify other components
        window.dispatchEvent(
          new CustomEvent("profilePictureUpdated", {
            detail: { athleteId: athlete.id, newUrl: imageUrl },
          }),
        )

        toast({
          title: "Profile picture updated!",
          status: "success",
          duration: 2000,
          isClosable: true,
        })
      } catch (error: any) {
        console.error("Error updating profile picture:", error)
        toast({
          title: "Error updating profile picture",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
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

  const moveContentSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...formData.content_order]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      ;[newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]]
      setFormData({ ...formData, content_order: newOrder })
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
    <Container maxW="6xl">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={2}>
            <Heading size="lg">{athlete ? "Edit Profile" : "Create Profile"}</Heading>
            <HStack spacing={3}>
              {athlete && (
                <Link href={`/${formData.username}`} target="_blank">
                  <Button size="sm" variant="outline" leftIcon={<ExternalLink size={16} />}>
                    View Public Profile
                  </Button>
                </Link>
              )}
              <Button
                size="sm"
                variant="outline"
                leftIcon={previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? "Edit Mode" : "Preview Mode"}
              </Button>
            </HStack>
          </HStack>
          <Text color="gray.600">
            {athlete
              ? "Update your athlete information and customize your recruitment profile"
              : "Set up your athlete recruitment profile to get discovered by coaches"}
          </Text>
          {athlete && (
            <HStack mt={2} spacing={2}>
              <Badge colorScheme={formData.is_profile_public ? "green" : "red"} variant="subtle">
                {formData.is_profile_public ? "Public Profile" : "Private Profile"}
              </Badge>
              {formData.username && (
                <Badge colorScheme="blue" variant="outline">
                  {formData.username}.recruitmygame.com
                </Badge>
              )}
            </HStack>
          )}
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Profile Picture Section */}
            <Card>
              <CardHeader>
                <Heading size="md">Profile Picture</Heading>
                <Text color="gray.600">Upload a professional headshot for your profile</Text>
              </CardHeader>
              <CardBody>
                <Flex justify="center">
                  <ProfilePictureUpload
                    currentImageUrl={formData.profile_picture_url}
                    onImageUpdate={handleProfilePictureUpdate}
                    userId={userId}
                    size="2xl"
                    athleteName={formData.athlete_name || "Profile Picture"}
                  />
                </Flex>
              </CardBody>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <Heading size="md">Basic Information</Heading>
                <Text color="gray.600">Your core athlete details that will appear on your profile</Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={6}>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel>Username</FormLabel>
                        <Input
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                          placeholder="your-username"
                          pattern="[a-zA-Z0-9_-]+"
                          title="Username can only contain letters, numbers, hyphens, and underscores"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          This will be your profile URL: {formData.username || "your-username"}.recruitmygame.com
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
                          <option value="Softball">Softball</option>
                          <option value="Cross Country">Cross Country</option>
                          <option value="Lacrosse">Lacrosse</option>
                          <option value="Hockey">Hockey</option>
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
                          <option value="College Freshman">College Freshman</option>
                          <option value="College Sophomore">College Sophomore</option>
                          <option value="College Junior">College Junior</option>
                          <option value="College Senior">College Senior</option>
                        </Select>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} w="full">
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
                    <GridItem>
                      <FormControl>
                        <FormLabel>Profile Visibility</FormLabel>
                        <HStack>
                          <Switch
                            isChecked={formData.is_profile_public}
                            onChange={(e) => setFormData({ ...formData, is_profile_public: e.target.checked })}
                            colorScheme="green"
                          />
                          <Text fontSize="sm" color="gray.600">
                            {formData.is_profile_public ? "Public" : "Private"}
                          </Text>
                        </HStack>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* Athletic Information */}
            <Card>
              <CardHeader>
                <Heading size="md">Athletic Information</Heading>
                <Text color="gray.600">Sport-specific details and physical attributes</Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={6}>
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

                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                    <GridItem>
                      <FormControl>
                        <FormLabel>Height</FormLabel>
                        <Input
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          placeholder="6'2&quot; or 188 cm"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Weight</FormLabel>
                        <Input
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="185 lbs or 84 kg"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <FormControl w="full">
                    <FormLabel>Bio</FormLabel>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell coaches about yourself, your goals, and what makes you unique as an athlete..."
                      rows={4}
                      maxLength={500}
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {formData.bio.length}/500 characters
                    </Text>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Profile Customization */}
            <Card>
              <CardHeader>
                <Heading size="md">Profile Customization</Heading>
                <Text color="gray.600">Customize the look and layout of your profile</Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={6}>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                    <GridItem>
                      <FormControl>
                        <FormLabel>Primary Color</FormLabel>
                        <HStack>
                          <Input
                            type="color"
                            value={formData.primary_color}
                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                            w="60px"
                            h="40px"
                            p={1}
                          />
                          <Input
                            value={formData.primary_color}
                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                            placeholder="#1a202c"
                          />
                        </HStack>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Used for headers and accent elements
                        </Text>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Secondary Color</FormLabel>
                        <HStack>
                          <Input
                            type="color"
                            value={formData.secondary_color}
                            onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                            w="60px"
                            h="40px"
                            p={1}
                          />
                          <Input
                            value={formData.secondary_color}
                            onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                            placeholder="#2d3748"
                          />
                        </HStack>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Used for secondary elements and borders
                        </Text>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* Save Button */}
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={saving}
              loadingText="Saving..."
              leftIcon={<Save size={20} />}
            >
              {athlete ? "Update Profile" : "Create Profile"}
            </Button>
          </VStack>
        </form>
      </VStack>
    </Container>
  )
}
