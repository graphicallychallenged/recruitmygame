"use client"

import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem, Divider, Button } from "@chakra-ui/react"
import Link from "next/link"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"

export default function CookiePolicy() {
  return (
    <Box minH="100vh">
      <SiteHeader />

      <Box bg="gray.50" py={12}>
        <Container maxW="4xl">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Heading size="2xl" mb={4}>
                Cookie Policy
              </Heading>
              <Text color="gray.600">Last updated: {new Date().toLocaleDateString()}</Text>
            </Box>

            <Box bg="white" p={8} rounded="lg" shadow="sm">
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="lg" mb={4}>
                    What Are Cookies?
                  </Heading>
                  <Text>
                    Cookies are small text files that are stored on your device when you visit our website. They help us
                    provide you with a better experience by remembering your preferences and improving our services.
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    How We Use Cookies
                  </Heading>
                  <Text mb={4}>RecruitMyGame uses cookies for the following purposes:</Text>

                  <Box mb={4}>
                    <Text fontWeight="semibold" mb={2}>
                      Essential Cookies (Required)
                    </Text>
                    <UnorderedList spacing={1} ml={6}>
                      <ListItem>Authentication and login sessions</ListItem>
                      <ListItem>Security and fraud prevention</ListItem>
                      <ListItem>Basic website functionality</ListItem>
                      <ListItem>Form submission and data processing</ListItem>
                    </UnorderedList>
                  </Box>

                  <Box mb={4}>
                    <Text fontWeight="semibold" mb={2}>
                      Performance Cookies (Optional)
                    </Text>
                    <UnorderedList spacing={1} ml={6}>
                      <ListItem>Website analytics and usage statistics</ListItem>
                      <ListItem>Page load times and performance monitoring</ListItem>
                      <ListItem>Error tracking and debugging</ListItem>
                    </UnorderedList>
                  </Box>

                  <Box mb={4}>
                    <Text fontWeight="semibold" mb={2}>
                      Functional Cookies (Optional)
                    </Text>
                    <UnorderedList spacing={1} ml={6}>
                      <ListItem>User preferences and settings</ListItem>
                      <ListItem>Language and region preferences</ListItem>
                      <ListItem>Theme and display preferences</ListItem>
                      <ListItem>Recently viewed profiles and content</ListItem>
                    </UnorderedList>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    Third-Party Cookies
                  </Heading>
                  <Text mb={4}>We may use third-party services that set their own cookies. These include:</Text>
                  <UnorderedList spacing={1} ml={6}>
                    <ListItem>
                      <strong>Supabase:</strong> Authentication and database services
                    </ListItem>
                    <ListItem>
                      <strong>Vercel:</strong> Website hosting and performance
                    </ListItem>
                    <ListItem>
                      <strong>Google Analytics:</strong> Website usage analytics (if enabled)
                    </ListItem>
                    <ListItem>
                      <strong>Social Media:</strong> Login integration (Google, Facebook, etc.)
                    </ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    Managing Your Cookie Preferences
                  </Heading>
                  <Text mb={4}>You can control cookies in several ways:</Text>

                  <Box mb={4}>
                    <Text fontWeight="semibold" mb={2}>
                      Browser Settings
                    </Text>
                    <Text mb={2}>Most browsers allow you to control cookies through their settings. You can:</Text>
                    <UnorderedList spacing={1} ml={6}>
                      <ListItem>Block all cookies</ListItem>
                      <ListItem>Block third-party cookies only</ListItem>
                      <ListItem>Delete existing cookies</ListItem>
                      <ListItem>Set cookies to expire when you close your browser</ListItem>
                    </UnorderedList>
                  </Box>

                  <Box mb={4}>
                    <Text fontWeight="semibold" mb={2}>
                      Our Cookie Settings
                    </Text>
                    <Text mb={4}>You can manage your cookie preferences for RecruitMyGame using the button below:</Text>
                    <Button
                      bg="teal.500"
                      color="white"
                      _hover={{ bg: "teal.600" }}
                      onClick={() => alert("Cookie preferences panel would open here")}
                    >
                      Manage Cookie Preferences
                    </Button>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    Cookie Retention
                  </Heading>
                  <Text mb={4}>Different cookies have different lifespans:</Text>
                  <UnorderedList spacing={1} ml={6}>
                    <ListItem>
                      <strong>Session Cookies:</strong> Deleted when you close your browser
                    </ListItem>
                    <ListItem>
                      <strong>Authentication Cookies:</strong> Expire after 30 days of inactivity
                    </ListItem>
                    <ListItem>
                      <strong>Preference Cookies:</strong> Stored for up to 1 year
                    </ListItem>
                    <ListItem>
                      <strong>Analytics Cookies:</strong> Stored for up to 2 years
                    </ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    Impact of Disabling Cookies
                  </Heading>
                  <Text mb={4}>If you disable cookies, some features of RecruitMyGame may not work properly:</Text>
                  <UnorderedList spacing={1} ml={6}>
                    <ListItem>You may need to log in repeatedly</ListItem>
                    <ListItem>Your preferences won't be saved</ListItem>
                    <ListItem>Some forms may not function correctly</ListItem>
                    <ListItem>We won't be able to remember your settings</ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    Updates to This Policy
                  </Heading>
                  <Text>
                    We may update this Cookie Policy from time to time. When we do, we will post the updated policy on
                    this page and update the "Last updated" date at the top.
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Heading size="lg" mb={4}>
                    Contact Us
                  </Heading>
                  <Text>
                    If you have questions about our use of cookies, please contact us at{" "}
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
