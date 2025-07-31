"use client"

import { useState } from "react"
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Checkbox,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  Divider,
} from "@chakra-ui/react"
import { Download, FileText, Database } from "lucide-react"

interface DataExportOptions {
  include_profile: boolean
  include_media: boolean
  include_awards: boolean
  include_schedule: boolean
  include_reviews: boolean
  include_audit_logs: boolean
}

export function DataExportManager() {
  const [options, setOptions] = useState<DataExportOptions>({
    include_profile: true,
    include_media: true,
    include_awards: true,
    include_schedule: true,
    include_reviews: true,
    include_audit_logs: false,
  })
  const [exporting, setExporting] = useState(false)
  const toast = useToast()

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch("/api/compliance/data-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ options }),
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      // Create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `recruitmygame-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Your data has been exported successfully",
        status: "success",
        duration: 5000,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Error",
        description: "Failed to export your data",
        status: "error",
        duration: 5000,
      })
    } finally {
      setExporting(false)
    }
  }

  const updateOption = (key: keyof DataExportOptions, value: boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const exportOptions = [
    {
      key: "include_profile" as const,
      label: "Profile Information",
      description: "Personal details, contact info, athletic stats",
      icon: FileText,
    },
    {
      key: "include_media" as const,
      label: "Photos & Videos",
      description: "All uploaded media files (metadata and links)",
      icon: Database,
    },
    {
      key: "include_awards" as const,
      label: "Awards & Achievements",
      description: "All recorded awards and accomplishments",
      icon: FileText,
    },
    {
      key: "include_schedule" as const,
      label: "Schedule & Events",
      description: "Games, practices, and important dates",
      icon: FileText,
    },
    {
      key: "include_reviews" as const,
      label: "Coach Reviews",
      description: "Reviews and ratings from coaches",
      icon: FileText,
    },
    {
      key: "include_audit_logs" as const,
      label: "Activity Logs",
      description: "Recent account activity (last 90 days)",
      icon: Database,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <HStack spacing={3}>
          <Download size={24} />
          <VStack align="start" spacing={0}>
            <Heading size="md">Export Your Data</Heading>
            <Text fontSize="sm" color="gray.600">
              Download a copy of all your data
            </Text>
          </VStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Alert status="info" size="sm">
            <AlertIcon />
            <AlertDescription fontSize="sm">
              Your data will be exported as a JSON file containing all selected information. Media files will include
              metadata and download links.
            </AlertDescription>
          </Alert>

          <VStack spacing={4} align="stretch">
            <Text fontWeight="semibold">Select data to include:</Text>

            {exportOptions.map((option, index) => (
              <Box key={option.key}>
                <HStack spacing={3} align="start">
                  <Checkbox
                    isChecked={options[option.key]}
                    onChange={(e) => updateOption(option.key, e.target.checked)}
                    colorScheme="teal"
                    mt={1}
                  />
                  <HStack spacing={2} flex={1}>
                    <option.icon size={16} />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontWeight="medium">{option.label}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {option.description}
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>
                {index < exportOptions.length - 1 && <Divider mt={3} />}
              </Box>
            ))}
          </VStack>

          <Button
            leftIcon={<Download size={16} />}
            colorScheme="teal"
            onClick={handleExport}
            isLoading={exporting}
            loadingText="Exporting..."
            size="lg"
          >
            Export My Data
          </Button>

          <Box pt={4} borderTop="1px" borderColor="gray.200">
            <Text fontSize="xs" color="gray.500">
              This export complies with GDPR and CCPA data portability requirements. The file will contain all your
              personal data in a structured, machine-readable format.
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
}
