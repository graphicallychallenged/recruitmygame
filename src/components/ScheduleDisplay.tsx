"use client"

import { Box, VStack, HStack, Text, Heading, Badge, Card, CardBody } from "@chakra-ui/react"
import { Trophy, Dumbbell, Users, Heart, Calendar, Clock, MapPin } from "lucide-react"

interface ScheduleEvent {
  id: string
  event_name: string
  event_type: string
  event_date: string
  event_time: string
  location: string
  description: string
}

interface ScheduleDisplayProps {
  events: ScheduleEvent[]
  primaryColor?: string
  showPastEvents?: boolean
  compact?: boolean
  maxEvents?: number
}

const EVENT_TYPES = [
  { value: "game", label: "Game/Match", icon: Trophy, color: "teal" },
  { value: "training", label: "Training/Practice", icon: Dumbbell, color: "green" },
  { value: "id_camp", label: "ID Camp", icon: Users, color: "purple" },
  { value: "community_service", label: "Community Service", icon: Heart, color: "red" },
]

export function ScheduleDisplay({
  events,
  primaryColor = "#1a202c",
  showPastEvents = false,
  compact = false,
  maxEvents = 5,
}: ScheduleDisplayProps) {
  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[0]
  }

  const filterEvents = () => {
    const now = new Date()
    const filteredEvents = showPastEvents ? events : events.filter((event) => new Date(event.event_date) >= now)

    return filteredEvents
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, maxEvents)
  }

  const displayEvents = filterEvents()

  if (!events || events.length === 0) {
    return (
      <Box textAlign="center" py={8} color="gray.500">
        <Calendar size={32} style={{ margin: "0 auto 16px" }} />
        <Text>No events scheduled</Text>
      </Box>
    )
  }

  if (compact) {
    return (
      <VStack spacing={3} align="stretch">
        {displayEvents.map((event) => {
          const typeInfo = getEventTypeInfo(event.event_type)
          const eventDate = new Date(event.event_date)
          const isToday = eventDate.toDateString() === new Date().toDateString()

          return (
            <HStack key={event.id} spacing={3} p={3} bg="gray.50" borderRadius="md">
              <Box color={`${typeInfo.color}.500`} flexShrink={0}>
                <typeInfo.icon size={20} />
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <HStack spacing={2} wrap="wrap">
                  <Text fontWeight="semibold" fontSize="sm">
                    {event.event_name}
                  </Text>
                  {isToday && (
                    <Badge colorScheme="orange" variant="solid" fontSize="xs">
                      Today
                    </Badge>
                  )}
                </HStack>
                <HStack spacing={3} fontSize="xs" color="gray.600">
                  <Text>
                    {eventDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  {event.event_time && <Text>{event.event_time}</Text>}
                  {event.location && <Text>{event.location}</Text>}
                </HStack>
              </VStack>
            </HStack>
          )
        })}
        {events.length > maxEvents && (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            +{events.length - maxEvents} more events
          </Text>
        )}
      </VStack>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      {displayEvents.map((event) => {
        const typeInfo = getEventTypeInfo(event.event_type)
        const eventDate = new Date(event.event_date)
        const isToday = eventDate.toDateString() === new Date().toDateString()
        const isThisWeek = eventDate.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000

        return (
          <Card key={event.id} borderLeft="4px" borderLeftColor={`${typeInfo.color}.500`}>
            <CardBody>
              <HStack spacing={4} align="start">
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
                    <Heading size="sm">{event.event_name}</Heading>
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
                    <Text fontSize="sm" color="gray.700">
                      {event.description}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        )
      })}
    </VStack>
  )
}
