"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  Switch,
  useToast,
  Grid,
  GridItem,
  Badge,
  Divider,
  Flex,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react"
import { User, Palette, Eye, Save } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { AthleteProfile } from "@/types/database"
import { hasFeature, getTierDisplayName, getTierColor } from "@/utils/tierFeatures"

const SPORTS_OPTIONS = [
  "Football",
  "Basketball",
  "Baseball",
  "Soccer",
  "Track & Field",
  "Swimming",
  "Tennis",
  "Golf",
  "Volleyball",
  "Wrestling",
  "Softball",
  "Cross Country",
  "Lacrosse",
  "Hockey",
  "Other",
]

const GRADE_OPTIONS = [
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
  "College Freshman",
  "College Sophomore",
  "College Junior",
  "College Senior",
]

const POSITION_OPTIONS: Record<string, string[]> = {
  Football: [
    "Quarterback",
    "Running Back",
    "Wide Receiver",
    "Tight End",
    "Offensive Line",
    "Defensive Line",
    "Linebacker",
    "Cornerback",
    "Safety",
    "Kicker",
    "Punter",
  ],
  Basketball: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
  Baseball: [
    "Pitcher",
    "Catcher",
    "First Base",
    "Second Base",
    "Third Base",
    "Shortstop",
    "Left Field",
    "Center Field",
    "Right Field",
    "Designated Hitter",
  ],
  Soccer: ["Goalkeeper", "Defender", "Midfielder", "Forward", "Striker", "Winger"],
  "Track & Field": ["Sprints", "Distance", "Hurdles", "Jumps", "Throws", "Multi-Events"],
  Swimming: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "Individual Medley", "Distance"],
  Tennis: ["Singles", "Doubles"],
  Golf: ["Individual"],
  Volleyball: ["Outside Hitter", "Middle Blocker", "Setter", "Libero", "Opposite Hitter", "Defensive Specialist"],
  Wrestling: ["Lightweight", "Middleweight", "Heavyweight"],
  Softball: [
    "Pitcher",
    "Catcher",
    "First Base",
    "Second Base",
    "Third Base",
    "Shortstop",
    "Left Field",
    "Center Field",
    "Right Field",
  ],
  "Cross Country": ["Distance Runner"],
  Lacrosse: ["Attack", "Midfield", "Defense", "Goalie"],
  Hockey: ["Forward", "Defense", "Goalie"],
  Other: ["Position 1", "Position 2", "Position 3"],
}

