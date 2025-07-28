"use client"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Badge,
  Divider,
  useColorModeValue,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast,
} from "@chakra-ui/react"
import {
  User,
  Camera,
  Video,
  Trophy,
  Calendar,
  Star,
  Settings,
  LogOut,
  Eye,
  CreditCard,
  HelpCircle,
  ChevronDown,
} from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { Logo } from "./Logo"

interface DashboardNavProps {
  athlete: any
  tierDisplayName: string
  tierColor: string
}

export function DashboardNav({ athlete, tierDisplayName, tierColor }: DashboardNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const toast = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const activeBg = useColorModeValue("blue.50", "blue.900")
  const activeColor = useColorModeValue("blue.600", "blue.200")

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const navItems = [
    { path: "/dashboard", icon: User, label: "Dashboard" },
    { path: "/dashboard/profile", icon: User, label: "Profile" },
    { path: "/dashboard/photos", icon: Camera, label: "Photos" },
    { path: "/dashboard/videos", icon: Video, label: "Videos" },
    { path: "/dashboard/awards", icon: Trophy, label: "Awards" },
    { path: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
    { path: "/dashboard/reviews", icon: Star, label: "Reviews" },
    { path: "/dashboard/support", icon: HelpCircle, label: "Support" },
    { path: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  const NavButton = ({ item }: { item: any }) => {
    const isActive = pathname === item.path
    return (
      <Button
        variant="ghost"
        justifyContent="flex-start"
        leftIcon={<Icon as={item.icon} size={18} />}
        onClick={() => router.push(item.path)}
        bg={isActive ? activeBg : "transparent"}
        color={isActive ? activeColor : "inherit"}
        _hover={{ bg: isActive ? activeBg : hoverBg }}
        w="full"
        h="auto"
        py={3}
        px={4}
        fontWeight={isActive ? "semibold" : "normal"}
      >
        {item.label}
      </Button>
    )
  }

  return (
    <Box w="280px" bg={bgColor} borderRight="1px" borderColor={borderColor} h="full" overflowY="auto">
      <VStack spacing={0} align="stretch" h="full">
        {/* Logo */}
        <Box p={6} borderBottom="1px" borderColor={borderColor}>
          <Logo />
        </Box>

        {/* User Profile Section */}
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Avatar
              size="md"
              src={athlete?.profile_picture_url}
              name={athlete?.athlete_name || "Athlete"}
              bg="blue.500"
            />
            <VStack align="start" spacing={1} flex={1}>
              <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                {athlete?.athlete_name || "Loading..."}
              </Text>
              <Badge colorScheme={tierColor} size="sm" variant="subtle">
                {tierDisplayName}
              </Badge>
            </VStack>
          </HStack>
        </Box>

        {/* Navigation Items */}
        <VStack spacing={1} align="stretch" flex={1} p={4}>
          {navItems.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
        </VStack>

        {/* Bottom Actions */}
        <Box p={4} borderTop="1px" borderColor={borderColor}>
          <VStack spacing={2} align="stretch">
            {/* View Public Profile */}
            <Button
              variant="outline"
              leftIcon={<Icon as={Eye} size={16} />}
              onClick={() => {
                if (athlete?.username) {
                  window.open(`/${athlete.username}`, "_blank")
                }
              }}
              size="sm"
              isDisabled={!athlete?.is_public}
            >
              View Public Profile
            </Button>

            {/* Subscription */}
            <Button
              variant="outline"
              leftIcon={<Icon as={CreditCard} size={16} />}
              onClick={() => router.push("/subscription")}
              size="sm"
            >
              Manage Subscription
            </Button>

            <Divider />

            {/* User Menu */}
            <Menu>
              <MenuButton as={Button} variant="ghost" rightIcon={<ChevronDown size={16} />} size="sm">
                Account
              </MenuButton>
              <MenuList>
                <MenuItem icon={<Settings size={16} />} onClick={() => router.push("/dashboard/settings")}>
                  Settings
                </MenuItem>
                <MenuItem icon={<HelpCircle size={16} />} onClick={() => router.push("/dashboard/support")}>
                  Support
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<LogOut size={16} />} onClick={handleSignOut} isDisabled={isLoggingOut} color="red.500">
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </MenuItem>
              </MenuList>
            </Menu>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}
