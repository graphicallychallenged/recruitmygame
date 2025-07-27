"use client"

import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
} from "@chakra-ui/react"
import { Calendar, Clock, MapPin, Trophy, Users, BookOpen, Heart } from "lucide-react"
import type { AthleteSchedule } from "@/types/database"

interface ScheduleSectionProps {
  schedule: AthleteSchedule[]
  primaryColor: string
  textColor: string
  mutedTextColor: string
  cardBgColor: string
  borderColor: string
}

export function ScheduleSection({
  schedule,
  primaryColor,
  textColor,
  mutedTextColor,
  cardBgColor,
  borderColor,
}: ScheduleSectionProps) {
  console.log("ScheduleSection received schedule:", schedule) // Debug log

  const now = new Date()
  const upcomingEvents = schedule.filter((event) => new Date(event.event_date) >= now)
  const pastEvents = schedule.filter((event) => new Date(event.event_date) < now)

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "game":
      case "match":
        return Trophy
      case "practice":
      case "training":
        return Users
      case "tournament":
        return Trophy
      case "meeting":
      case "camp":
      case "id_camp":
        return BookOpen
      case "community_service":
        return Heart
      default:
        return Calendar
    }
  }

  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "game":
      case "match":
        return "blue"
      case "practice":
      case "training":
        return "green"
      case "tournament":
        return "purple"
      case "meeting":
      case "camp":
      case "id_camp":
        return "orange"
      case "community_service":
        return "pink"
      default:
        return "gray"
    }
  }

  const renderScheduleEvent = (event: AthleteSchedule, isPast = false) => {
    const eventDate = new Date(event.event_date)
    const isToday = eventDate.toDateString() === now.toDateString()
    const EventIcon = getEventTypeIcon(event.event_type)

    console.log("Rendering event:", event) // Debug log

    return (
      <Box
        key={event.id}
        p={6}
        bg={cardBgColor}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        opacity={isPast ? 0.8 : 1}
        _hover={{ borderColor: primaryColor, shadow: "md" }}
        transition="all 0.2s"
      >
        <VStack align="start" spacing={4}>
          {/* Event Header */}
          <HStack justify="space-between" align="start" w="full">
            <HStack spacing={3}>
              <Icon as={EventIcon} color={primaryColor} size={24} />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="xl" color={textColor}>
                  {event.event_name || "Untitled Event"}
                </Text>
                <Badge
                  colorScheme={getEventTypeColor(event.event_type)}
                  fontSize="xs"
                  variant="solid"
                  textTransform="uppercase"
                  px={2}
                  py={1}
                >
                  {event.event_type.replace("_", " ")}
                </Badge>
              </VStack>
            </HStack>

            <VStack align="end" spacing={1}>
              {isToday && (
                <Badge colorScheme="orange" variant="solid" fontSize="xs">
                  TODAY
                </Badge>
              )}
              {isPast && (
                <Badge colorScheme="gray" variant="outline" fontSize="xs">
                  PAST
                </Badge>
              )}
            </VStack>
          </HStack>

          {/* Event Details */}
          <VStack align="start" spacing={3} w="full" pl={8}>
            <HStack spacing={6} flexWrap="wrap">
              <HStack spacing={2}>
                <Icon as={Calendar} size={16} color={mutedTextColor} />
                <Text fontSize="md" color={textColor} fontWeight="medium">
                  {eventDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: eventDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
                  })}
                </Text>
              </HStack>

              {event.event_time && (
                <HStack spacing={2}>
                  <Icon as={Clock} size={16} color={mutedTextColor} />
                  <Text fontSize="md" color={textColor} fontWeight="medium">
                    {event.event_time}
                  </Text>
                </HStack>
              )}

              {event.location && (
                <HStack spacing={2}>
                  <Icon as={MapPin} size={16} color={mutedTextColor} />
                  <Text fontSize="md" color={textColor} fontWeight="medium">
                    {event.location}
                  </Text>
                </HStack>
              )}
            </HStack>

            {event.description && (
              <Box pl={2} pt={2}>
                <Text fontSize="sm" color={mutedTextColor} lineHeight="1.6">
                  {event.description}
                </Text>
              </Box>
            )}
          </VStack>
        </VStack>
      </Box>
    )
  }

  // Debug: Show what we have
  if (schedule.length === 0) {
    return (
      <Box>
        <Heading size="md" mb={4} color={textColor}>
          <HStack spacing={2}>
            <Icon as={Calendar} color={primaryColor} />
            <Text>Schedule</Text>
          </HStack>
        </Heading>
        <Alert status="info">
          <AlertIcon />
          No scheduled events found. Events will appear here once they are added and made public.
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Heading size="md" mb={4} color={textColor}>
        <HStack spacing={2}>
          <Icon as={Calendar} color={primaryColor} />
          <Text>Schedule</Text>
        </HStack>
      </Heading>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab color={textColor} _selected={{ color: primaryColor, borderColor: primaryColor }}>
            Upcoming ({upcomingEvents.length})
          </Tab>
          <Tab color={textColor} _selected={{ color: primaryColor, borderColor: primaryColor }}>
            Past ({pastEvents.length})
          </Tab>
          <Tab color={textColor} _selected={{ color: primaryColor, borderColor: primaryColor }}>
            All Events ({schedule.length})
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0} py={4}>
            {upcomingEvents.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {upcomingEvents
                  .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                  .map((event) => renderScheduleEvent(event, false))}
              </VStack>
            ) : (
              <Box textAlign="center" py={8}>
                <Icon as={Calendar} size={48} color={mutedTextColor} />
                <Text color={mutedTextColor} mt={4} fontSize="lg">
                  No upcoming events scheduled
                </Text>
                <Text color={mutedTextColor} fontSize="sm">
                  Check back later for new events
                </Text>
              </Box>
            )}
          </TabPanel>

          <TabPanel px={0} py={4}>
            {pastEvents.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {pastEvents
                  .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
                  .map((event) => renderScheduleEvent(event, true))}
              </VStack>
            ) : (
              <Box textAlign="center" py={8}>
                <Icon as={Calendar} size={48} color={mutedTextColor} />
                <Text color={mutedTextColor} mt={4} fontSize="lg">
                  No past events
                </Text>
                <Text color={mutedTextColor} fontSize="sm">
                  Past events will appear here
                </Text>
              </Box>
            )}
          </TabPanel>

          <TabPanel px={0} py={4}>
            <VStack spacing={4} align="stretch">
              {schedule
                .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
                .map((event) => {
                  const isPast = new Date(event.event_date) < now
                  return renderScheduleEvent(event, isPast)
                })}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
