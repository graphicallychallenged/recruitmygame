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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
} from "@chakra-ui/react"
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Users, Dumbbell, Trophy, Heart } from "lucide-react"
import Link from "next/link"

interface ScheduleEvent {
  id: string
  event_name: string
  event_type: string
  event_date: string
  event_time: string | null
  location: string
  description: string
  created_at: string
  updated_at?: string
}

const EVENT_TYPES = [
  {
    value: "game",
    label: "Game/Match",
    icon: Trophy,
    color: "blue",
    description: "Competitive games and matches",
  },
  {
    value: "training",
    label: "Training/Practice",
    icon: Dumbbell,
    color: "green",
    description: "Regular practice sessions and training",
  },
  {
    value: "id_camp",
    label: "ID Camp",
    icon: Users,
    color: "purple",
    description: "Identification camps and showcases",
  },
  {
    value: "community_service",
    label: "Community Service",
    icon: Heart,
    color: "red",
    description: "Community service and volunteer work",
  },
]

export default function SchedulePage() {
  const [athlete, setAthlete] = useState<any>(null)
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [selectedView, setSelectedView] = useState<"upcoming" | "all" | "calendar">("upcoming")
  const [formData, setFormData] = useState({
    event_name: "",
    event_type: "",
    event_date: "",
    event_time: "",
    location: "",
    description: "",
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

        // Fetch schedule events
        const { data: eventsData, error } = await supabase
          .from("athlete_schedule")
          .select("*")
          .eq("athlete_id", athleteData.id)
          .order("event_date", { ascending: true })

        if (error) throw error
        setEvents(eventsData || [])
      }
    } catch (error: any) {
      toast({
        title: "Error loading schedule",
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
      // Prepare event data with proper null handling for time
      const eventData = {
        event_name: formData.event_name,
        event_type: formData.event_type,
        event_date: formData.event_date,
        event_time: formData.event_time || null, // Convert empty string to null
        location: formData.location,
        description: formData.description,
        athlete_id: athlete.id,
        updated_at: new Date().toISOString(),
      }

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase.from("athlete_schedule").update(eventData).eq("id", editingEvent.id)
        if (error) throw error
        toast({
          title: "Event updated",
          description: "Your schedule event has been updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        // Create new event
        const { error } = await supabase.from("athlete_schedule").insert({
          ...eventData,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
        toast({
          title: "Event added",
          description: "Your schedule event has been added successfully",
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
        title: "Error saving event",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (event: ScheduleEvent) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const { error } = await supabase.from("athlete_schedule").delete().eq("id", event.id)
      if (error) throw error

      toast({
        title: "Event deleted",
        description: "Your schedule event has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      await fetchData()
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleEdit = (event: ScheduleEvent) => {
    setEditingEvent(event)
    setFormData({
      event_name: event.event_name,
      event_type: event.event_type,
      event_date: event.event_date,
      event_time: event.event_time || "", // Convert null to empty string for form
      location: event.location,
      description: event.description,
    })
    onOpen()
  }

  const handleCloseModal = () => {
    setEditingEvent(null)
    setFormData({
      event_name: "",
      event_type: "",
      event_date: "",
      event_time: "",
      location: "",
      description: "",
    })
    onClose()
  }

  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[0]
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events.filter((event) => new Date(event.event_date) >= now)
  }

  const getPastEvents = () => {
    const now = new Date()
    return events.filter((event) => new Date(event.event_date) < now)
  }

  const groupEventsByMonth = (events: ScheduleEvent[]) => {
    const grouped = events.reduce(
      (acc, event) => {
        const date = new Date(event.event_date)
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`
        const monthLabel = date.toLocaleDateString("en-US", { year: "numeric", month: "long" })

        if (!acc[monthKey]) {
          acc[monthKey] = { label: monthLabel, events: [] }
        }
        acc[monthKey].events.push(event)
        return acc
      },
      {} as Record<string, { label: string; events: ScheduleEvent[] }>,
    )

    return Object.values(grouped).sort(
      (a, b) => new Date(a.events[0].event_date).getTime() - new Date(b.events[0].event_date).getTime(),
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
        <Text color="gray.600">You need to create your athlete profile before managing your schedule.</Text>
        <Link href="/dashboard/profile">
          <Button colorScheme="teal" size="lg">
            Create Profile
          </Button>
        </Link>
      </VStack>
    )
  }

  const upcomingEvents = getUpcomingEvents()
  const eventStats = EVENT_TYPES.map((type) => ({
    ...type,
    count: events.filter((event) => event.event_type === type.value).length,
  }))

  return (
    <Container maxW="6xl">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" mb={2}>
              Schedule Management
            </Heading>
            <Text color="gray.600">
              {events.length} total events • {upcomingEvents.length} upcoming
            </Text>
          </Box>
          <Button leftIcon={<Plus size={20} />} colorScheme="teal" onClick={onOpen} size={{ base: "sm", md: "md" }}>
            Add Event
          </Button>
        </Flex>

        {/* Event Type Statistics */}
        <Card>
          <CardBody>
            <Heading size="sm" mb={4}>
              Event Overview
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              {eventStats.map((stat) => (
                <VStack key={stat.value} spacing={3} textAlign="center">
                  <Box p={3} borderRadius="full" bg={`${stat.color}.100`} color={`${stat.color}.600`}>
                    <stat.icon size={24} />
                  </Box>
                  <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold">
                      {stat.count}
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      {stat.label}
                    </Text>
                  </VStack>
                </VStack>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Schedule Views */}
        <Tabs
          index={selectedView === "upcoming" ? 0 : selectedView === "all" ? 1 : 2}
          onChange={(index) => setSelectedView(index === 0 ? "upcoming" : index === 1 ? "all" : "calendar")}
        >
          <TabList>
            <Tab>Upcoming Events</Tab>
            <Tab>All Events</Tab>
            <Tab>Calendar View</Tab>
          </TabList>

          <TabPanels>
            {/* Upcoming Events */}
            <TabPanel px={0}>
              {upcomingEvents.length === 0 ? (
                <Card>
                  <CardBody py={12} textAlign="center">
                    <VStack spacing={4}>
                      <Box color="gray.400">
                        <Calendar size={48} />
                      </Box>
                      <Heading size="md" color="gray.600">
                        No upcoming events
                      </Heading>
                      <Text color="gray.500" maxW="md">
                        Add your games, training sessions, ID camps, and community service events to keep track of your
                        schedule.
                      </Text>
                      <Button leftIcon={<Plus size={16} />} colorScheme="teal" onClick={onOpen}>
                        Add Your First Event
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <VStack spacing={4} align="stretch">
                  {upcomingEvents.map((event) => {
                    const typeInfo = getEventTypeInfo(event.event_type)
                    const eventDate = new Date(event.event_date)
                    const isToday = eventDate.toDateString() === new Date().toDateString()
                    const isThisWeek = eventDate.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000

                    return (
                      <Card key={event.id} borderLeft="4px" borderLeftColor={`${typeInfo.color}.500`}>
                        <CardBody>
                          <Flex justify="space-between" align="start" gap={4}>
                            <HStack spacing={4} flex={1}>
                              <Box
                                p={3}
                                borderRadius="lg"
                                bg={`${typeInfo.color}.100`}
                                color={`${typeInfo.color}.600`}
                                flexShrink={0}
                              >
                                <typeInfo.icon size={24} />
                              </Box>
                              <VStack align="start" spacing={2} flex={1}>
                                <HStack spacing={2} wrap="wrap">
                                  <Heading size="md">{event.event_name}</Heading>
                                  <Badge colorScheme={typeInfo.color} variant="subtle">
                                    {typeInfo.label}
                                  </Badge>
                                  {isToday && (
                                    <Badge colorScheme="orange" variant="solid">
                                      Today
                                    </Badge>
                                  )}
                                  {isThisWeek && !isToday && (
                                    <Badge colorScheme="yellow" variant="outline">
                                      This Week
                                    </Badge>
                                  )}
                                </HStack>

                                <HStack spacing={4} wrap="wrap" color="gray.600" fontSize="sm">
                                  <HStack spacing={1}>
                                    <Calendar size={16} />
                                    <Text>
                                      {eventDate.toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </Text>
                                  </HStack>
                                  {event.event_time && (
                                    <HStack spacing={1}>
                                      <Clock size={16} />
                                      <Text>{event.event_time}</Text>
                                    </HStack>
                                  )}
                                  {event.location && (
                                    <HStack spacing={1}>
                                      <MapPin size={16} />
                                      <Text>{event.location}</Text>
                                    </HStack>
                                  )}
                                </HStack>

                                {event.description && (
                                  <Text fontSize="sm" color="gray.700" mt={2}>
                                    {event.description}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>

                            <HStack spacing={1} flexShrink={0}>
                              <IconButton
                                aria-label="Edit event"
                                icon={<Edit size={16} />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(event)}
                              />
                              <IconButton
                                aria-label="Delete event"
                                icon={<Trash2 size={16} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDelete(event)}
                              />
                            </HStack>
                          </Flex>
                        </CardBody>
                      </Card>
                    )
                  })}
                </VStack>
              )}
            </TabPanel>

            {/* All Events */}
            <TabPanel px={0}>
              {events.length === 0 ? (
                <Card>
                  <CardBody py={12} textAlign="center">
                    <VStack spacing={4}>
                      <Box color="gray.400">
                        <Calendar size={48} />
                      </Box>
                      <Heading size="md" color="gray.600">
                        No events scheduled
                      </Heading>
                      <Text color="gray.500" maxW="md">
                        Start building your schedule by adding games, training sessions, and other important events.
                      </Text>
                      <Button leftIcon={<Plus size={16} />} colorScheme="teal" onClick={onOpen}>
                        Add Event
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <VStack spacing={6} align="stretch">
                  {groupEventsByMonth(events).map((monthGroup) => (
                    <Card key={monthGroup.label}>
                      <CardBody>
                        <Heading size="md" mb={4} color="gray.700">
                          {monthGroup.label}
                        </Heading>
                        <VStack spacing={3} align="stretch">
                          {monthGroup.events.map((event) => {
                            const typeInfo = getEventTypeInfo(event.event_type)
                            const eventDate = new Date(event.event_date)
                            const isPast = eventDate < new Date()

                            return (
                              <Flex
                                key={event.id}
                                justify="space-between"
                                align="start"
                                p={3}
                                bg={isPast ? "gray.50" : "white"}
                                borderRadius="md"
                                border="1px"
                                borderColor="gray.200"
                                opacity={isPast ? 0.7 : 1}
                              >
                                <HStack spacing={3} flex={1}>
                                  <Box color={`${typeInfo.color}.500`} flexShrink={0}>
                                    <typeInfo.icon size={20} />
                                  </Box>
                                  <VStack align="start" spacing={1} flex={1}>
                                    <HStack spacing={2}>
                                      <Text fontWeight="semibold" fontSize="sm">
                                        {event.event_name}
                                      </Text>
                                      <Badge colorScheme={typeInfo.color} variant="subtle" fontSize="xs">
                                        {typeInfo.label}
                                      </Badge>
                                    </HStack>
                                    <HStack spacing={3} fontSize="xs" color="gray.600">
                                      <Text>{eventDate.toLocaleDateString()}</Text>
                                      {event.event_time && <Text>{event.event_time}</Text>}
                                      {event.location && <Text>{event.location}</Text>}
                                    </HStack>
                                  </VStack>
                                </HStack>
                                <HStack spacing={1}>
                                  <IconButton
                                    aria-label="Edit event"
                                    icon={<Edit size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => handleEdit(event)}
                                  />
                                  <IconButton
                                    aria-label="Delete event"
                                    icon={<Trash2 size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDelete(event)}
                                  />
                                </HStack>
                              </Flex>
                            )
                          })}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </TabPanel>

            {/* Calendar View */}
            <TabPanel px={0}>
              <Card>
                <CardBody py={12} textAlign="center">
                  <VStack spacing={4}>
                    <Box color="gray.400">
                      <Calendar size={48} />
                    </Box>
                    <Heading size="md" color="gray.600">
                      Calendar View Coming Soon
                    </Heading>
                    <Text color="gray.500" maxW="md">
                      We're working on a full calendar view to help you visualize your schedule better.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Add/Edit Event Modal */}
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{editingEvent ? "Edit Event" : "Add New Event"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Event Name</FormLabel>
                    <Input
                      value={formData.event_name}
                      onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                      placeholder="Game vs. Lincoln High, Training Session, etc."
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Event Type</FormLabel>
                    <Select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      placeholder="Select event type"
                    >
                      {EVENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                    {formData.event_type && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {getEventTypeInfo(formData.event_type).description}
                      </Text>
                    )}
                  </FormControl>

                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="full">
                    <FormControl isRequired>
                      <FormLabel>Date</FormLabel>
                      <Input
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Time (Optional)</FormLabel>
                      <Input
                        type="time"
                        value={formData.event_time}
                        onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                        placeholder="Leave empty if no specific time"
                      />
                    </FormControl>
                  </Grid>

                  <FormControl>
                    <FormLabel>Location</FormLabel>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Stadium, Gym, Training Facility, etc."
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Additional details about this event..."
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
                      loadingText={editingEvent ? "Updating..." : "Adding..."}
                      flex={1}
                    >
                      {editingEvent ? "Update Event" : "Add Event"}
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
