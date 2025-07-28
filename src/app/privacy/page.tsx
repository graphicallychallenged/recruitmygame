"use client"

import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem, Divider } from "@chakra-ui/react"
import Link from "next/link"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"

export default function PrivacyPolicy() {
  return (
    <Box minH="100vh">
      <SiteHeader />

      <Box bg="gray.50" py={12}>
        <Container maxW="4xl">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Heading size="2xl" mb={4}>
                Privacy Policy
              </Heading>
              <Text color="gray.600">Last updated: {new Date().toLocaleDateString()}</Text>
            </Box>

            <Box bg="white" p={8} rounded="lg" shadow="sm">
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="lg" mb={4}>
                    1. Information We Collect
                  </Heading>
                  <Text mb={4}>
                    RecruitMyGame collects information you provide directly to us, such as when you create an account,
                    build your athlete profile, or contact us for support.
                  </Text>
                  <Text fontWeight="semibold" mb={2}>
                    Personal Information:
                  </Text>
                  <UnorderedList spacing={1} ml={6}>
                    <ListItem>Name, email address, and contact information</ListItem>
                    <ListItem>Athletic information (sport, position, stats, achievements)</ListItem>
                    <ListItem>Photos, videos, and other media you upload</ListItem>
                    <ListItem>Academic information (GPA, test scores, graduation year)</ListItem>
                    <ListItem>Schedule and availability information</ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    2. How We Use Your Information
                  </Heading>
                  <Text mb={4}>We use the information we collect to:</Text>
                  <UnorderedList spacing={1} ml={6}>
                    <ListItem>Provide, maintain, and improve our services</ListItem>
                    <ListItem>Create and display your athlete profile</ListItem>
                    <ListItem>Enable coaches and recruiters to discover your profile</ListItem>
                    <ListItem>Send you updates about your account and our services</ListItem>
                    <ListItem>Respond to your comments, questions, and support requests</ListItem>
                    <ListItem>Generate business cards and QR codes for networking</ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    3. Information Sharing
                  </Heading>
                  <Text mb={4}>
                    Your athlete profile is designed to be visible to coaches, recruiters, and other authorized users.
                    You control the visibility of your profile through your privacy settings.
                  </Text>
                  <Text mb={4}>We do not sell, trade, or rent your personal information to third parties.</Text>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    4. Data Security
                  </Heading>
                  <Text mb={4}>
                    We implement appropriate security measures to protect your personal information against unauthorized
                    access, alteration, disclosure, or destruction. We use industry-standard encryption and secure
                    servers.
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    5. Your Rights
                  </Heading>
                  <Text mb={4}>You have the right to:</Text>
                  <UnorderedList spacing={1} ml={6}>
                    <ListItem>Access, update, or delete your personal information</ListItem>
                    <ListItem>Control the visibility of your profile</ListItem>
                    <ListItem>Request a copy of your data</ListItem>
                    <ListItem>Opt out of marketing communications</ListItem>
                    <ListItem>Delete your account at any time</ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    6. Contact Us
                  </Heading>
                  <Text>
                    If you have any questions about this Privacy Policy, please contact us at{" "}
                    <Link
                      href="mailto:privacy@recruitmygame.com"
                      style={{ color: "#14b8a6", textDecoration: "underline" }}
                    >
                      privacy@recruitmygame.com
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
