"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Badge,
  useToast,
  Spinner,
  Center,
  Divider,
} from "@chakra-ui/react"
import { Plus, Edit, Trash2, Award, Trophy, Medal, Star, Calendar } from "lucide-react"
import Link from "next/link"

interface AwardData {
  id: string
  title: string
  description: string
  award_type: string
  award_date: string
  organization: string
  level: string
  created_at: string
  updated_at: string
}

const AWARD_TYPES = [
  { value: "academic", label: "Academic", icon: Star, color: "blue" },
  { value: "athletic", label: "Athletic", icon: Trophy, color: "yellow" },
  { value: "leadership", label: "Leadership", icon: Award, color: "purple" },
  { value: "community", label: "Community Service", icon: Medal, color: "green" },
  { value: "other", label: "Other", icon: Award, color: "gray" },
]

const AWARD_LEVELS = [
  { value: "local", label: "Local" },
  { value: "regional", label: "Regional" },
  { value: "state", label: "State" },
  { value: "national", label: "National" },
  { value: "international", label: "International" },
]

export default function AwardsPage() {
  const [athlete, setAthlete] = useState<any>(null)
  const [awards, setAwards] = useState<AwardData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingAward, setEditingAward] = useState<AwardData | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    award_type: "",
    award_date: "",
    organization: "",
    level: "",
  })
  const toast = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      // Fetch athlete profile
      const { data: athleteData } = await supabase.from("athletes").select("*").eq("user_id", session.user.id).single()

      if (athleteData) {
        setAthlete(athleteData)

        // Fetch awards
        const { data: awardsData, error } = await supabase
          .from("athlete_awards")
          .select("*")
          .eq("athlete_id", athleteData.id)
          .order("award_date", { ascending: false })

        if (error) throw error
        setAwards(awardsData || [])
      }
    } catch (error: any) {
      toast({
        title: "Error loading awards",
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
    if (!athlete) return

    setSaving(true)
    try {
      const awardData = {
        ...formData,
        athlete_id: athlete.id,
        updated_at: new Date().toISOString(),
      }

      if (editingAward) {
        // Update existing award
        const { error } = await supabase.from("athlete_awards").update(awardData).eq("id", editingAward.id)
        if (error) throw error
        toast({
          title: "Award updated",
          description: "Your award has been updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        // Create new award
        const { error } = await supabase.from("athlete_awards").insert({
          ...awardData,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
        toast({
          title: "Award added",
          description: "Your award has been added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }

      // Refresh data and close modal
      await fetchData()
      handleCloseModal()
    } catch (error: any) {
      toast({
        title: "Error saving award",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (award: AwardData) => {
    if (!confirm("Are you sure you want to delete this award?")) return

    try {
      const { error } = await supabase.from("athlete_awards").delete().eq("id", award.id)
      if (error) throw error

      toast({
        title: "Award deleted",
        description: "Your award has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      await fetchData()
    } catch (error: any) {
      toast({
        title: "Error deleting award",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleEdit = (award: AwardData) => {
    setEditingAward(award)
    setFormData({
      title: award.title,
      description: award.description,
      award_type: award.award_type,
      award_date: award.award_date,
      organization: award.organization,
      level: award.level,
    })
    onOpen()
  }

  const handleCloseModal = () => {
    setEditingAward(null)
    setFormData({
      title: "",
      description: "",
      award_type: "",
      award_date: "",
      organization: "",
      level: "",
    })
    onClose()
  }

  const getAwardTypeInfo = (type: string) => {
    return AWARD_TYPES.find((t) => t.value === type) || AWARD_TYPES[4]
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "international":
        return "red"
      case "national":
        return "purple"
      case "state":
        return "blue"
      case "regional":
        return "green"
      case "local":
        return "gray"
      default:
        return "gray"
    }
  }

  const groupAwardsByYear = (awards: AwardData[]) => {
    const grouped = awards.reduce(
      (acc, award) => {
        const year = new Date(award.award_date).getFullYear().toString()
        if (!acc[year]) {
          acc[year] = []
        }
        acc[year].push(award)
        return acc
      },
      {} as Record<string, AwardData[]>,
    )

    // Sort years in descending order
    return Object.keys(grouped)
      .sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
      .reduce(
        (acc, year) => {
          acc[year] = grouped[year]
          return acc
        },
        {} as Record<string, AwardData[]>,
      )
  }

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  if (!athlete) {
    return (
      <VStack spacing={6} textAlign="center" py={12}>
        <Heading size="lg">Create Your Profile First</Heading>
        <Text color="gray.600">You need to create your athlete profile before managing awards.</Text>
        <Link href="/dashboard/profile">
          <Button colorScheme="teal" size="lg">
            Create Profile
          </Button>
        </Link>
      </VStack>
    )
  }

  const groupedAwards = groupAwardsByYear(awards)
  const awardStats = AWARD_TYPES.map((type) => ({
    ...type,
    count: awards.filter((award) => award.award_type === type.value).length,
  }))

  return (
    <Container maxW="6xl">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" mb={2}>
              Awards & Recognition
            </Heading>
            <Text color="gray.600">{awards.length} total awards</Text>
          </Box>
          <Button leftIcon={<Plus size={20} />} colorScheme="teal" onClick={onOpen} size={{ base: "sm", md: "md" }}>
            Add Award
          </Button>
        </Flex>

        {/* Award Statistics */}
        <Card>
          <CardBody>
            <Heading size="sm" mb={4}>
              Award Summary
            </Heading>
            <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }} gap={4}>
              {awardStats.map((stat) => (
                <GridItem key={stat.value}>
                  <VStack spacing={2} textAlign="center">
                    <Box color={`${stat.color}.500`}>
                      <stat.icon size={24} />
                    </Box>
                    <Text fontSize="2xl" fontWeight="bold">
                      {stat.count}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {stat.label}
                    </Text>
                  </VStack>
                </GridItem>
              ))}
            </Grid>
          </CardBody>
        </Card>

        {/* Awards Timeline */}
        {awards.length === 0 ? (
          <Card>
            <CardBody py={12} textAlign="center">
              <VStack spacing={4}>
                <Box color="gray.400">
                  <Trophy size={48} />
                </Box>
                <Heading size="md" color="gray.600">
                  No awards yet
                </Heading>
                <Text color="gray.500" maxW="md">
                  Start building your achievement record by adding your academic honors, athletic awards, and
                  recognition.
                </Text>
                <Button leftIcon={<Plus size={16} />} colorScheme="teal" onClick={onOpen}>
                  Add Your First Award
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={6} align="stretch">
            {Object.entries(groupedAwards).map(([year, yearAwards]) => (
              <Card key={year}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Calendar size={20} color="gray.500" />
                      <Heading size="md" color="gray.700">
                        {year}
                      </Heading>
                      <Badge colorScheme="teal" variant="subtle">
                        {yearAwards.length} award{yearAwards.length !== 1 ? "s" : ""}
                      </Badge>
                    </HStack>

                    <VStack spacing={4} align="stretch">
                      {yearAwards.map((award, index) => {
                        const typeInfo = getAwardTypeInfo(award.award_type)
                        return (
                          <Box key={award.id}>
                            <Flex
                              justify="space-between"
                              align="start"
                              p={4}
                              bg="gray.50"
                              borderRadius="md"
                              _hover={{ bg: "gray.100" }}
                              transition="all 0.2s"
                            >
                              <HStack spacing={4} flex={1}>
                                <Box color={`${typeInfo.color}.500`} flexShrink={0}>
                                  <typeInfo.icon size={24} />
                                </Box>
                                <VStack align="start" spacing={1} flex={1}>
                                  <HStack spacing={2} wrap="wrap">
                                    <Heading size="sm">{award.title}</Heading>
                                    <Badge colorScheme={typeInfo.color} variant="subtle" fontSize="xs">
                                      {typeInfo.label}
                                    </Badge>
                                    <Badge
                                      colorScheme={getLevelBadgeColor(award.level)}
                                      variant="outline"
                                      fontSize="xs"
                                    >
                                      {award.level.charAt(0).toUpperCase() + award.level.slice(1)}
                                    </Badge>
                                  </HStack>
                                  {award.organization && (
                                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                      {award.organization}
                                    </Text>
                                  )}
                                  {award.description && (
                                    <Text fontSize="sm" color="gray.700">
                                      {award.description}
                                    </Text>
                                  )}
                                  <Text fontSize="xs" color="gray.500">
                                    {new Date(award.award_date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </Text>
                                </VStack>
                              </HStack>

                              <HStack spacing={1} flexShrink={0}>
                                <IconButton
                                  aria-label="Edit award"
                                  icon={<Edit size={16} />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(award)}
                                />
                                <IconButton
                                  aria-label="Delete award"
                                  icon={<Trash2 size={16} />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDelete(award)}
                                />
                              </HStack>
                            </Flex>
                            {index < yearAwards.length - 1 && <Divider mt={4} />}
                          </Box>
                        )
                      })}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}

        {/* Add/Edit Award Modal */}
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{editingAward ? "Edit Award" : "Add New Award"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Award Title</FormLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Honor Roll, MVP Award, Scholarship, etc."
                    />
                  </FormControl>

                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="full">
                    <FormControl isRequired>
                      <FormLabel>Award Type</FormLabel>
                      <Select
                        value={formData.award_type}
                        onChange={(e) => setFormData({ ...formData, award_type: e.target.value })}
                        placeholder="Select type"
                      >
                        {AWARD_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Level</FormLabel>
                      <Select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        placeholder="Select level"
                      >
                        {AWARD_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="full">
                    <FormControl isRequired>
                      <FormLabel>Date Received</FormLabel>
                      <Input
                        type="date"
                        value={formData.award_date}
                        onChange={(e) => setFormData({ ...formData, award_date: e.target.value })}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Organization</FormLabel>
                      <Input
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="School, League, Organization"
                      />
                    </FormControl>
                  </Grid>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the achievement or criteria for this award..."
                      rows={3}
                    />
                  </FormControl>

                  <HStack spacing={3} w="full" pt={4}>
                    <Button variant="ghost" onClick={handleCloseModal} flex={1}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="teal"
                      isLoading={saving}
                      loadingText={editingAward ? "Updating..." : "Adding..."}
                      flex={1}
                    >
                      {editingAward ? "Update Award" : "Add Award"}
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  )
}
