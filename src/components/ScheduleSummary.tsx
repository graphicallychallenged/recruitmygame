"use client"

import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Button,
} from "@chakra-ui/react"
import { Trophy, Dumbbell, Users, Heart, Calendar, Plus } from "lucide-react"
import Link from "next/link"

interface ScheduleSummaryProps {
  events: {
    id: string
    event_name: string
    event_type: string
    event_date: string
    event_time: string
    location: string
  }[]
  maxDisplay?: number
}

const EVENT_TYPES = [
  { value: "game", label: "Games", icon: Trophy, color: "blue" },
  { value: "training", label: "Training", icon: Dumbbell, color: "green" },
  { value: "id_camp", label: "ID Camps", icon: Users, color: "purple" },
  { value: "community_service", label: "Community", icon: Heart, color: "red" },
]

export function ScheduleSummary({ events, maxDisplay = 3 }: ScheduleSummaryProps) {
  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[0]
  }

  const upcomingEvents = events
    .filter((event) => new Date(event.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, maxDisplay)

  const eventStats = EVENT_TYPES.map((type) => ({
    ...type,
    count: events.filter((event) => event.event_type === type.value).length,
  })).filter((stat) => stat.count > 0)

  return (
    <Card>
      <CardHeader pb={2}>
        <HStack justify="space-between" align="center">
          <Heading size="sm">Upcoming Schedule</Heading>
          <Link href="/dashboard/schedule">
            <Button size="xs" variant="ghost" rightIcon={<Plus size={12} />}>
              Manage
            </Button>
          </Link>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        {events.length === 0 ? (
          <VStack spacing={3} py={4} textAlign="center">
            <Box color="gray.400">
              <Calendar size={32} />
            </Box>
            <Text fontSize="sm" color="gray.500">
              No events scheduled
            </Text>
            <Link href="/dashboard/schedule">
              <Button size="sm" colorScheme="teal" leftIcon={<Plus size={14} />}>
                Add Event
              </Button>
            </Link>
          </VStack>
        ) : (
          <VStack spacing={4} align="stretch">
            {/* Quick Stats */}
            {eventStats.length > 0 && (
              <SimpleGrid columns={eventStats.length > 2 ? 3 : eventStats.length} spacing={3}>
                {eventStats.slice(0, 3).map((stat) => (
                  <VStack key={stat.value} spacing={1} textAlign="center">
                    <Box color={`${stat.color}.500`}>
                      <stat.icon size={16} />
                    </Box>
                    <Text fontSize="lg" fontWeight="bold">
                      {stat.count}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {stat.label}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            )}

            {/* Upcoming Events */}
            <VStack spacing={3} align="stretch">
              {upcomingEvents.map((event) => {
                const typeInfo = getEventTypeInfo(event.event_type)
                const eventDate = new Date(event.event_date)
                const isToday = eventDate.toDateString() === new Date().toDateString()

                return (
                  <HStack key={event.id} spacing={3} p={2} bg="gray.50" borderRadius="md">
                    <Box color={`${typeInfo.color}.500`} flexShrink={0}>
                      <typeInfo.icon size={16} />
                    </Box>
                    <VStack align="start" spacing={0} flex={1}>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                          {event.event_name}
                        </Text>
                        {isToday && (
                          <Badge colorScheme="orange" variant="solid" fontSize="xs">
                            Today
                          </Badge>
                        )}
                      </HStack>
                      <HStack spacing={2} fontSize="xs" color="gray.600">
                        <Text>
                          {eventDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                        {event.event_time && <Text>{event.event_time}</Text>}
                        {event.location && <Text noOfLines={1}>{event.location}</Text>}
                      </HStack>
                    </VStack>
                  </HStack>
                )
              })}
            </VStack>

            {upcomingEvents.length === 0 && events.length > 0 && (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                No upcoming events
              </Text>
            )}

            {events.length > maxDisplay && (
              <Link href="/dashboard/schedule">
                <Button size="sm" variant="outline" width="full">
                  View All {events.length} Events
                </Button>
              </Link>
            )}
          </VStack>
        )}
      </CardBody>
    </Card>
  )
}
