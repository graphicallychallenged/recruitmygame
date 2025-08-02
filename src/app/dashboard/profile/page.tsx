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
  RadioGroup,
  Radio,
} from "@chakra-ui/react"
import { User, Palette, Eye, Save, Lock } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { AthleteProfile } from "@/types/database"
import { hasFeature, getTierDisplayName, getTierColor } from "@/utils/tierFeatures"
import { HeroImageUpload } from "@/components/HeroImageUpload"
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload"
import { DEMO_ACCOUNT_USERNAMES } from "@/const/const"

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

const DOMINANCE_OPTIONS = ["Left", "Right", "Both"]

const generateUniqueSubdomain = async (baseName: string): Promise<string> => {
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .substring(0, 60)

  // Check if base name is available
  const { data: existing } = await supabase.from("athletes").select("subdomain").eq("subdomain", sanitized).single()

  if (!existing) {
    return sanitized
  }

  // Generate with random 3-digit number
  let attempts = 0
  while (attempts < 10) {
    const randomNum = Math.floor(Math.random() * 900) + 100
    const candidate = `${sanitized}${randomNum}`

    const { data: existingWithNum } = await supabase
      .from("athletes")
      .select("subdomain")
      .eq("subdomain", candidate)
      .single()

    if (!existingWithNum) {
      return candidate
    }
    attempts++
  }

  // Fallback with timestamp
  return `${sanitized}${Date.now().toString().slice(-3)}`
}