export default function ProfilePage() {
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    athlete_name: "",
    sport: "",
    sports: [] as string[],
    grade: "",
    graduation_year: "",
    school: "",
    location: "",
    bio: "",
    height: "",
    weight: "",
    gpa: "",
    sat_score: "",
    act_score: "",
    positions_played: [] as string[],
    primary_color: "#1a202c",
    secondary_color: "#2d3748",
    theme_mode: "light",
    email: "",
    phone: "",
    show_email: false,
    show_phone: false,
  })

  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchAthleteData()
  }, [])

  const fetchAthleteData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: athleteData, error } = await supabase.from("athletes").select("*").eq("user_id", user.id).single()

      if (error) {
        console.error("Error fetching athlete:", error)
        return
      }

      setAthlete(athleteData)
      setFormData({
        athlete_name: athleteData.athlete_name || "",
        sport: athleteData.sport || "",
        sports: athleteData.sports || [],
        grade: athleteData.grade || "",
        graduation_year: athleteData.graduation_year?.toString() || "",
        school: athleteData.school || "",
        location: athleteData.location || "",
        bio: athleteData.bio || "",
        height: athleteData.height || "",
        weight: athleteData.weight || "",
        gpa: athleteData.gpa?.toString() || "",
        sat_score: athleteData.sat_score?.toString() || "",
        act_score: athleteData.act_score?.toString() || "",
        positions_played: athleteData.positions_played || [],
        primary_color: athleteData.primary_color || "#1a202c",
        secondary_color: athleteData.secondary_color || "#2d3748",
        theme_mode: athleteData.theme_mode || "light",
        email: athleteData.email || "",
        phone: athleteData.phone || "",
        show_email: athleteData.show_email || false,
        show_phone: athleteData.show_phone || false,
      })
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!athlete) return

    setSaving(true)
    try {
      const updateData = {
        athlete_name: formData.athlete_name,
        sport: formData.sport,
        sports: hasMultipleSports ? (formData.sports.length > 0 ? formData.sports : null) : null,
        grade: formData.grade || null,
        graduation_year: formData.graduation_year ? Number.parseInt(formData.graduation_year) : null,
        school: formData.school || null,
        location: formData.location || null,
        bio: formData.bio || null,
        height: formData.height || null,
        weight: formData.weight || null,
        gpa: formData.gpa ? Number.parseFloat(formData.gpa) : null,
        sat_score: formData.sat_score ? Number.parseInt(formData.sat_score) : null,
        act_score: formData.act_score ? Number.parseInt(formData.act_score) : null,
        positions_played: formData.positions_played.length > 0 ? formData.positions_played : null,
        primary_color: hasCustomTheming ? formData.primary_color : athlete.primary_color,
        secondary_color: hasCustomTheming ? formData.secondary_color : athlete.secondary_color,
        theme_mode: hasCustomTheming ? formData.theme_mode : athlete.theme_mode,
        email: formData.email || null,
        phone: formData.phone || null,
        show_email: formData.show_email,
        show_phone: formData.show_phone,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("athletes").update(updateData).eq("id", athlete.id)

      if (error) throw error

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      // Refresh athlete data
      await fetchAthleteData()
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error updating profile",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePositionToggle = (position: string) => {
    setFormData((prev) => ({
      ...prev,
      positions_played: prev.positions_played.includes(position)
        ? prev.positions_played.filter((p) => p !== position)
        : [...prev.positions_played, position],
    }))
  }

  const handleSportToggle = (sport: string) => {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.includes(sport) ? prev.sports.filter((s) => s !== sport) : [...prev.sports, sport],
    }))
  }

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Container>
    )
  }

  if (!athlete) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Profile not found!</AlertTitle>
          <AlertDescription>Unable to load your athlete profile. Please try refreshing the page.</AlertDescription>
        </Alert>
      </Container>
    )
  }

  const currentTier = (athlete.subscription_tier || "free") as "free" | "premium" | "pro"
  const hasCustomTheming = hasFeature(currentTier, "custom_theming")
  const hasMultipleSports = hasFeature(currentTier, "multiple_sports")
  const availablePositions = POSITION_OPTIONS[formData.sport] || []

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            <HStack spacing={2}>
              <Icon as={User} color="blue.500" />
              <Text>Profile Settings</Text>
              <Badge colorScheme={getTierColor(currentTier)} variant="subtle">
                {getTierDisplayName(currentTier)}
              </Badge>
            </HStack>
          </Heading>
          <Text color="gray.600">Manage your athlete profile information and preferences</Text>
        </Box>

        {/* Basic Information */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Basic Information
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={formData.athlete_name}
                    onChange={(e) => setFormData({ ...formData, athlete_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Primary Sport</FormLabel>
                  <Select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value, positions_played: [] })}
                    placeholder="Select your primary sport"
                  >
                    {SPORTS_OPTIONS.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Grade Level</FormLabel>
                  <Select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="Select your grade"
                  >
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Graduation Year</FormLabel>
                  <Input
                    type="number"
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                    placeholder="2025"
                    min="2020"
                    max="2030"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>School</FormLabel>
                  <Input
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    placeholder="Your school name"
                  />
                </FormControl>
              </GridItem>
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
            </Grid>
            <FormControl mt={4}>
              <FormLabel>Bio</FormLabel>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself, your goals, and achievements..."
                rows={4}
              />
            </FormControl>
          </CardBody>
        </Card>

        {/* Physical & Academic Stats */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Physical & Academic Stats
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>Height</FormLabel>
                  <Input
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="5'10&quot;"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Weight</FormLabel>
                  <Input
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="170 lbs"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>GPA</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    placeholder="3.75"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>SAT Score</FormLabel>
                  <Input
                    type="number"
                    min="400"
                    max="1600"
                    value={formData.sat_score}
                    onChange={(e) => setFormData({ ...formData, sat_score: e.target.value })}
                    placeholder="1200"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>ACT Score</FormLabel>
                  <Input
                    type="number"
                    min="1"
                    max="36"
                    value={formData.act_score}
                    onChange={(e) => setFormData({ ...formData, act_score: e.target.value })}
                    placeholder="28"
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Sports & Positions */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Sports & Positions
            </Heading>

            {/* Additional Sports - Only for Pro */}
            <FormControl mb={6}>
              <FormLabel>
                Additional Sports (Optional)
                {!hasMultipleSports && (
                  <Badge ml={2} colorScheme="purple" variant="outline">
                    Pro
                  </Badge>
                )}
              </FormLabel>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Select any additional sports you play besides your primary sport
              </Text>
              {hasMultipleSports ? (
                <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={2}>
                  {SPORTS_OPTIONS.filter((sport) => sport !== formData.sport).map((sport) => (
                    <GridItem key={sport}>
                      <Button
                        size="sm"
                        variant={formData.sports.includes(sport) ? "solid" : "outline"}
                        colorScheme={formData.sports.includes(sport) ? "blue" : "gray"}
                        onClick={() => handleSportToggle(sport)}
                        w="full"
                      >
                        {sport}
                      </Button>
                    </GridItem>
                  ))}
                </Grid>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Pro Feature</AlertTitle>
                    <AlertDescription>
                      Upgrade to Pro to add multiple sports to your profile.{" "}
                      <Button as={Link} href="/subscription" size="sm" colorScheme="blue" variant="link">
                        Upgrade Now
                      </Button>
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </FormControl>

            <Divider mb={6} />

            {/* Positions */}
            {formData.sport && availablePositions.length > 0 && (
              <FormControl>
                <FormLabel>Positions Played in {formData.sport}</FormLabel>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  Select all positions you can play
                </Text>
                <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={2}>
                  {availablePositions.map((position) => (
                    <GridItem key={position}>
                      <Button
                        size="sm"
                        variant={formData.positions_played.includes(position) ? "solid" : "outline"}
                        colorScheme={formData.positions_played.includes(position) ? "green" : "gray"}
                        onClick={() => handlePositionToggle(position)}
                        w="full"
                      >
                        {position}
                      </Button>
                    </GridItem>
                  ))}
                </Grid>
              </FormControl>
            )}
          </CardBody>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Contact Information
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </FormControl>
                <FormControl mt={2}>
                  <HStack>
                    <Switch
                      isChecked={formData.show_email}
                      onChange={(e) => setFormData({ ...formData, show_email: e.target.checked })}
                    />
                    <Text fontSize="sm">Show email on public profile</Text>
                  </HStack>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </FormControl>
                <FormControl mt={2}>
                  <HStack>
                    <Switch
                      isChecked={formData.show_phone}
                      onChange={(e) => setFormData({ ...formData, show_phone: e.target.checked })}
                    />
                    <Text fontSize="sm">Show phone on public profile</Text>
                  </HStack>
                </FormControl>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Theme & Appearance - Premium+ Feature */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              <HStack spacing={2}>
                <Icon as={Palette} color="purple.500" />
                <Text>Theme & Appearance</Text>
                {!hasCustomTheming && (
                  <Badge colorScheme="blue" variant="outline">
                    Premium+
                  </Badge>
                )}
              </HStack>
            </Heading>

            {hasCustomTheming ? (
              <>
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Theme Mode</FormLabel>
                      <Select
                        value={formData.theme_mode}
                        onChange={(e) => setFormData({ ...formData, theme_mode: e.target.value })}
                      >
                        <option value="light">Light Theme</option>
                        <option value="dark">Dark Theme</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Primary Color</FormLabel>
                      <Input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        h="40px"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Secondary Color</FormLabel>
                      <Input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        h="40px"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>

                {/* Color Preview */}
                <Box mt={4} p={4} borderRadius="md" border="1px solid" borderColor="gray.200">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Color Preview:
                  </Text>
                  <HStack spacing={4}>
                    <Badge bg={formData.primary_color} color="white" px={3} py={1}>
                      Primary Color
                    </Badge>
                    <Badge bg={formData.secondary_color} color="white" px={3} py={1}>
                      Secondary Color
                    </Badge>
                  </HStack>
                </Box>
              </>
            ) : (
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Premium Feature</AlertTitle>
                  <AlertDescription>
                    Customize your profile colors and theme with Premium or Pro plans.{" "}
                    <Button as={Link} href="/subscription" size="sm" colorScheme="blue" variant="link">
                      Upgrade Now
                    </Button>
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </CardBody>
        </Card>

        {/* Save Button */}
        <Flex justify="end">
          <Button
            leftIcon={<Save size={16} />}
            colorScheme="blue"
            size="lg"
            onClick={handleSave}
            isLoading={saving}
            loadingText="Saving..."
          >
            Save Profile
          </Button>
        </Flex>

        {/* Public Profile Link */}
        {athlete.username && (
          <Card bg="blue.50" borderColor="blue.200">
            <CardBody>
              <HStack spacing={2} mb={2}>
                <Icon as={Eye} color="blue.500" />
                <Text fontWeight="semibold" color="blue.700">
                  Your Public Profile
                </Text>
              </HStack>
              <Text fontSize="sm" color="blue.600" mb={3}>
                Your profile is available at:
                <Text as="span" fontWeight="medium" ml={1}>
                  {typeof window !== "undefined" ? window.location.origin : ""}/{athlete.username}
                </Text>
              </Text>
              <Button
                as="a"
                href={`/${athlete.username}`}
                target="_blank"
                size="sm"
                colorScheme="blue"
                variant="outline"
              >
                View Public Profile
              </Button>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  )
}
