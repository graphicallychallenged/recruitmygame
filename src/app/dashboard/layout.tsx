"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Spinner,
  Center,
  Avatar,
} from "@chakra-ui/react"
import { User, Settings, Video, Award, Calendar, MessageSquare, ImageIcon, LogOut, Home, Menu } from "lucide-react"
import { Logo } from "@/components/Logo"

const menuItems = [
  { title: "Overview", icon: Home, href: "/dashboard" },
  { title: "Profile", icon: User, href: "/dashboard/profile" },
  { title: "Videos", icon: Video, href: "/dashboard/videos" },
  { title: "Awards", icon: Award, href: "/dashboard/awards" },
  { title: "Photos", icon: ImageIcon, href: "/dashboard/photos" },
  { title: "Schedule", icon: Calendar, href: "/dashboard/schedule" },
  { title: "Reviews", icon: MessageSquare, href: "/dashboard/reviews" },
  { title: "Settings", icon: Settings, href: "/dashboard/settings" },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose?.()
  }

  return (
    <VStack spacing={0} align="stretch" h="full">
      <Box p={4} borderBottom="1px" borderColor="gray.200" textAlign="center">
        <Logo height="40px" maxWidth="200px" />
      </Box>

      <VStack spacing={1} p={2} flex={1}>
        {menuItems.map((item) => (
          <Button
            key={item.title}
            variant="ghost"
            justifyContent="flex-start"
            width="full"
            leftIcon={<item.icon size={16} />}
            onClick={() => handleNavigation(item.href)}
          >
            {item.title}
          </Button>
        ))}
      </VStack>

      <Box p={2}>
        <Button
          variant="ghost"
          justifyContent="flex-start"
          width="full"
          leftIcon={<LogOut size={16} />}
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </Box>
    </VStack>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [athlete, setAthlete] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)

      if (session?.user) {
        // Fetch athlete data to get profile picture
        const { data: athleteData } = await supabase
          .from("athletes")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        setAthlete(athleteData)
      }

      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)

      if (session?.user) {
        // Fetch athlete data when auth state changes
        const { data: athleteData } = await supabase
          .from("athletes")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        setAthlete(athleteData)
      } else {
        setAthlete(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Listen for profile picture updates
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      if (athlete && event.detail.athleteId === athlete.id) {
        setAthlete({ ...athlete, profile_picture_url: event.detail.newUrl })
      }
    }

    window.addEventListener("profilePictureUpdated", handleProfileUpdate as EventListener)

    return () => {
      window.removeEventListener("profilePictureUpdated", handleProfileUpdate as EventListener)
    }
  }, [athlete])

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  return (
    <Flex h="100vh">
      {/* Desktop Sidebar */}
      <Box w="250px" bg="white" borderRight="1px" borderColor="gray.200" display={{ base: "none", md: "block" }}>
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Flex direction="column" flex={1}>
        {/* Header */}
        <Flex
          as="header"
          align="center"
          justify="space-between"
          px={6}
          py={4}
          borderBottom="1px"
          borderColor="gray.200"
          bg="white"
        >
          <HStack>
            <IconButton
              aria-label="Open menu"
              icon={<Menu />}
              variant="ghost"
              display={{ base: "flex", md: "none" }}
              onClick={onOpen}
            />
            <Text fontSize="xl" fontWeight="semibold">
              Dashboard
            </Text>
          </HStack>
          <HStack spacing={3}>
            <Avatar src={athlete?.profile_picture_url} name={athlete?.athlete_name || user?.email} size="sm" />
            <Text fontSize="sm" color="gray.600">
              {user?.email}
            </Text>
          </HStack>
        </Flex>

        {/* Page Content */}
        <Box flex={1} p={6} bg="gray.50" overflow="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
