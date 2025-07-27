"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/utils/supabase/client"
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  useColorModeValue,
  Container,
  Badge,
  Spinner,
  useToast,
  Divider,
} from "@chakra-ui/react"
import {
  Home,
  User,
  Video,
  Award,
  ImageIcon,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Lock,
  CreditCard,
  Shield,
  Target,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import { type SubscriptionTier, hasFeature, getTierColor, getTierDisplayName } from "@/utils/tierFeatures"

interface AthleteProfile {
  id: string
  user_id: string
  username: string
  athlete_name: string
  sport: string
  school: string
  profile_picture_url: string
  subscription_tier: SubscriptionTier
}

interface NavItem {
  href: string
  icon: any
  label: string
  requiredTier?: SubscriptionTier
  feature?: keyof typeof import("@/utils/tierFeatures").TIER_FEATURES.free
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: Home, label: "Overview" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/videos", icon: Video, label: "Videos" },
  { href: "/dashboard/photos", icon: ImageIcon, label: "Photos" },
  { href: "/dashboard/awards", icon: Award, label: "Awards" },
  { href: "/dashboard/schedule", icon: Calendar, label: "Schedule", requiredTier: "premium", feature: "schedule" },
  { href: "/dashboard/reviews", icon: MessageSquare, label: "Reviews", requiredTier: "premium", feature: "reviews" },
  {
    href: "/dashboard/business-cards",
    icon: CreditCard,
    label: "Business Cards",
    requiredTier: "pro",
    feature: "business_cards",
  },
  {
    href: "/dashboard/verified-reviews",
    icon: Shield,
    label: "Verified Reviews",
    requiredTier: "pro",
    feature: "verified_reviews",
  },
  {
    href: "/dashboard/sports",
    icon: Target,
    label: "Multiple Sports",
    requiredTier: "pro",
    feature: "multiple_sports",
  },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/subscription", icon: CreditCard, label: "Subscription" },
  { href: "/dashboard/support", icon: HelpCircle, label: "Support" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const toast = useToast()
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  useEffect(() => {
    const fetchAthlete = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        setUserEmail(session.user.email || "")

        const { data, error } = await supabase.from("athletes").select("*").eq("user_id", session.user.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setAthlete(data)
        }
      } catch (error: any) {
        console.error("Error fetching athlete:", error)
        toast({
          title: "Error loading profile",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAthlete()

    // Listen for profile picture updates
    const handleProfilePictureUpdate = (event: any) => {
      if (event.detail && athlete && event.detail.athleteId === athlete.id) {
        setAthlete((prev) => (prev ? { ...prev, profile_picture_url: event.detail.newUrl } : null))
      }
    }

    window.addEventListener("profilePictureUpdated", handleProfilePictureUpdate)

    return () => {
      window.removeEventListener("profilePictureUpdated", handleProfilePictureUpdate)
    }
  }, [router, toast])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const isFeatureAccessible = (item: NavItem) => {
    if (!item.feature || !athlete) return true
    return hasFeature(athlete.subscription_tier, item.feature)
  }

  const getRequiredTierBadge = (item: NavItem) => {
    if (!item.requiredTier || isFeatureAccessible(item)) return null
    return getTierDisplayName(item.requiredTier).toUpperCase()
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    )
  }

  // Group navigation items
  const mainNavItems = navItems.slice(0, 5) // Overview, Profile, Videos, Photos, Awards
  const premiumNavItems = navItems.slice(5, 7) // Schedule, Reviews
  const proNavItems = navItems.slice(7, 10) // Business Cards, Verified Reviews, Multiple Sports
  const settingsNavItems = navItems.slice(10) // Settings, Subscription

  return (
    <Flex h="100vh" bg={bgColor}>
      {/* Sidebar */}
      <Box w="320px" bg={bgColor} borderRight="1px" borderColor={borderColor} p={6} overflowY="auto">
        {/* Header */}
        <VStack spacing={6} align="stretch">
          {/* Logo */}
          <Link href="/">
            <HStack spacing={3} cursor="pointer">
              <Box
                w={8}
                h={8}
                bg="blue.500"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontWeight="bold" fontSize="sm">
                  RMG
                </Text>
              </Box>
              <Text fontWeight="bold" fontSize="lg">
                Recruit My Game
              </Text>
            </HStack>
          </Link>

          {/* User Profile Section */}
          {athlete && (
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <Avatar src={athlete.profile_picture_url} name={athlete.athlete_name} size="lg" />
                <VStack align="start" spacing={1} flex={1}>
                  <HStack spacing={2}>
                    <Text fontWeight="bold" fontSize="lg">
                      {athlete.athlete_name}
                    </Text>
                    <Badge
                      colorScheme={getTierColor(athlete.subscription_tier)}
                      variant="subtle"
                      textTransform="uppercase"
                      fontSize="xs"
                    >
                      {getTierDisplayName(athlete.subscription_tier)}
                    </Badge>
                  </HStack>
                  <Text color="gray.600" fontSize="sm">
                    {athlete.sport} • {athlete.school}
                  </Text>
                  <Text color="blue.500" fontSize="xs">
                    Profile: {athlete.username}
                  </Text>
                </VStack>
              </HStack>

              {/* Quick Actions */}
              <HStack spacing={2}>
                <Link href={`https://${athlete.username}.recruitmygame.com`} target="_blank">
                  <Button size="sm" variant="outline" leftIcon={<ExternalLink size={14} />} flex={1}>
                    View Profile
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button size="sm" colorScheme="blue" flex={1}>
                    Edit Profile
                  </Button>
                </Link>
              </HStack>
            </VStack>
          )}

          {/* Navigation */}
          <VStack spacing={4} align="stretch">
            {/* Main Navigation */}
            <VStack spacing={1} align="stretch">
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>
                Main
              </Text>
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href
                const isAccessible = isFeatureAccessible(item)
                const requiredBadge = getRequiredTierBadge(item)
                const Icon = isAccessible ? item.icon : Lock

                return (
                  <Box key={item.href} position="relative">
                    <Link href={isAccessible ? item.href : "#"}>
                      <Button
                        variant={isActive ? "solid" : "ghost"}
                        colorScheme={isActive ? "blue" : "gray"}
                        justifyContent="flex-start"
                        leftIcon={<Icon size={18} />}
                        w="full"
                        h={10}
                        fontWeight={isActive ? "semibold" : "normal"}
                        opacity={isAccessible ? 1 : 0.6}
                        cursor={isAccessible ? "pointer" : "not-allowed"}
                        pointerEvents={isAccessible ? "auto" : "none"}
                        fontSize="sm"
                      >
                        <HStack justify="space-between" w="full">
                          <Text>{item.label}</Text>
                          {requiredBadge && (
                            <Badge colorScheme={getTierColor(item.requiredTier!)} variant="solid" fontSize="xs">
                              {requiredBadge}
                            </Badge>
                          )}
                        </HStack>
                      </Button>
                    </Link>
                  </Box>
                )
              })}
            </VStack>

            <Divider />

            {/* Premium Features */}
            <VStack spacing={1} align="stretch">
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>
                Premium Features
              </Text>
              {premiumNavItems.map((item) => {
                const isActive = pathname === item.href
                const isAccessible = isFeatureAccessible(item)
                const requiredBadge = getRequiredTierBadge(item)
                const Icon = isAccessible ? item.icon : Lock

                return (
                  <Box key={item.href} position="relative">
                    <Link href={isAccessible ? item.href : "#"}>
                      <Button
                        variant={isActive ? "solid" : "ghost"}
                        colorScheme={isActive ? "blue" : "gray"}
                        justifyContent="flex-start"
                        leftIcon={<Icon size={18} />}
                        w="full"
                        h={10}
                        fontWeight={isActive ? "semibold" : "normal"}
                        opacity={isAccessible ? 1 : 0.6}
                        cursor={isAccessible ? "pointer" : "not-allowed"}
                        pointerEvents={isAccessible ? "auto" : "none"}
                        fontSize="sm"
                      >
                        <HStack justify="space-between" w="full">
                          <Text>{item.label}</Text>
                          {requiredBadge && (
                            <Badge colorScheme={getTierColor(item.requiredTier!)} variant="solid" fontSize="xs">
                              {requiredBadge}
                            </Badge>
                          )}
                        </HStack>
                      </Button>
                    </Link>
                  </Box>
                )
              })}
            </VStack>

            <Divider />

            {/* Pro Features */}
            <VStack spacing={1} align="stretch">
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>
                Pro Features
              </Text>
              {proNavItems.map((item) => {
                const isActive = pathname === item.href
                const isAccessible = isFeatureAccessible(item)
                const requiredBadge = getRequiredTierBadge(item)
                const Icon = isAccessible ? item.icon : Lock

                return (
                  <Box key={item.href} position="relative">
                    <Link href={isAccessible ? item.href : "#"}>
                      <Button
                        variant={isActive ? "solid" : "ghost"}
                        colorScheme={isActive ? "blue" : "gray"}
                        justifyContent="flex-start"
                        leftIcon={<Icon size={18} />}
                        w="full"
                        h={10}
                        fontWeight={isActive ? "semibold" : "normal"}
                        opacity={isAccessible ? 1 : 0.6}
                        cursor={isAccessible ? "pointer" : "not-allowed"}
                        pointerEvents={isAccessible ? "auto" : "none"}
                        fontSize="sm"
                      >
                        <HStack justify="space-between" w="full">
                          <Text>{item.label}</Text>
                          {requiredBadge && (
                            <Badge colorScheme={getTierColor(item.requiredTier!)} variant="solid" fontSize="xs">
                              {requiredBadge}
                            </Badge>
                          )}
                        </HStack>
                      </Button>
                    </Link>
                  </Box>
                )
              })}
            </VStack>

            <Divider />

            {/* Settings */}
            <VStack spacing={1} align="stretch">
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>
                Account
              </Text>
              {settingsNavItems.map((item) => {
                const isActive = pathname === item.href
                const isAccessible = isFeatureAccessible(item)
                const Icon = item.icon

                return (
                  <Box key={item.href} position="relative">
                    <Link href={item.href}>
                      <Button
                        variant={isActive ? "solid" : "ghost"}
                        colorScheme={isActive ? "blue" : "gray"}
                        justifyContent="flex-start"
                        leftIcon={<Icon size={18} />}
                        w="full"
                        h={10}
                        fontWeight={isActive ? "semibold" : "normal"}
                        fontSize="sm"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  </Box>
                )
              })}
            </VStack>

            {/* Sign Out */}
            <Button
              variant="ghost"
              colorScheme="red"
              justifyContent="flex-start"
              leftIcon={<LogOut size={18} />}
              onClick={handleSignOut}
              w="full"
              h={10}
              fontSize="sm"
            >
              Sign Out
            </Button>
          </VStack>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} overflowY="auto">
        {/* Top Bar */}
        <Box bg={bgColor} borderBottom="1px" borderColor={borderColor} px={8} py={4}>
          <Flex justify="space-between" align="center">
            <Text fontSize="2xl" fontWeight="bold">
              Dashboard
            </Text>
            <Text color="gray.600" fontSize="sm">
              {userEmail}
            </Text>
          </Flex>
        </Box>

        {/* Page Content */}
        <Container maxW="7xl" py={8}>
          {children}
        </Container>
      </Box>
    </Flex>
  )
}
