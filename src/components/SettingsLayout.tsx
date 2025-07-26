"use client"

import type { ReactNode } from "react"
import {
  Box,
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
  useBreakpointValue,
} from "@chakra-ui/react"
import { Lock, Bell, Shield, Crown, Menu, Settings, Activity } from "lucide-react"

interface SettingsLayoutProps {
  children: ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

const settingsTabs = [
  {
    id: "privacy",
    label: "Privacy",
    icon: Shield,
    description: "Control who can see your information",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Email and push notification preferences",
  },
  {
    id: "security",
    label: "Security",
    icon: Lock,
    description: "Password, security, and data management",
  },
  {
    id: "subscription",
    label: "Subscription",
    icon: Crown,
    description: "Plan details and billing information",
  },
  {
    id: "activity",
    label: "Activity",
    icon: Activity,
    description: "Recent account activity and logs",
  },
]

export function SettingsLayout({ children, activeTab, onTabChange }: SettingsLayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const SidebarContent = () => (
    <VStack spacing={1} align="stretch">
      {settingsTabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "solid" : "ghost"}
          colorScheme={activeTab === tab.id ? "blue" : "gray"}
          justifyContent="flex-start"
          leftIcon={<tab.icon size={18} />}
          onClick={() => {
            onTabChange(tab.id)
            if (isMobile) onClose()
          }}
          size="md"
          fontWeight={activeTab === tab.id ? "semibold" : "normal"}
        >
          <VStack align="start" spacing={0} flex={1}>
            <Text fontSize="sm">{tab.label}</Text>
            {!isMobile && (
              <Text fontSize="xs" color="gray.500" fontWeight="normal">
                {tab.description}
              </Text>
            )}
          </VStack>
        </Button>
      ))}
    </VStack>
  )

  if (isMobile) {
    return (
      <Box>
        <HStack justify="space-between" align="center" mb={6} p={4} bg="white" shadow="sm">
          <HStack spacing={3}>
            <Settings size={24} />
            <Text fontSize="lg" fontWeight="semibold">
              Settings
            </Text>
          </HStack>
          <IconButton aria-label="Open settings menu" icon={<Menu size={20} />} variant="ghost" onClick={onOpen} />
        </HStack>

        <Box px={4}>{children}</Box>

        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Settings</DrawerHeader>
            <DrawerBody>
              <SidebarContent />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    )
  }

  return (
    <HStack align="start" spacing={8} maxW="7xl" mx="auto">
      <Box w="280px" flexShrink={0}>
        <VStack spacing={4} align="stretch" position="sticky" top={4}>
          <Box>
            <HStack spacing={3} mb={4}>
              <Settings size={24} />
              <Text fontSize="xl" fontWeight="bold">
                Account Settings
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.600" mb={6}>
              Manage your account preferences, privacy, and security settings
            </Text>
          </Box>
          <SidebarContent />
        </VStack>
      </Box>

      <Box flex={1} minH="80vh">
        {children}
      </Box>
    </HStack>
  )
}
