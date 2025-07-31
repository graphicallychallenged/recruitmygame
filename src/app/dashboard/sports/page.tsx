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
  Grid,
  GridItem,
  Badge,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Icon,
  Spinner,
} from "@chakra-ui/react"
import { Trophy, Plus, X, Save, Star } from "lucide-react"
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
  "Field Hockey",
  "Water Polo",
  "Gymnastics",
  "Cheerleading",
  "Dance",
  "Bowling",
  "Fencing",
  "Rowing",
  "Sailing",
  "Skiing",
  "Snowboarding",
  "Surfing",
  "Martial Arts",
  "Boxing",
  "Cycling",
  "Triathlon",
  "Other",
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
  "Field Hockey": ["Forward", "Midfielder", "Defender", "Goalkeeper"],
  "Water Polo": ["Driver", "Point", "Flat", "Goalkeeper"],
  Other: ["Position 1", "Position 2", "Position 3"],
}

interface SportData {
  sport: string
  positions: string[]
  isPrimary: boolean
}

export default function SportsPage() {
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sportsData, setSportsData] = useState<SportData[]>([])
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

      // Initialize sports data using the new sport_positions structure
      const initialSports: SportData[] = []

      // Add primary sport
      if (athleteData.sport) {
        const sportPositions = athleteData.sport_positions as Record<string, string[]> | null
        const primaryPositions = sportPositions?.[athleteData.sport] || athleteData.positions_played || []

        initialSports.push({
          sport: athleteData.sport,
          positions: primaryPositions,
          isPrimary: true,
        })
      }

      // Add additional sports
      if (athleteData.sports && athleteData.sports.length > 0) {
        const sportPositions = athleteData.sport_positions as Record<string, string[]> | null

        athleteData.sports.forEach((sport: string) => {
          initialSports.push({
            sport,
            positions: sportPositions?.[sport] || [],
            isPrimary: false,
          })
        })
      }

      setSportsData(initialSports)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const addSport = (sportName: string) => {
    if (sportsData.some((s) => s.sport === sportName)) {
      toast({
        title: "Sport already added",
        description: "This sport is already in your list.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setSportsData((prev) => [
      ...prev,
      {
        sport: sportName,
        positions: [],
        isPrimary: false,
      },
    ])
  }

  const removeSport = (sportName: string) => {
    setSportsData((prev) => prev.filter((s) => s.sport !== sportName))
  }

  const updateSportPositions = (sportName: string, positions: string[]) => {
    setSportsData((prev) => prev.map((sport) => (sport.sport === sportName ? { ...sport, positions } : sport)))
  }

  const togglePosition = (sportName: string, position: string) => {
    const sport = sportsData.find((s) => s.sport === sportName)
    if (!sport) return

    const newPositions = sport.positions.includes(position)
      ? sport.positions.filter((p) => p !== position)
      : [...sport.positions, position]

    updateSportPositions(sportName, newPositions)
  }

  const handleSave = async () => {
    if (!athlete) return

    setSaving(true)
    try {
      const primarySport = sportsData.find((s) => s.isPrimary)
      const additionalSports = sportsData.filter((s) => !s.isPrimary).map((s) => s.sport)

      // Build sport_positions object
      const sportPositions: Record<string, string[]> = {}
      sportsData.forEach((sport) => {
        if (sport.positions.length > 0) {
          sportPositions[sport.sport] = sport.positions
        }
      })

      // Also maintain backward compatibility with positions_played for primary sport
      const primaryPositions = primarySport?.positions || []

      const updateData = {
        sport: primarySport?.sport || athlete.sport,
        positions_played: primaryPositions,
        sports: additionalSports.length > 0 ? additionalSports : null,
        sport_positions: Object.keys(sportPositions).length > 0 ? sportPositions : null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("athletes").update(updateData).eq("id", athlete.id)

      if (error) throw error

      toast({
        title: "Sports updated!",
        description: "Your sports and positions have been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      // Refresh athlete data
      await fetchAthleteData()
    } catch (error: any) {
      console.error("Error updating sports:", error)
      toast({
        title: "Error updating sports",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container maxW="6xl" py={8}>
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Container>
    )
  }

  if (!athlete) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Profile not found!</AlertTitle>
          <AlertDescription>Unable to load your athlete profile. Please try refreshing the page.</AlertDescription>
        </Alert>
      </Container>
    )
  }

  const currentTier = (athlete.subscription_tier || "free") as "free" | "premium" | "pro"
  const hasMultipleSports = hasFeature(currentTier, "multiple_sports")
  const availableSports = SPORTS_OPTIONS.filter((sport) => !sportsData.some((s) => s.sport === sport))

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            <HStack spacing={2}>
              <Icon as={Trophy} color="blue.500" />
              <Text>Sports & Positions</Text>
              <Badge colorScheme={getTierColor(currentTier)} variant="subtle">
                {getTierDisplayName(currentTier)}
              </Badge>
            </HStack>
          </Heading>
          <Text color="gray.600">Manage your sports and positions to showcase your athletic versatility</Text>
        </Box>

        {!hasMultipleSports && (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>Pro Feature</AlertTitle>
              <AlertDescription>
                Add multiple sports to your profile with Pro plan. Currently showing your primary sport only.{" "}
                <Button as={Link} href="/subscription" size="sm" colorScheme="blue" variant="link">
                  Upgrade to Pro
                </Button>
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Current Sports */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Your Sports
            </Heading>
            <VStack spacing={4} align="stretch">
              {sportsData.map((sportData) => (
                <Box key={sportData.sport} p={4} borderRadius="md" border="1px solid" borderColor="gray.200">
                  <HStack justify="space-between" mb={3}>
                    <HStack spacing={2}>
                      <Text fontWeight="semibold" fontSize="lg">
                        {sportData.sport}
                      </Text>
                      {sportData.isPrimary && (
                        <Badge colorScheme="blue" variant="solid">
                          <HStack spacing={1}>
                            <Star size={12} />
                            <Text>Primary</Text>
                          </HStack>
                        </Badge>
                      )}
                    </HStack>
                    {!sportData.isPrimary && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        leftIcon={<X size={14} />}
                        onClick={() => removeSport(sportData.sport)}
                      >
                        Remove
                      </Button>
                    )}
                  </HStack>

                  {/* Positions */}
                  {POSITION_OPTIONS[sportData.sport] && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
                        Positions ({sportData.positions.length} selected)
                      </Text>
                      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={2}>
                        {POSITION_OPTIONS[sportData.sport].map((position) => (
                          <GridItem key={position}>
                            <Button
                              size="sm"
                              variant={sportData.positions.includes(position) ? "solid" : "outline"}
                              colorScheme={sportData.positions.includes(position) ? "green" : "gray"}
                              onClick={() => togglePosition(sportData.sport, position)}
                              w="full"
                              fontSize="xs"
                            >
                              {position}
                            </Button>
                          </GridItem>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              ))}

              {sportsData.length === 0 && (
                <Text color="gray.500" textAlign="center" py={8}>
                  No sports added yet. Add your primary sport to get started.
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Add New Sport */}
        {hasMultipleSports && availableSports.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Add Additional Sports
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Select additional sports you play to showcase your athletic versatility
              </Text>
              <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={2}>
                {availableSports.map((sport) => (
                  <GridItem key={sport}>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Plus size={14} />}
                      onClick={() => addSport(sport)}
                      w="full"
                      fontSize="xs"
                    >
                      {sport}
                    </Button>
                  </GridItem>
                ))}
              </Grid>
            </CardBody>
          </Card>
        )}

        {/* Sports Statistics */}
        <Card bg="blue.50" borderColor="blue.200">
          <CardBody>
            <Heading size="md" mb={4} color="blue.700">
              Sports Summary
            </Heading>
            <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {sportsData.length}
                </Text>
                <Text fontSize="sm" color="blue.600">
                  Total Sports
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {sportsData.reduce((total, sport) => total + sport.positions.length, 0)}
                </Text>
                <Text fontSize="sm" color="green.600">
                  Total Positions
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {sportsData.filter((s) => !s.isPrimary).length}
                </Text>
                <Text fontSize="sm" color="purple.600">
                  Additional Sports
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {hasMultipleSports ? "Pro" : "Free"}
                </Text>
                <Text fontSize="sm" color="orange.600">
                  Plan Level
                </Text>
              </Box>
            </Grid>
          </CardBody>
        </Card>

        {/* Public Profile Preview */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Public Profile Preview
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>
              This is how your sports will appear on your public profile
            </Text>
            <Box p={4} bg="gray.50" borderRadius="md">
              <VStack spacing={3} align="center">
                <Text fontWeight="bold" fontSize="lg">
                  {athlete.athlete_name}
                </Text>

                {/* Primary Sport */}
                {sportsData.find((s) => s.isPrimary) && (
                  <Badge variant="solid" fontSize="md" px={3} py={1} bg="blue.500" color="white">
                    <HStack spacing={1}>
                      <Star size={14} fill="currentColor" />
                      <Text>{sportsData.find((s) => s.isPrimary)?.sport}</Text>
                    </HStack>
                  </Badge>
                )}

                {/* Additional Sports */}
                {sportsData.filter((s) => !s.isPrimary).length > 0 && (
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                      Also plays:
                    </Text>
                    <HStack spacing={2} wrap="wrap" justify="center">
                      {sportsData
                        .filter((s) => !s.isPrimary)
                        .map((sport) => (
                          <Badge
                            key={sport.sport}
                            variant="solid"
                            fontSize="xs"
                            px={2}
                            py={1}
                            bg="green.500"
                            color="white"
                            borderRadius="full"
                          >
                            {sport.sport}
                          </Badge>
                        ))}
                    </HStack>
                  </VStack>
                )}

                {/* Positions by Sport */}
                {sportsData.some((s) => s.positions.length > 0) && (
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                      Positions:
                    </Text>
                    {sportsData
                      .filter((s) => s.positions.length > 0)
                      .map((sport) => (
                        <VStack key={sport.sport} spacing={1}>
                          <Text fontSize="xs" color="gray.500" fontWeight="medium">
                            {sport.sport}:
                          </Text>
                          <HStack spacing={1} wrap="wrap" justify="center">
                            {sport.positions.map((position) => (
                              <Badge
                                key={`${sport.sport}-${position}`}
                                colorScheme="green"
                                variant="outline"
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="full"
                              >
                                {position}
                              </Badge>
                            ))}
                          </HStack>
                        </VStack>
                      ))}
                  </VStack>
                )}
              </VStack>
            </Box>
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
            Save Sports & Positions
          </Button>
        </Flex>

        {/* Help Text */}
        <Card bg="gray.50">
          <CardBody>
            <Heading size="sm" mb={2}>
              Tips for Managing Your Sports
            </Heading>
            <VStack spacing={2} align="start" fontSize="sm" color="gray.600">
              <Text>• Your primary sport is the main sport you want to be recruited for</Text>
              <Text>• Additional sports show your athletic versatility and can attract multi-sport coaches</Text>
              <Text>• Select specific positions to help coaches understand where you play</Text>
              <Text>• Pro accounts can add unlimited additional sports</Text>
              <Text>• Sports and positions appear prominently on your public profile</Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}
