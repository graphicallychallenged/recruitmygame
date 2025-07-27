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
  Divider,
} from "@chakra-ui/react"
import { Calendar, Clock, MapPin } from "lucide-react"
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
  const now = new Date()
  const upcomingEvents = schedule.filter((event) => new Date(event.event_date) >= now)
  const pastEvents = schedule.filter((event) => new Date(event.event_date) < now)

  const renderScheduleEvent = (event: AthleteSchedule, isPast = false) => {
    const eventDate = new Date(event.event_date)
    const isToday = eventDate.toDateString() === now.toDateString()

    return (
      <Box key={event.id} opacity={isPast ? 0.7 : 1}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="semibold" color={textColor}>
              {event.event_title}
            </Text>
            <HStack spacing={4} flexWrap="wrap">
              <HStack spacing={1}>
                <Icon as={Calendar} size={14} color={mutedTextColor} />
                <Text fontSize="sm" color={mutedTextColor}>
                  {eventDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: eventDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
                  })}
                </Text>
              </HStack>
              {event.event_time && (
                <HStack spacing={1}>
                  <Icon as={Clock} size={14} color={mutedTextColor} />
                  <Text fontSize="sm" color={mutedTextColor}>
                    {event.event_time}
                  </Text>
                </HStack>
              )}
              {event.location && (
                <HStack spacing={1}>
                  <Icon as={MapPin} size={14} color={mutedTextColor} />
                  <Text fontSize="sm" color={mutedTextColor}>
                    {event.location}
                  </Text>
                </HStack>
              )}
            </HStack>
            {event.description && (
              <Text fontSize="sm" color={mutedTextColor}>
                {event.description}
              </Text>
            )}
          </VStack>
          <VStack align="end" spacing={1}>
            <Badge colorScheme={isPast ? "gray" : "green"} fontSize="xs" variant={isPast ? "outline" : "solid"}>
              {event.event_type}
            </Badge>
            {isPast && (
              <Badge colorScheme="gray" variant="subtle" fontSize="xs">
                Past
              </Badge>
            )}
            {isToday && (
              <Badge colorScheme="orange" variant="solid" fontSize="xs">
                Today
              </Badge>
            )}
          </VStack>
        </HStack>
        <Divider mt={3} borderColor={borderColor} />
      </Box>
    )
  }

  if (schedule.length === 0) {
    return null
  }

  return (
    <Box>
      <Heading size="md" mb={4} color={textColor}>
        <HStack spacing={2}>
          <Icon as={Calendar} color={primaryColor} />
          <Text>Schedule</Text>
        </HStack>
      </Heading>
      <Tabs variant="enclosed" colorScheme="green">
        <TabList>
          <Tab color={textColor}>Upcoming ({upcomingEvents.length})</Tab>
          <Tab color={textColor}>Past ({pastEvents.length})</Tab>
          <Tab color={textColor}>All Events ({schedule.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            {upcomingEvents.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {upcomingEvents.map((event) => renderScheduleEvent(event, false))}
              </VStack>
            ) : (
              <Text color={mutedTextColor} textAlign="center" py={4}>
                No upcoming events scheduled
              </Text>
            )}
          </TabPanel>
          <TabPanel px={0}>
            {pastEvents.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {pastEvents.reverse().map((event) => renderScheduleEvent(event, true))}
              </VStack>
            ) : (
              <Text color={mutedTextColor} textAlign="center" py={4}>
                No past events
              </Text>
            )}
          </TabPanel>
          <TabPanel px={0}>
            <VStack spacing={4} align="stretch">
              {schedule.map((event) => {
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
