"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  Text,
  Badge,
  IconButton,
  useDisclosure,
  useToast,
  Spinner,
  Flex,
  Grid,
  GridItem,
  Divider,
  Icon,
} from "@chakra-ui/react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Switch,
} from "@chakra-ui/react"
import { Plus, Edit, Trash2, Users, Calendar, MapPin } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import type { AthleteTeam } from "@/types/database"

interface TeamFormData {
  team_name: string
  position: string
  jersey_number: string
  season: string
  league: string
  stats: Record<string, string | number>
  is_current: boolean
  is_public: boolean
}

const COMMON_STATS = [
  "games_played",
  "goals",
  "assists",
  "points",
  "minutes_played",
  "shots",
  "saves",
  "tackles",
  "yards",
  "touchdowns",
  "rebounds",
  "steals",
  "blocks",
]

export default function TeamsPage() {
  const [teams, setTeams] = useState<AthleteTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingTeam, setEditingTeam] = useState<AthleteTeam | null>(null)
  const [athleteId, setAthleteId] = useState<string>("")
  const [formData, setFormData] = useState<TeamFormData>({
    team_name: "",
    position: "",
    jersey_number: "",
    season: "",
    league: "",
    stats: {},
    is_current: false,
    is_public: true,
  })
  const [customStatKey, setCustomStatKey] = useState("")
  const [customStatValue, setCustomStatValue] = useState("")
  const [athleteData, setAthleteData] = useState<any>(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      // Get current user's athlete profile
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: athleteData } = await supabase.from("athletes").select("*").eq("user_id", user.id).single()

      if (athleteData) {
        setAthleteData(athleteData)
      }

      if (!athleteData) return

      setAthleteId(athleteData.id)

      // Fetch teams
      const { data: teamsData, error } = await supabase
        .from("athlete_teams")
        .select("*")
        .eq("athlete_id", athleteData.id)
        .order("is_current", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) throw error

      setTeams(teamsData || [])
    } catch (error: any) {
      console.error("Error fetching teams:", error)
      toast({
        title: "Error loading teams",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const teamData = {
        athlete_id: athleteId,
        team_name: formData.team_name,
        position: formData.position || null,
        jersey_number: formData.jersey_number || null,
        season: formData.season || null,
        league: formData.league || null,
        stats: formData.stats,
        is_current: formData.is_current,
        is_public: formData.is_public,
      }

      if (editingTeam) {
        const { error } = await supabase.from("athlete_teams").update(teamData).eq("id", editingTeam.id)

        if (error) throw error

        toast({
          title: "Team updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        const { error } = await supabase.from("athlete_teams").insert(teamData)

        if (error) throw error

        toast({
          title: "Team added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }

      resetForm()
      onClose()
      fetchTeams()
    } catch (error: any) {
      console.error("Error saving team:", error)
      toast({
        title: "Error saving team",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (team: AthleteTeam) => {
    setEditingTeam(team)
    setFormData({
      team_name: team.team_name,
      position: team.position || "",
      jersey_number: team.jersey_number || "",
      season: team.season || "",
      league: team.league || "",
      stats: team.stats || {},
      is_current: team.is_current,
      is_public: team.is_public,
    })
    onOpen()
  }

  const handleDelete = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return

    try {
      const { error } = await supabase.from("athlete_teams").delete().eq("id", teamId)

      if (error) throw error

      toast({
        title: "Team deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      fetchTeams()
    } catch (error: any) {
      console.error("Error deleting team:", error)
      toast({
        title: "Error deleting team",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const resetForm = () => {
    setFormData({
      team_name: "",
      position: "",
      jersey_number: "",
      season: "",
      league: "",
      stats: {},
      is_current: false,
      is_public: true,
    })
    setEditingTeam(null)
    setCustomStatKey("")
    setCustomStatValue("")
  }

  const addCommonStat = (statKey: string) => {
    setFormData((prev) => ({
      ...prev,
      stats: { ...prev.stats, [statKey]: "" },
    }))
  }

  const addCustomStat = () => {
    if (customStatKey && customStatValue) {
      setFormData((prev) => ({
        ...prev,
        stats: { ...prev.stats, [customStatKey]: customStatValue },
      }))
      setCustomStatKey("")
      setCustomStatValue("")
    }
  }

  const removeStat = (statKey: string) => {
    setFormData((prev) => {
      const newStats = { ...prev.stats }
      delete newStats[statKey]
      return { ...prev, stats: newStats }
    })
  }

  const updateStat = (statKey: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      stats: { ...prev.stats, [statKey]: value },
    }))
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" />
      </Flex>
    )
  }

  const currentTeams = teams.filter((team) => team.is_current)
  const pastTeams = teams.filter((team) => !team.is_current)

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Heading size="lg">My Teams</Heading>
            {athleteData && (
              <Badge
                colorScheme={
                  athleteData.subscription_tier === "pro"
                    ? "purple"
                    : athleteData.subscription_tier === "premium"
                      ? "blue"
                      : "gray"
                }
                variant="subtle"
                textTransform="uppercase"
                fontSize="xs"
              >
                {athleteData.subscription_tier === "pro"
                  ? "Pro"
                  : athleteData.subscription_tier === "premium"
                    ? "Premium"
                    : "Free"}
              </Badge>
            )}
          </HStack>
          <Button
            leftIcon={<Plus />}
            colorScheme="teal"
            onClick={() => {
              resetForm()
              onOpen()
            }}
          >
            Add Team
          </Button>
        </HStack>

        {currentTeams.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>
              Current Teams
            </Heading>
            <VStack spacing={4} align="stretch">
              {currentTeams.map((team) => (
                <Card key={team.id}>
                  <CardBody>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack>
                          <Heading size="sm">{team.team_name}</Heading>
                          <Badge colorScheme="green">Current</Badge>
                          {!team.is_public && <Badge colorScheme="gray">Private</Badge>}
                        </HStack>

                        <HStack spacing={4} wrap="wrap">
                          {team.position && (
                            <HStack spacing={1}>
                              <Icon as={Users} size="sm" color="gray.500" />
                              <Text fontSize="sm" color="gray.600">
                                {team.position}
                              </Text>
                            </HStack>
                          )}
                          {team.jersey_number && (
                            <Text fontSize="sm" color="gray.600">
                              #{team.jersey_number}
                            </Text>
                          )}
                          {team.season && (
                            <HStack spacing={1}>
                              <Icon as={Calendar} size="sm" color="gray.500" />
                              <Text fontSize="sm" color="gray.600">
                                {team.season}
                              </Text>
                            </HStack>
                          )}
                          {team.league && (
                            <HStack spacing={1}>
                              <Icon as={MapPin} size="sm" color="gray.500" />
                              <Text fontSize="sm" color="gray.600">
                                {team.league}
                              </Text>
                            </HStack>
                          )}
                        </HStack>

                        {team.stats && Object.keys(team.stats).length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>
                              Statistics
                            </Text>
                            <Grid templateColumns="repeat(auto-fit, minmax(100px, 1fr))" gap={2}>
                              {Object.entries(team.stats).map(([key, value]) => (
                                <GridItem key={key}>
                                  <Box textAlign="center" p={2} bg="gray.50" borderRadius="sm">
                                    <Text fontSize="md" fontWeight="bold" color="teal.600">
                                      {String(value)}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                                      {key.replace(/_/g, " ")}
                                    </Text>
                                  </Box>
                                </GridItem>
                              ))}
                            </Grid>
                          </Box>
                        )}
                      </VStack>

                      <HStack>
                        <IconButton aria-label="Edit team" icon={<Edit />} size="sm" onClick={() => handleEdit(team)} />
                        <IconButton
                          aria-label="Delete team"
                          icon={<Trash2 />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDelete(team.id)}
                        />
                      </HStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </Box>
        )}

        {pastTeams.length > 0 && (
          <Box>
            {currentTeams.length > 0 && <Divider />}
            <Heading size="md" mb={4}>
              Past Teams
            </Heading>
            <VStack spacing={4} align="stretch">
              {pastTeams.map((team) => (
                <Card key={team.id}>
                  <CardBody>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack>
                          <Heading size="sm">{team.team_name}</Heading>
                          {!team.is_public && <Badge colorScheme="gray">Private</Badge>}
                        </HStack>

                        <HStack spacing={4} wrap="wrap">
                          {team.position && (
                            <HStack spacing={1}>
                              <Icon as={Users} size="sm" color="gray.500" />
                              <Text fontSize="sm" color="gray.600">
                                {team.position}
                              </Text>
                            </HStack>
                          )}
                          {team.jersey_number && (
                            <Text fontSize="sm" color="gray.600">
                              #{team.jersey_number}
                            </Text>
                          )}
                          {team.season && (
                            <HStack spacing={1}>
                              <Icon as={Calendar} size="sm" color="gray.500" />
                              <Text fontSize="sm" color="gray.600">
                                {team.season}
                              </Text>
                            </HStack>
                          )}
                          {team.league && (
                            <HStack spacing={1}>
                              <Icon as={MapPin} size="sm" color="gray.500" />
                              <Text fontSize="sm" color="gray.600">
                                {team.league}
                              </Text>
                            </HStack>
                          )}
                        </HStack>

                        {team.stats && Object.keys(team.stats).length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>
                              Statistics
                            </Text>
                            <Grid templateColumns="repeat(auto-fit, minmax(100px, 1fr))" gap={2}>
                              {Object.entries(team.stats).map(([key, value]) => (
                                <GridItem key={key}>
                                  <Box textAlign="center" p={2} bg="gray.50" borderRadius="sm">
                                    <Text fontSize="md" fontWeight="bold" color="teal.600">
                                      {String(value)}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                                      {key.replace(/_/g, " ")}
                                    </Text>
                                  </Box>
                                </GridItem>
                              ))}
                            </Grid>
                          </Box>
                        )}
                      </VStack>

                      <HStack>
                        <IconButton aria-label="Edit team" icon={<Edit />} size="sm" onClick={() => handleEdit(team)} />
                        <IconButton
                          aria-label="Delete team"
                          icon={<Trash2 />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDelete(team.id)}
                        />
                      </HStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </Box>
        )}

        {teams.length === 0 && (
          <Card>
            <CardBody textAlign="center" py={12}>
              <Icon as={Users} size="3xl" color="gray.400" mb={4} />
              <Heading size="md" color="gray.500" mb={2}>
                No teams added yet
              </Heading>
              <Text color="gray.500" mb={4}>
                Add your current and past teams to showcase your athletic experience.
              </Text>
              <Button
                leftIcon={<Plus />}
                colorScheme="teal"
                onClick={() => {
                  resetForm()
                  onOpen()
                }}
              >
                Add Your First Team
              </Button>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Add/Edit Team Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>{editingTeam ? "Edit Team" : "Add Team"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Team Name</FormLabel>
                  <Input
                    value={formData.team_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, team_name: e.target.value }))}
                    placeholder="e.g., Lakers, Manchester United, etc."
                  />
                </FormControl>

                <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                  <FormControl>
                    <FormLabel>Position</FormLabel>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                      placeholder="e.g., Point Guard, Striker, etc."
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Jersey Number</FormLabel>
                    <Input
                      value={formData.jersey_number}
                      onChange={(e) => setFormData((prev) => ({ ...prev, jersey_number: e.target.value }))}
                      placeholder="e.g., 23, 10, etc."
                    />
                  </FormControl>
                </Grid>

                <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                  <FormControl>
                    <FormLabel>Season</FormLabel>
                    <Input
                      value={formData.season}
                      onChange={(e) => setFormData((prev) => ({ ...prev, season: e.target.value }))}
                      placeholder="e.g., 2023-24, Spring 2024, etc."
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>League</FormLabel>
                    <Input
                      value={formData.league}
                      onChange={(e) => setFormData((prev) => ({ ...prev, league: e.target.value }))}
                      placeholder="e.g., NBA, Premier League, etc."
                    />
                  </FormControl>
                </Grid>

                <Box w="full">
                  <FormLabel>Statistics</FormLabel>

                  {/* Common Stats Quick Add */}
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Quick add common stats:
                  </Text>
                  <HStack spacing={2} wrap="wrap" mb={4}>
                    {COMMON_STATS.map((stat) => (
                      <Button
                        key={stat}
                        size="xs"
                        variant="outline"
                        onClick={() => addCommonStat(stat)}
                        isDisabled={stat in formData.stats}
                      >
                        {stat.replace(/_/g, " ")}
                      </Button>
                    ))}
                  </HStack>

                  {/* Custom Stat Add */}
                  <HStack spacing={2} mb={4}>
                    <Input
                      placeholder="Custom stat name"
                      value={customStatKey}
                      onChange={(e) => setCustomStatKey(e.target.value)}
                      size="sm"
                    />
                    <Input
                      placeholder="Value"
                      value={customStatValue}
                      onChange={(e) => setCustomStatValue(e.target.value)}
                      size="sm"
                    />
                    <Button size="sm" onClick={addCustomStat}>
                      Add
                    </Button>
                  </HStack>

                  {/* Current Stats */}
                  {Object.keys(formData.stats).length > 0 && (
                    <VStack spacing={2} align="stretch">
                      {Object.entries(formData.stats).map(([key, value]) => (
                        <HStack key={key}>
                          <Text fontSize="sm" minW="120px" textTransform="capitalize">
                            {key.replace(/_/g, " ")}:
                          </Text>
                          <Input size="sm" value={String(value)} onChange={(e) => updateStat(key, e.target.value)} />
                          <IconButton
                            aria-label="Remove stat"
                            icon={<Trash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeStat(key)}
                          />
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>

                <HStack spacing={6} w="full">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="is-current" mb="0">
                      Current Team
                    </FormLabel>
                    <Switch
                      id="is-current"
                      isChecked={formData.is_current}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_current: e.target.checked }))}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="is-public" mb="0">
                      Public
                    </FormLabel>
                    <Switch
                      id="is-public"
                      isChecked={formData.is_public}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_public: e.target.checked }))}
                    />
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="teal"
                isLoading={submitting}
                loadingText={editingTeam ? "Updating..." : "Adding..."}
              >
                {editingTeam ? "Update Team" : "Add Team"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  )
}
