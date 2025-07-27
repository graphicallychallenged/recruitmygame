"use client"

import {
  Card,
  CardBody,
  Heading,
  Button,
  Grid,
  GridItem,
  AspectRatio,
  Image,
  HStack,
  Icon,
  Flex,
  Text
} from "@chakra-ui/react"
import { Camera } from "lucide-react"
import type { AthletePhoto } from "@/types/database"

interface PhotoGallerySectionProps {
  photos: AthletePhoto[]
  showAllPhotos: boolean
  onToggleShowAll: () => void
  onPhotoClick: (index: number) => void
  primaryColor: string
  textColor: string
  cardBgColor: string
  borderColor: string
}

export function PhotoGallerySection({
  photos,
  showAllPhotos,
  onToggleShowAll,
  onPhotoClick,
  primaryColor,
  textColor,
  cardBgColor,
  borderColor,
}: PhotoGallerySectionProps) {
  if (photos.length === 0) return null

  const displayedPhotos = showAllPhotos ? photos : photos.slice(0, 6)

  return (
    <Card h="fit-content" bg={cardBgColor} borderColor={borderColor}>
      <CardBody>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color={textColor}>
            <HStack spacing={2}>
              <Icon as={Camera} color={primaryColor} />
              <Text>Photo Gallery</Text>
            </HStack>
          </Heading>
          {photos.length > 6 && (
            <Button size="sm" variant="ghost" onClick={onToggleShowAll} color={textColor}>
              {showAllPhotos ? "Show Less" : `View All (${photos.length})`}
            </Button>
          )}
        </Flex>
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          {displayedPhotos.map((photo, index) => (
            <GridItem key={photo.id} onClick={() => onPhotoClick(index)}>
              <AspectRatio ratio={1}>
                <Image
                  src={photo.photo_url || "/placeholder.svg"}
                  alt={photo.caption || "Athlete photo"}
                  objectFit="cover"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ opacity: 0.8 }}
                  transition="opacity 0.2s"
                />
              </AspectRatio>
            </GridItem>
          ))}
        </Grid>
      </CardBody>
    </Card>
  )
}