export default function ProfilePage() {
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDemoAccount, setIsDemoAccount] = useState(false)
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
    dominant_foot: "",
    dominant_hand: "",
    primary_color: "#1a202c",
    secondary_color: "#2d3748",
    theme_mode: "light",
    default_hero_gender: "male",
    subdomain: "",
    email: "",
    phone: "",
    show_email: false,
    show_phone: false,
    // All social media fields
    instagram: "",
    facebook: "",
    tiktok: "",
    twitter: "",
    youtube: "",
    linkedin: "",
    website: "",
    // Recruiting profile fields
    maxpreps_url: "",
    ncsa_url: "",
    other_recruiting_profiles: [] as { name: string; url: string }[],
    hero_image_url: "",
  })

  const [subdomainChecking, setSubdomainChecking] = useState(false)
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [subdomainError, setSubdomainError] = useState("")

  const toast = useToast()
  const router = useRouter()

  const currentTier = (athlete?.subscription_tier || "free") as "free" | "premium" | "pro"
  const hasCustomTheming = hasFeature(currentTier, "custom_theming")
  const hasMultipleSports = hasFeature(currentTier, "multiple_sports")
  const hasAnalytics = hasFeature(currentTier, "analytics")
  const hasCustomHero = hasFeature(currentTier, "custom_hero")

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

      // Check if this is a demo account
      const isDemo = DEMO_ACCOUNT_USERNAMES.includes(athleteData.username?.toLowerCase() || "")
      setIsDemoAccount(isDemo)

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
        dominant_foot: athleteData.dominant_foot || "",
        dominant_hand: athleteData.dominant_hand || "",
        primary_color: athleteData.primary_color || "#1a202c",
        secondary_color: athleteData.secondary_color || "#2d3748",
        theme_mode: athleteData.theme_mode || "light",
        default_hero_gender: athleteData.default_hero_gender || "male",
        subdomain: athleteData.subdomain || "",
        email: athleteData.email || "",
        phone: athleteData.phone || "",
        show_email: athleteData.show_email || false,
        show_phone: athleteData.show_phone || false,
        // All social media fields
        instagram: athleteData.instagram || "",
        facebook: athleteData.facebook || "",
        tiktok: athleteData.tiktok || "",
        twitter: athleteData.twitter || "",
        youtube: athleteData.youtube || "",
        linkedin: athleteData.linkedin || "",
        website: athleteData.website || "",
        maxpreps_url: athleteData.maxpreps_url || "",
        ncsa_url: athleteData.ncsa_url || "",
        other_recruiting_profiles: (athleteData.other_recruiting_profiles as { name: string; url: string }[]) || [],
        hero_image_url: athleteData.hero_image_url || "",
      })
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainAvailable(null)
      setSubdomainError("")
      return
    }

    // Sanitize subdomain
    const sanitized = subdomain
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 60)

    if (sanitized !== subdomain) {
      setSubdomainError("Subdomain can only contain lowercase letters, numbers, and hyphens")
      setSubdomainAvailable(false)
      return
    }

    if (sanitized.length < 3) {
      setSubdomainError("Subdomain must be at least 3 characters long")
      setSubdomainAvailable(false)
      return
    }

    setSubdomainChecking(true)
    setSubdomainError("")

    try {
      const { data: existing } = await supabase
        .from("athletes")
        .select("id")
        .eq("subdomain", sanitized)
        .neq("id", athlete?.id || "")
        .single()

      if (existing) {
        setSubdomainAvailable(false)
        setSubdomainError("This subdomain is already taken")
      } else {
        setSubdomainAvailable(true)
        setSubdomainError("")
      }
    } catch (error) {
      // No existing record found, subdomain is available
      setSubdomainAvailable(true)
      setSubdomainError("")
    } finally {
      setSubdomainChecking(false)
    }
  }

  useEffect(() => {
    if (!hasFeature(currentTier, "custom_subdomain")) return

    const timeoutId = setTimeout(() => {
      if (formData.subdomain && formData.subdomain !== athlete?.subdomain) {
        checkSubdomainAvailability(formData.subdomain)
      } else {
        setSubdomainAvailable(null)
        setSubdomainError("")
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.subdomain, athlete?.subdomain])

  const handleSave = async () => {
    if (!athlete) return

    // Block demo account saves
    if (isDemoAccount) {
      toast({
        title: "Demo Account",
        description: "Demo accounts cannot be modified. Create your own account to make changes.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    // Validate subdomain if it's being changed
    if (hasFeature(currentTier, "custom_subdomain") && formData.subdomain && formData.subdomain !== athlete.subdomain) {
      if (subdomainAvailable === false || subdomainError) {
        toast({
          title: "Invalid subdomain",
          description: subdomainError || "Please choose a different subdomain",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
        return
      }
    }

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
        dominant_foot: formData.dominant_foot || null,
        dominant_hand: formData.dominant_hand || null,
        primary_color: hasCustomTheming ? formData.primary_color : athlete.primary_color,
        secondary_color: hasCustomTheming ? formData.secondary_color : athlete.secondary_color,
        theme_mode: hasCustomTheming ? formData.theme_mode : athlete.theme_mode,
        default_hero_gender: formData.default_hero_gender,
        subdomain: hasFeature(currentTier, "custom_subdomain") ? formData.subdomain || null : athlete.subdomain,
        email: formData.email || null,
        phone: formData.phone || null,
        show_email: formData.show_email,
        show_phone: formData.show_phone,
        // All social media fields
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        tiktok: formData.tiktok || null,
        twitter: formData.twitter || null,
        youtube: formData.youtube || null,
        linkedin: formData.linkedin || null,
        website: formData.website || null,
        maxpreps_url: formData.maxpreps_url || null,
        ncsa_url: formData.ncsa_url || null,
        other_recruiting_profiles:
          formData.other_recruiting_profiles.length > 0 ? formData.other_recruiting_profiles : null,
        updated_at: new Date().toISOString(),
        hero_image_url: formData.hero_image_url || null,
      }

      // Handle subdomain generation for new profiles without subdomain
      if (!athlete.subdomain && formData.athlete_name) {
        updateData.subdomain = await generateUniqueSubdomain(formData.athlete_name)
      }

      // If custom subdomain is being set/changed, update the username to match
      if (
        hasFeature(currentTier, "custom_subdomain") &&
        formData.subdomain &&
        formData.subdomain !== athlete.subdomain
      ) {
        // Store the old subdomain to potentially invalidate it
        const oldSubdomain = athlete.subdomain

        // Update username to match the new subdomain
        updateData.username = formData.subdomain

        console.log(`Updating username from ${athlete.username} to ${formData.subdomain}`)

        // If there was an old subdomain, we could add logic here to invalidate it
        // For now, we'll just update to the new one
        if (oldSubdomain && oldSubdomain !== formData.subdomain) {
          console.log(`Replacing old subdomain: ${oldSubdomain} with new: ${formData.subdomain}`)
        }
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
    if (isDemoAccount) return
    setFormData((prev) => ({
      ...prev,
      positions_played: prev.positions_played.includes(position)
        ? prev.positions_played.filter((p) => p !== position)
        : [...prev.positions_played, position],
    }))
  }

  const handleSportToggle = (sport: string) => {
    if (isDemoAccount) return
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.includes(sport) ? prev.sports.filter((s) => s !== sport) : [...prev.sports, sport],
    }))
  }

  const addRecruitingProfile = () => {
    if (isDemoAccount) return
    setFormData((prev) => ({
      ...prev,
      other_recruiting_profiles: [...prev.other_recruiting_profiles, { name: "", url: "" }],
    }))
  }

  const updateRecruitingProfile = (index: number, field: "name" | "url", value: string) => {
    if (isDemoAccount) return
    setFormData((prev) => ({
      ...prev,
      other_recruiting_profiles: prev.other_recruiting_profiles.map((profile, i) =>
        i === index ? { ...profile, [field]: value } : profile,
      ),
    }))
  }

  const removeRecruitingProfile = (index: number) => {
    if (isDemoAccount) return
    setFormData((prev) => ({
      ...prev,
      other_recruiting_profiles: prev.other_recruiting_profiles.filter((_, i) => i !== index),
    }))
  }

  const handleHeroImageUpload = (url: string) => {
    if (isDemoAccount) return
    setFormData((prev) => ({
      ...prev,
      hero_image_url: url,
    }))
  }

  // Get the correct URL for the public profile
  const getPublicProfileUrl = () => {
    if (hasFeature(currentTier, "custom_subdomain") && (formData.subdomain || athlete?.subdomain)) {
      return `http://${formData.subdomain || athlete?.subdomain}.recruitmygame.com`
    }
    return `http://${athlete?.username}.recruitmygame.com`
  }

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" color="teal.500" />
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

  const availablePositions = POSITION_OPTIONS[formData.sport] || []

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            <HStack spacing={2}>
              <Icon as={User} color="teal.500" />
              <Text>Profile Settings</Text>
              <Badge colorScheme={getTierColor(currentTier)} variant="subtle">
                {getTierDisplayName(currentTier)}
              </Badge>
              {isDemoAccount && (
                <Badge colorScheme="orange" variant="solid">
                  <HStack spacing={1}>
                    <Lock size={12} />
                    <Text>Demo Account</Text>
                  </HStack>
                </Badge>
              )}
            </HStack>
          </Heading>
          <Text color="gray.600">Manage your athlete profile information and preferences</Text>
          {isDemoAccount && (
            <Alert status="info" mt={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Demo Account - Read Only</AlertTitle>
                <AlertDescription>
                  This is a demo account for showcase purposes. Most fields are read-only.
                  <Link href="/login" style={{ color: "teal", textDecoration: "underline", marginLeft: "4px" }}>
                    Create your own account
                  </Link>{" "}
                  to make changes.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>

        {/* Basic Information */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Basic Information
            </Heading>
            {/* Profile Picture Upload */}
            <Box mb={6}>
              <FormLabel mb={3}>Profile Picture</FormLabel>
              {isDemoAccount ? (
                <Box>
                  <ProfilePictureUpload
                    currentImageUrl={athlete.profile_picture_url}
                    onImageUpdate={() => {}} // No-op for demo
                    userId={athlete.user_id}
                    athleteName={athlete.athlete_name}
                    size="xl"
                    disabled={true}
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    <Icon as={Lock} size={12} mr={1} />
                    Profile picture changes disabled for demo accounts
                  </Text>
                </Box>
              ) : (
                <ProfilePictureUpload
                  currentImageUrl={athlete.profile_picture_url}
                  onImageUpdate={(url) => {
                    setAthlete((prev) => (prev ? { ...prev, profile_picture_url: url } : null))
                    // Dispatch custom event for layout to update
                    window.dispatchEvent(
                      new CustomEvent("profilePictureUpdated", {
                        detail: { athleteId: athlete.id, newUrl: url },
                      }),
                    )
                  }}
                  userId={athlete.user_id}
                  athleteName={athlete.athlete_name}
                  size="xl"
                />
              )}
            </Box>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={formData.athlete_name}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, athlete_name: e.target.value })}
                    placeholder="Enter your full name"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                  {isDemoAccount && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      <Icon as={Lock} size={10} mr={1} />
                      Read-only for demo accounts
                    </Text>
                  )}
                </FormControl>
              </GridItem>
              {hasFeature(currentTier, "custom_subdomain") && (
                <GridItem>
                  <FormControl isInvalid={subdomainAvailable === false || !!subdomainError}>
                    <FormLabel>
                      Custom Subdomain
                      <Badge ml={2} colorScheme="purple" variant="outline">
                        Pro
                      </Badge>
                    </FormLabel>
                    <Input
                      value={formData.subdomain}
                      onChange={(e) => !isDemoAccount && setFormData({ ...formData, subdomain: e.target.value })}
                      placeholder="your-custom-name"
                      isDisabled={subdomainChecking || isDemoAccount}
                      isReadOnly={isDemoAccount}
                      bg={isDemoAccount ? "gray.50" : "white"}
                    />
                    <HStack spacing={2} mt={1}>
                      <Text fontSize="xs" color="gray.500" flex={1}>
                        {formData.subdomain || "your-custom-name"}.recruitmygame.com
                      </Text>
                      {subdomainChecking && <Spinner size="xs" />}
                      {subdomainAvailable === true && (
                        <Text fontSize="xs" color="green.500" fontWeight="medium">
                          ✓ Available
                        </Text>
                      )}
                      {subdomainAvailable === false && (
                        <Text fontSize="xs" color="red.500" fontWeight="medium">
                          ✗ Taken
                        </Text>
                      )}
                    </HStack>
                    {subdomainError && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {subdomainError}
                      </Text>
                    )}
                    {isDemoAccount ? (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        <Icon as={Lock} size={10} mr={1} />
                        Read-only for demo accounts
                      </Text>
                    ) : (
                      <Text fontSize="xs" color="teal.600" mt={2}>
                        💡 Setting a custom subdomain will update your profile URL and username. You can only change this ONCE!
                      </Text>
                    )}
                  </FormControl>
                </GridItem>
              )}
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Primary Sport</FormLabel>
                  <Select
                    value={formData.sport}
                    onChange={(e) =>
                      !isDemoAccount && setFormData({ ...formData, sport: e.target.value, positions_played: [] })
                    }
                    placeholder="Select your primary sport"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  >
                    {SPORTS_OPTIONS.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </Select>
                  {isDemoAccount && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      <Icon as={Lock} size={10} mr={1} />
                      Read-only for demo accounts
                    </Text>
                  )}
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Grade Level</FormLabel>
                  <Select
                    value={formData.grade}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, grade: e.target.value })}
                    placeholder="Select your grade"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
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
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, graduation_year: e.target.value })}
                    placeholder="2025"
                    min="2020"
                    max="2030"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>School</FormLabel>
                  <Input
                    value={formData.school}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, school: e.target.value })}
                    placeholder="Your school name"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
            </Grid>
            <FormControl mt={4}>
              <FormLabel>Bio</FormLabel>
              <Textarea
                value={formData.bio}
                onChange={(e) => !isDemoAccount && setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself, your goals, and achievements..."
                rows={4}
                isReadOnly={isDemoAccount}
                bg={isDemoAccount ? "gray.50" : "white"}
              />
              {isDemoAccount && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  <Icon as={Lock} size={10} mr={1} />
                  Bio editing disabled for demo accounts
                </Text>
              )}
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
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, height: e.target.value })}
                    placeholder="5'10&quot;"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Weight</FormLabel>
                  <Input
                    value={formData.weight}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, weight: e.target.value })}
                    placeholder="170 lbs"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
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
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, gpa: e.target.value })}
                    placeholder="3.75"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
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
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, sat_score: e.target.value })}
                    placeholder="1200"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
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
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, act_score: e.target.value })}
                    placeholder="28"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Dominant Foot</FormLabel>
                  <Select
                    value={formData.dominant_foot}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, dominant_foot: e.target.value })}
                    placeholder="Select dominant foot"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  >
                    {DOMINANCE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Dominant Hand</FormLabel>
                  <Select
                    value={formData.dominant_hand}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, dominant_hand: e.target.value })}
                    placeholder="Select dominant hand"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  >
                    {DOMINANCE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
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
                        colorScheme={formData.sports.includes(sport) ? "teal" : "gray"}
                        onClick={() => handleSportToggle(sport)}
                        w="full"
                        isDisabled={isDemoAccount}
                        opacity={isDemoAccount ? 0.6 : 1}
                      >
                        {sport}
                      </Button>
                    </GridItem>
                  ))}
                </Grid>
              ) : (
                <Alert status="info" colorScheme="teal">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Pro Feature</AlertTitle>
                    <AlertDescription>
                      Upgrade to Pro to add multiple sports to your profile.{" "}
                      <Button as={Link} href="/subscription" size="sm" colorScheme="teal" variant="link">
                        Upgrade Now
                      </Button>
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              {isDemoAccount && hasMultipleSports && (
                <Text fontSize="xs" color="gray.500" mt={2}>
                  <Icon as={Lock} size={10} mr={1} />
                  Sport selection disabled for demo accounts
                </Text>
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
                        colorScheme={formData.positions_played.includes(position) ? "teal" : "gray"}
                        onClick={() => handlePositionToggle(position)}
                        w="full"
                        isDisabled={isDemoAccount}
                        opacity={isDemoAccount ? 0.6 : 1}
                      >
                        {position}
                      </Button>
                    </GridItem>
                  ))}
                </Grid>
                {isDemoAccount && (
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    <Icon as={Lock} size={10} mr={1} />
                    Position selection disabled for demo accounts
                  </Text>
                )}
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
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                  {isDemoAccount && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      <Icon as={Lock} size={10} mr={1} />
                      Contact info protected for demo accounts
                    </Text>
                  )}
                </FormControl>
                <FormControl mt={2}>
                  <HStack>
                    <Switch
                      isChecked={formData.show_email}
                      onChange={(e) => !isDemoAccount && setFormData({ ...formData, show_email: e.target.checked })}
                      isDisabled={isDemoAccount}
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
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
                <FormControl mt={2}>
                  <HStack>
                    <Switch
                      isChecked={formData.show_phone}
                      onChange={(e) => !isDemoAccount && setFormData({ ...formData, show_phone: e.target.checked })}
                      isDisabled={isDemoAccount}
                    />
                    <Text fontSize="sm">Show phone on public profile</Text>
                  </HStack>
                </FormControl>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Social Media & Links */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Social Media & Links
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Add your social media profiles and personal website to help coaches and recruiters connect with you
            </Text>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>Instagram</FormLabel>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@username or full URL"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Facebook</FormLabel>
                  <Input
                    value={formData.facebook}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="Profile URL or username"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>TikTok</FormLabel>
                  <Input
                    value={formData.tiktok}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, tiktok: e.target.value })}
                    placeholder="@username or full URL"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Twitter</FormLabel>
                  <Input
                    value={formData.twitter}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="@username or full URL"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>YouTube</FormLabel>
                  <Input
                    value={formData.youtube}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, youtube: e.target.value })}
                    placeholder="Channel URL"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>LinkedIn</FormLabel>
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="Profile URL"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl>
                  <FormLabel>Personal Website</FormLabel>
                  <Input
                    value={formData.website}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
            </Grid>
            {isDemoAccount && (
              <Text fontSize="xs" color="gray.500" mt={3}>
                <Icon as={Lock} size={10} mr={1} />
                Social media links are read-only for demo accounts
              </Text>
            )}
          </CardBody>
        </Card>

        {/* Recruiting Profiles */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Recruiting Profiles
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Add links to your recruiting profiles to help coaches find more information about you
            </Text>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>MaxPreps Profile</FormLabel>
                  <Input
                    value={formData.maxpreps_url}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, maxpreps_url: e.target.value })}
                    placeholder="https://www.maxpreps.com/..."
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>NCSA Profile</FormLabel>
                  <Input
                    value={formData.ncsa_url}
                    onChange={(e) => !isDemoAccount && setFormData({ ...formData, ncsa_url: e.target.value })}
                    placeholder="https://www.ncsasports.org/..."
                    isReadOnly={isDemoAccount}
                    bg={isDemoAccount ? "gray.50" : "white"}
                  />
                </FormControl>
              </GridItem>
            </Grid>

            {/* Other Recruiting Profiles */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="medium">Other Recruiting Profiles</Text>
                <Button
                  size="sm"
                  colorScheme="teal"
                  variant="outline"
                  onClick={addRecruitingProfile}
                  isDisabled={isDemoAccount}
                >
                  Add Profile
                </Button>
              </HStack>
              <VStack spacing={3}>
                {formData.other_recruiting_profiles.map((profile, index) => (
                  <HStack key={index} w="full" spacing={2}>
                    <Input
                      placeholder="Profile name (e.g., BeRecruited, 247Sports)"
                      value={profile.name}
                      onChange={(e) => updateRecruitingProfile(index, "name", e.target.value)}
                      flex={1}
                      isReadOnly={isDemoAccount}
                      bg={isDemoAccount ? "gray.50" : "white"}
                    />
                    <Input
                      placeholder="Profile URL"
                      value={profile.url}
                      onChange={(e) => updateRecruitingProfile(index, "url", e.target.value)}
                      flex={2}
                      isReadOnly={isDemoAccount}
                      bg={isDemoAccount ? "gray.50" : "white"}
                    />
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeRecruitingProfile(index)}
                      isDisabled={isDemoAccount}
                    >
                      Remove
                    </Button>
                  </HStack>
                ))}
                {formData.other_recruiting_profiles.length === 0 && (
                  <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                    No additional recruiting profiles added yet
                  </Text>
                )}
              </VStack>
              {isDemoAccount && (
                <Text fontSize="xs" color="gray.500" mt={3}>
                  <Icon as={Lock} size={10} mr={1} />
                  Recruiting profile management disabled for demo accounts
                </Text>
              )}
            </Box>
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

            {/* Default Hero Image Gender Selection - Available for all tiers */}
            <FormControl mb={6}>
              <FormLabel>Default Header Image Style</FormLabel>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Choose the style of default header images for your sport
              </Text>
              <RadioGroup
                value={formData.default_hero_gender}
                onChange={(value) => !isDemoAccount && setFormData({ ...formData, default_hero_gender: value })}
                isDisabled={isDemoAccount}
              >
                <HStack spacing={6}>
                  <Radio value="male" isDisabled={isDemoAccount}>
                    Male Athlete Images
                  </Radio>
                  <Radio value="female" isDisabled={isDemoAccount}>
                    Female Athlete Images
                  </Radio>
                </HStack>
              </RadioGroup>
              {isDemoAccount && (
                <Text fontSize="xs" color="gray.500" mt={2}>
                  <Icon as={Lock} size={10} mr={1} />
                  Theme settings disabled for demo accounts
                </Text>
              )}
            </FormControl>

            <Divider mb={6} />

            {hasCustomTheming ? (
              <>
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Theme Mode</FormLabel>
                      <Select
                        value={formData.theme_mode}
                        onChange={(e) => !isDemoAccount && setFormData({ ...formData, theme_mode: e.target.value })}
                        isDisabled={isDemoAccount}
                        bg={isDemoAccount ? "gray.50" : "white"}
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
                        onChange={(e) => !isDemoAccount && setFormData({ ...formData, primary_color: e.target.value })}
                        h="40px"
                        isDisabled={isDemoAccount}
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Secondary Color</FormLabel>
                      <Input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) =>
                          !isDemoAccount && setFormData({ ...formData, secondary_color: e.target.value })
                        }
                        h="40px"
                        isDisabled={isDemoAccount}
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
                {isDemoAccount && (
                  <Text fontSize="xs" color="gray.500" mt={3}>
                    <Icon as={Lock} size={10} mr={1} />
                    Color customization disabled for demo accounts
                  </Text>
                )}
              </>
            ) : (
              <Alert status="info" colorScheme="teal">
                <AlertIcon />
                <Box>
                  <AlertTitle>Premium Feature</AlertTitle>
                  <AlertDescription>
                    Customize your profile colors and theme with Premium or Pro plans.{" "}
                    <Button as={Link} href="/subscription" size="sm" colorScheme="teal" variant="link">
                      Upgrade Now
                    </Button>
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </CardBody>
        </Card>

        {/* Hero Image - Pro Feature */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              <HStack spacing={2}>
                <Icon as={Eye} color="purple.500" />
                <Text>Custom Hero Image</Text>
                {!hasCustomHero && (
                  <Badge colorScheme="purple" variant="outline">
                    Pro
                  </Badge>
                )}
              </HStack>
            </Heading>

            {hasCustomHero ? (
              <>
                {isDemoAccount ? (
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Demo Account Restriction</AlertTitle>
                      <AlertDescription>
                        Hero image uploads are disabled for demo accounts.
                        <Link href="/login" style={{ color: "teal", textDecoration: "underline", marginLeft: "4px" }}>
                          Create your own account
                        </Link>{" "}
                        to upload custom hero images.
                      </AlertDescription>
                    </Box>
                  </Alert>
                ) : (
                  <HeroImageUpload
                    currentHeroUrl={formData.hero_image_url}
                    athleteId={athlete.id}
                    onUploadComplete={handleHeroImageUpload}
                  />
                )}
              </>
            ) : (
              <Alert status="info" colorScheme="teal">
                <AlertIcon />
                <Box>
                  <AlertTitle>Pro Feature</AlertTitle>
                  <AlertDescription>
                    Upload a custom hero image for your profile with Pro plan.{" "}
                    <Button as={Link} href="/subscription" size="sm" colorScheme="teal" variant="link">
                      Upgrade to Pro
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
            colorScheme="teal"
            size="lg"
            onClick={handleSave}
            isLoading={saving}
            loadingText="Saving..."
            isDisabled={isDemoAccount}
          >
            {isDemoAccount ? "Demo Account - Read Only" : "Save Profile"}
          </Button>
        </Flex>

        {/* Public Profile Link */}
        {(athlete.subdomain || athlete.username) && (
          <Card bg="teal.50" borderColor="teal.200">
            <CardBody>
              <HStack spacing={2} mb={2}>
                <Icon as={Eye} color="teal.500" />
                <Text fontWeight="semibold" color="teal.700">
                  Your Public Profile
                </Text>
              </HStack>
              <Text fontSize="sm" color="teal.600" mb={3}>
                Your profile is available at:
                <Text as="span" fontWeight="medium" ml={1}>
                  {getPublicProfileUrl()}
                </Text>
              </Text>
              <Button
                as="a"
                href={getPublicProfileUrl()}
                target="_blank"
                size="sm"
                colorScheme="teal"
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
