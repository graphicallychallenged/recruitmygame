import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { BusinessCardGenerator } from "@/components/BusinessCardGenerator"
import type { Metadata } from "next"
import { Container, VStack, Box, Heading, Text, HStack, Badge } from "@chakra-ui/react"
import { CreditCard } from "lucide-react"
import { getTierDisplayName, getTierColor } from "@/utils/tierFeatures"

export const metadata: Metadata = {
  title: "Business Cards | RecruitMyGame",
  description: "Generate professional business cards with Canva integration",
}

export default async function BusinessCardsPage() {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Get athlete profile
  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select(
      `
      athlete_name,
      sport,
      school,
      location,
      username,
      profile_picture_url,
      primary_color,
      secondary_color,
      email,
      phone,
      subscription_tier
    `,
    )
    .eq("user_id", user.id)
    .single()

  if (athleteError || !athlete) {
    redirect("/dashboard/create-profile")
  }

  const subscriptionTier = (athlete.subscription_tier || "free") as "free" | "premium" | "pro"

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            <HStack spacing={2}>
              <CreditCard size={24} />
              <Text>Business Card Generator</Text>
              <Badge colorScheme={getTierColor(subscriptionTier)} variant="solid">
                {getTierDisplayName(subscriptionTier)}
              </Badge>
            </HStack>
          </Heading>
          <Text color="gray.600">Create professional business cards powered by Canva</Text>
        </Box>

        {/* Business Card Generator Component */}
        <BusinessCardGenerator
          athlete={{
            athlete_name: athlete.athlete_name,
            sport: athlete.sport,
            school: athlete.school,
            location: athlete.location,
            username: athlete.username,
            profile_picture_url: athlete.profile_picture_url,
            primary_color: athlete.primary_color,
            secondary_color: athlete.secondary_color,
            email: athlete.email,
            phone: athlete.phone,
          }}
          subscription_tier={subscriptionTier}
        />
      </VStack>
    </Container>
  )
}
