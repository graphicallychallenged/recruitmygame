"use client"

import { useState, useEffect } from "react"
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Spinner,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  IconButton,
} from "@chakra-ui/react"
import { Lock, Bell, Download, Trash2, Eye, EyeOff, Shield, Crown, Settings, Database } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { useUserSettings } from "@/hooks/useUserSettings"
import { ConsentManager } from "@/components/compliance/ConsentManager"
import { DataExportManager } from "@/components/compliance/DataExportManager"
import { AccountDeletionManager } from "@/components/compliance/AccountDeletionManager"

interface UserProfile {
  id: string
  email: string
  username: string
  subscription_tier: string
  created_at: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("privacy")
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure()
  const toast = useToast()

  const {
    notifications,
    privacy,
    activities,
    loading: settingsLoading,
    saving: settingsSaving,
    updateNotifications,
    updatePrivacy,
    logActivity,
  } = useUserSettings()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from("athlete_profiles").select("*").eq("id", user.id).single()

      if (profileData) {
        setProfile({
          id: profileData.id,
          email: user.email || "",
          username: profileData.username || "",
          subscription_tier: profileData.subscription_tier || "free",
          created_at: profileData.created_at || "",
        })
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        status: "error",
        duration: 3000,
      })
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        status: "error",
        duration: 3000,
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setNewPassword("")
      setConfirmPassword("")

      await logActivity("password_changed")

      toast({
        title: "Success",
        description: "Password updated successfully",
        status: "success",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "Failed to update password",
        status: "error",
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDataExport = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all user data for export
      const [
        { data: profileData },
        { data: videosData },
        { data: photosData },
        { data: awardsData },
        { data: scheduleData },
        { data: reviewsData },
      ] = await Promise.all([
        supabase.from("athlete_profiles").select("*").eq("id", user.id).single(),
        supabase.from("athlete_videos").select("*").eq("user_id", user.id),
        supabase.from("athlete_photos").select("*").eq("user_id", user.id),
        supabase.from("athlete_awards").select("*").eq("user_id", user.id),
        supabase.from("athlete_schedule").select("*").eq("user_id", user.id),
        supabase.from("athlete_reviews").select("*").eq("athlete_id", user.id),
      ])

      const exportData = {
        profile: profileData,
        videos: videosData || [],
        photos: photosData || [],
        awards: awardsData || [],
        schedule: scheduleData || [],
        reviews: reviewsData || [],
        settings: {
          notifications,
          privacy,
        },
        exported_at: new Date().toISOString(),
        export_version: "1.0",
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `recruitmygame-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      await logActivity("data_exported")

      toast({
        title: "Success",
        description: "Data exported successfully",
        status: "success",
        duration: 3000,
      })
      onExportClose()
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Error",
        description: "Failed to export data",
        status: "error",
        duration: 3000,
      })
    }
  }

  const handleAccountDeletion = async () => {
    try {
      await logActivity("account_deletion_requested")

      toast({
        title: "Account Deletion Request",
        description:
          "Please contact support at support@recruitmygame.com to delete your account. This ensures proper data cleanup and verification.",
        status: "info",
        duration: 8000,
      })
      onDeleteClose()
    } catch (error) {
      console.error("Error logging deletion request:", error)
      toast({
        title: "Account Deletion",
        description: "Please contact support to delete your account",
        status: "info",
        duration: 5000,
      })
      onDeleteClose()
    }
  }

  if (loading || settingsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" color="blue.500" />
      </Box>
    )
  }

  const tabs = [
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "data", label: "Privacy & Data", icon: Database },
    { id: "subscription", label: "Subscription", icon: Crown },
  ]

  return (
    <Box maxW="6xl" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack spacing={3} mb={2}>
            <Settings size={28} />
            <Heading size="lg">Account Settings</Heading>
          </HStack>
          <Text color="gray.600">Manage your account preferences, privacy, and security settings</Text>
        </Box>

        {/* Tab Navigation */}
        <HStack spacing={1} overflowX="auto" pb={2}>
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "solid" : "ghost"}
              colorScheme={activeTab === tab.id ? "blue" : "gray"}
              leftIcon={<tab.icon size={16} />}
              onClick={() => setActiveTab(tab.id)}
              minW="fit-content"
            >
              {tab.label}
            </Button>
          ))}
        </HStack>

        {/* Privacy Settings */}
        {activeTab === "privacy" && (
          <Card>
            <CardHeader>
              <Heading size="md">Privacy Settings</Heading>
              <Text fontSize="sm" color="gray.600">
                Control who can see your profile and information
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel>Profile Visibility</FormLabel>
                  <Select
                    value={privacy?.profile_visibility || "public"}
                    onChange={(e) =>
                      updatePrivacy({
                        profile_visibility: e.target.value as "public" | "private" | "coaches_only",
                      })
                    }
                  >
                    <option value="public">Public - Anyone can view your profile</option>
                    <option value="coaches_only">Coaches Only - Only verified coaches can view</option>
                    <option value="private">Private - Only you can view your profile</option>
                  </Select>
                  <FormHelperText>
                    This controls who can see your athlete profile and recruitment information
                  </FormHelperText>
                </FormControl>

                <Divider />

                <VStack spacing={4} align="stretch">
                  <Text fontWeight="semibold">Information Visibility</Text>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Show Contact Information</Text>
                      <Text fontSize="sm" color="gray.600">
                        Display phone and email on your public profile
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={privacy?.show_contact_info || false}
                      onChange={(e) => updatePrivacy({ show_contact_info: e.target.checked })}
                      isDisabled={settingsSaving}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Show Location</Text>
                      <Text fontSize="sm" color="gray.600">
                        Display city and state on your public profile
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={privacy?.show_location || false}
                      onChange={(e) => updatePrivacy({ show_location: e.target.checked })}
                      isDisabled={settingsSaving}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Show Birth Date</Text>
                      <Text fontSize="sm" color="gray.600">
                        Allow age calculation for eligibility verification
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={privacy?.show_birth_date || false}
                      onChange={(e) => updatePrivacy({ show_birth_date: e.target.checked })}
                      isDisabled={settingsSaving}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Allow Coach Reviews</Text>
                      <Text fontSize="sm" color="gray.600">
                        Let verified coaches leave reviews on your profile
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={privacy?.allow_reviews || false}
                      onChange={(e) => updatePrivacy({ allow_reviews: e.target.checked })}
                      isDisabled={settingsSaving}
                    />
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <Heading size="md">Notification Preferences</Heading>
              <Text fontSize="sm" color="gray.600">
                Choose how you want to be notified about important updates
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text>Email Notifications</Text>
                    <Text fontSize="sm" color="gray.600">
                      Receive important updates via email
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={notifications?.email_notifications || false}
                    onChange={(e) => updateNotifications({ email_notifications: e.target.checked })}
                    isDisabled={settingsSaving}
                  />
                </HStack>

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text>Push Notifications</Text>
                    <Text fontSize="sm" color="gray.600">
                      Browser and mobile push notifications
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={notifications?.push_notifications || false}
                    onChange={(e) => updateNotifications({ push_notifications: e.target.checked })}
                    isDisabled={settingsSaving}
                  />
                </HStack>

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text>Marketing Emails</Text>
                    <Text fontSize="sm" color="gray.600">
                      Tips, features, and promotional content
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={notifications?.marketing_emails || false}
                    onChange={(e) => updateNotifications({ marketing_emails: e.target.checked })}
                    isDisabled={settingsSaving}
                  />
                </HStack>

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text>Review Notifications</Text>
                    <Text fontSize="sm" color="gray.600">
                      When coaches leave reviews on your profile
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={notifications?.review_notifications || false}
                    onChange={(e) => updateNotifications({ review_notifications: e.target.checked })}
                    isDisabled={settingsSaving}
                  />
                </HStack>

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text>Schedule Reminders</Text>
                    <Text fontSize="sm" color="gray.600">
                      Upcoming events and important deadlines
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={notifications?.schedule_reminders || false}
                    onChange={(e) => updateNotifications({ schedule_reminders: e.target.checked })}
                    isDisabled={settingsSaving}
                  />
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Card>
              <CardHeader>
                <Heading size="md">Change Password</Heading>
                <Text fontSize="sm" color="gray.600">
                  Update your account password for better security
                </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>New Password</FormLabel>
                    <HStack>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <IconButton
                        aria-label="Toggle password visibility"
                        icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                      />
                    </HStack>
                    <FormHelperText>Password must be at least 6 characters long</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    onClick={handlePasswordChange}
                    isLoading={saving}
                    isDisabled={!newPassword || !confirmPassword}
                    alignSelf="flex-start"
                  >
                    Update Password
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Data & Account Management</Heading>
                <Text fontSize="sm" color="gray.600">
                  Export your data or delete your account
                </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Button leftIcon={<Download size={16} />} variant="outline" onClick={onExportOpen}>
                    Export My Data
                  </Button>

                  <Button leftIcon={<Trash2 size={16} />} colorScheme="red" variant="outline" onClick={onDeleteOpen}>
                    Delete Account
                  </Button>

                  <Alert status="info" size="sm">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Data Protection</AlertTitle>
                      <AlertDescription fontSize="xs">
                        Your data is encrypted and protected. We never share your information without explicit consent.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Subscription Settings */}
        {activeTab === "subscription" && (
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Subscription Plan</Heading>
                <Badge
                  colorScheme={profile?.subscription_tier === "premium" ? "gold" : "blue"}
                  variant="solid"
                  px={3}
                  py={1}
                  fontSize="sm"
                >
                  {profile?.subscription_tier?.toUpperCase() || "FREE"}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Current Plan: {profile?.subscription_tier?.toUpperCase() || "FREE"}</AlertTitle>
                    <AlertDescription>
                      {profile?.subscription_tier === "premium"
                        ? "You have access to all premium features including unlimited uploads, advanced analytics, and priority support."
                        : "You're on the free plan. Upgrade to Premium for unlimited uploads, advanced analytics, and priority support."}
                    </AlertDescription>
                  </Box>
                </Alert>

                {profile?.subscription_tier !== "premium" && (
                  <Box p={6} border="1px" borderColor="blue.200" borderRadius="lg" bg="blue.50">
                    <VStack spacing={4} align="start">
                      <Text fontWeight="bold" color="blue.800" fontSize="lg">
                        Upgrade to Premium
                      </Text>
                      <VStack align="start" spacing={2} fontSize="sm" color="blue.700">
                        <Text>✓ Unlimited video and photo uploads</Text>
                        <Text>✓ Advanced profile analytics and insights</Text>
                        <Text>✓ Priority coach matching and visibility</Text>
                        <Text>✓ Custom profile themes and branding</Text>
                        <Text>✓ Priority customer support</Text>
                        <Text>✓ Early access to new features</Text>
                      </VStack>
                      <Button colorScheme="blue" size="md" mt={2}>
                        Upgrade to Premium - $9.99/month
                      </Button>
                    </VStack>
                  </Box>
                )}

                <Divider />

                <VStack spacing={3} align="start">
                  <Text fontWeight="semibold" fontSize="lg">
                    Account Information
                  </Text>
                  <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                    <Text>
                      <strong>Username:</strong> {profile?.username}
                    </Text>
                    <Text>
                      <strong>Email:</strong> {profile?.email}
                    </Text>
                    <Text>
                      <strong>Member since:</strong>{" "}
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                    </Text>
                    <Text>
                      <strong>Account ID:</strong> {profile?.id}
                    </Text>
                  </VStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Privacy & Data Settings */}
        {activeTab === "data" && (
          <VStack spacing={6} align="stretch">
            <ConsentManager />
            <DataExportManager />
            <AccountDeletionManager />
          </VStack>
        )}
      </VStack>

      {/* Data Export Modal */}
      <Modal isOpen={isExportOpen} onClose={onExportClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export Your Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Text>This will download a JSON file containing all your account data, including:</Text>
              <VStack align="start" spacing={1} fontSize="sm" color="gray.600" pl={4}>
                <Text>• Profile information and athlete details</Text>
                <Text>• Uploaded photos and videos (metadata only)</Text>
                <Text>• Awards and achievements</Text>
                <Text>• Schedule and events</Text>
                <Text>• Coach reviews and ratings</Text>
                <Text>• Privacy and notification settings</Text>
              </VStack>
              <Alert status="info" size="sm">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Media files will need to be downloaded separately from your dashboard. This export contains metadata
                  and links only.
                </AlertDescription>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onExportClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleDataExport}>
              Download Data
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Account Deletion Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Alert status="error">
                <AlertIcon />
                <AlertTitle fontSize="sm">This action cannot be undone!</AlertTitle>
              </Alert>
              <Text>Deleting your account will permanently remove:</Text>
              <VStack align="start" spacing={1} fontSize="sm" color="gray.600" pl={4}>
                <Text>• Your athlete profile and all personal information</Text>
                <Text>• All uploaded photos and videos</Text>
                <Text>• Awards, achievements, and schedule data</Text>
                <Text>• Coach reviews and ratings</Text>
                <Text>• All account settings and preferences</Text>
                <Text>• Access to premium features (if applicable)</Text>
              </VStack>
              <Text fontSize="sm" color="red.600" fontWeight="semibold">
                This action is permanent and cannot be reversed. We recommend exporting your data first.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleAccountDeletion}>
              Request Account Deletion
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
