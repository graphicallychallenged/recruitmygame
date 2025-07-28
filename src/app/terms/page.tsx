"use client"

import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem, Divider } from "@chakra-ui/react"
import Link from "next/link"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"

export default function TermsOfService() {
  return (
    <Box minH="100vh">
      <SiteHeader />

      <Box bg="gray.50" py={12}>
        <Container maxW="4xl">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Heading size="2xl" mb={4}>
                Terms of Service
              </Heading>
              <Text color="gray.600">Last updated: {new Date().toLocaleDateString()}</Text>
            </Box>

            <Box bg="white" p={8} rounded="lg" shadow="sm">
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="lg" mb={4}>
                    1. Acceptance of Terms
                  </Heading>
                  <Text>
                    By accessing and using RecruitMyGame, you accept and agree to be bound by the terms and provision of
                    this agreement. If you do not agree to abide by the above, please do not use this service.
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    2. Service Description
                  </Heading>
                  <Text mb={4}>
                    RecruitMyGame is a platform that allows student-athletes to create comprehensive profiles showcasing
                    their athletic achievements, academic performance, character, and availability to college coaches
                    and recruiters.
                  </Text>
                  <Text fontWeight="semibold" mb={2}>
                    Our services include:
                  </Text>
                  <UnorderedList spacing={1} ml={6}>
                    <ListItem>Athlete profile creation and management</ListItem>
                    <ListItem>Photo and video hosting (up to plan limits)</ListItem>
                    <ListItem>Schedule and availability tracking</ListItem>
                    <ListItem>Business card and QR code generation</ListItem>
                    <ListItem>Coach review and testimonial system</ListItem>
                    <ListItem>Awards and achievement tracking</ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    3. User Responsibilities
                  </Heading>
                  <Text mb={4}>As a user of RecruitMyGame, you agree to:</Text>
                  <UnorderedList spacing={1} ml={6}>
                    <ListItem>Provide accurate and truthful information</ListItem>
                    <ListItem>Keep your login credentials secure</ListItem>
                    <ListItem>Not upload inappropriate, offensive, or copyrighted content</ListItem>
                    <ListItem>Respect other users and maintain professional conduct</ListItem>
                    <ListItem>Comply with all applicable laws and regulations</ListItem>
                    <ListItem>Not attempt to hack, disrupt, or misuse our services</ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    4. Content Ownership
                  </Heading>
                  <Text mb={4}>
                    You retain ownership of all content you upload to RecruitMyGame. By uploading content, you grant us
                    a license to display, store, and share your content as necessary to provide our services.
                  </Text>
                  <Text>
                    We reserve the right to remove content that violates our terms or is deemed inappropriate.
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    5. Subscription and Billing
                  </Heading>
                  <Text mb={4}>
                    RecruitMyGame offers both free and paid subscription plans. Paid subscriptions are billed monthly or
                    annually as selected. You may cancel your subscription at any time.
                  </Text>
                  <Text>
                    Refunds are provided according to our refund policy. Failure to pay subscription fees may result in
                    account suspension or termination.
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    6. Limitation of Liability
                  </Heading>
                  <Text>
                    RecruitMyGame is provided "as is" without warranties of any kind. We are not liable for any damages
                    arising from your use of our service, including but not limited to lost opportunities, data loss, or
                    service interruptions.
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    7. Termination
                  </Heading>
                  <Text>
                    We reserve the right to terminate or suspend your account at any time for violation of these terms.
                    You may also terminate your account at any time through your account settings.
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    8. Contact Information
                  </Heading>
                  <Text>
                    For questions about these Terms of Service, please contact us at{" "}
                    <Link
                      href="mailto:legal@recruitmygame.com"
                      style={{ color: "#14b8a6", textDecoration: "underline" }}
                    >
                      legal@recruitmygame.com
                    </Link>
                  </Text>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>

      <SiteFooter />
    </Box>
  )
}
