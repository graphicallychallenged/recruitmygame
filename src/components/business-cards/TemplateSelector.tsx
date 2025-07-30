"use client"

import {
  FormControl,
  FormLabel,
  HStack,
  Button,
  VStack,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  Box,
  Grid,
  GridItem,
  Image,
} from "@chakra-ui/react"
import { RefreshCw } from "lucide-react"
import type { CardDesign } from "@/types/canva"

interface TemplateSelectorProps {
  templates: CardDesign[]
  selectedTemplate: string
  onSelectTemplate: (templateId: string) => void
  onRefresh: () => void
  loading: boolean
}

export function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onRefresh,
  loading,
}: TemplateSelectorProps) {
  if (loading) {
    return (
      <VStack spacing={3} py={8}>
        <Spinner size="lg" color="purple.500" />
        <Text fontSize="sm" color="gray.600">
          Loading your Canva templates...
        </Text>
      </VStack>
    )
  }

  if (templates.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <Text fontWeight="medium">No templates found</Text>
          <Text fontSize="sm">Create business card templates in Canva first, then refresh to see them here.</Text>
        </Box>
      </Alert>
    )
  }

  return (
    <FormControl>
      <HStack justify="space-between" mb={3}>
        <FormLabel mb={0}>Card Templates</FormLabel>
        <Button size="sm" variant="ghost" leftIcon={<RefreshCw size={14} />} onClick={onRefresh}>
          Refresh
        </Button>
      </HStack>

      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        {templates.map((template) => (
          <GridItem key={template.id}>
            <Box
              borderRadius="md"
              overflow="hidden"
              border="2px solid"
              borderColor={selectedTemplate === template.canva_template_id ? "purple.500" : "gray.200"}
              cursor="pointer"
              onClick={() => onSelectTemplate(template.canva_template_id)}
              transition="all 0.2s"
              _hover={{ borderColor: "purple.300" }}
            >
              <Image
                src={template.preview_url || "/placeholder.svg?height=120&width=200&text=Business+Card"}
                alt={template.name}
                w="full"
                h="120px"
                objectFit="cover"
              />
              <Box p={3}>
                <Text fontWeight="medium" fontSize="sm">
                  {template.name}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {template.description}
                </Text>
                {template.created_at && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </Text>
                )}
              </Box>
            </Box>
          </GridItem>
        ))}
      </Grid>
    </FormControl>
  )
}
