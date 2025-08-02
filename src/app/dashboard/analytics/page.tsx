"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Button,
  useToast,
  Grid,
  GridItem,
  Badge,
  Flex,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  Select,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Search,
  Share2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  CodeIcon,
  MapPin,
  Globe,
  Shield,
  Camera,
  Video,
  Award,
  UserCheck,
} from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { AthleteProfile, ProfileAudit, ProfileAnalytics, VisitorSession, PageView } from "@/types/database"

interface AnalyticsData {
  analytics: ProfileAnalytics[]
  sessions: VisitorSession[]
  pageViews: PageView[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export default function AnalyticsPage() {
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [auditLoading, setAuditLoading] = useState(false)
  const [audit, setAudit] = useState<ProfileAudit | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [schema, setSchema] = useState<string>("")
  const [timeRange, setTimeRange] = useState("30")
  const toast = useToast()
  const router = useRouter()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (athlete) {
      fetchAnalyticsData()
    }
  }, [timeRange, athlete])

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: athleteData, error } = await supabase.from("athletes").select("*").eq("user_id", user.id).single()

      if (error) {
        console.error("Error fetching athlete:", error)
        return
      }

      if (athleteData.subscription_tier !== "pro") {
        toast({
          title: "Pro subscription required",
          description: "Analytics are only available for Pro subscribers.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        })
        router.push("/subscription")
        return
      }

      setAthlete(athleteData)
      await Promise.all([fetchLatestAudit(), fetchSchema()])
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error loading data",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchLatestAudit = async () => {
    try {
      const response = await fetch("/api/analytics/audit")
      if (response.ok) {
        const data = await response.json()
        setAudit(data)
      }
    } catch (error) {
      console.error("Error fetching audit:", error)
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics/data?days=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const fetchSchema = async () => {
    try {
      const response = await fetch("/api/analytics/schema")
      if (response.ok) {
        const data = await response.json()
        setSchema(data.schema)
      }
    } catch (error) {
      console.error("Error fetching schema:", error)
    }
  }

  const runProfileAudit = async () => {
    setAuditLoading(true)
    try {
      const response = await fetch("/api/analytics/audit", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setAudit(data)
        toast({
          title: "Profile audit completed!",
          description: "Your profile has been analyzed and recommendations generated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error("Failed to run audit")
      }
    } catch (error: any) {
      toast({
        title: "Error running audit",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setAuditLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "green"
    if (score >= 60) return "yellow"
    return "red"
  }

  const getOverallScore = () => {
    if (!audit) return 0
    return Math.round((audit.completeness_score + audit.seo_score + audit.social_score + audit.content_score) / 4)
  }

  // Process analytics data for charts
  const processAnalyticsData = () => {
    if (!analyticsData) return { chartData: [], deviceData: [], locationData: [], referrerData: [], countryData: [] }

    const chartData = analyticsData.analytics.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      views: item.page_views,
      visitors: item.unique_visitors,
      bounceRate: item.bounce_rate,
      avgDuration: item.avg_session_duration,
    }))

    // Process device data
    const deviceData = analyticsData.sessions.reduce((acc: any[], session) => {
      const device = session.device_type || "Unknown"
      const existing = acc.find((item) => item.name === device)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: device, value: 1 })
      }
      return acc
    }, [])

    // Process location data by country
    const countryData = analyticsData.sessions.reduce((acc: any[], session) => {
      const country = session.country || "Unknown"
      const existing = acc.find((item) => item.name === country)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: country, value: 1 })
      }
      return acc
    }, [])

    // Process location data by city
    const locationData = analyticsData.sessions.reduce((acc: any[], session) => {
      const location =
        session.city && session.country ? `${session.city}, ${session.country}` : session.country || "Unknown"
      const existing = acc.find((item) => item.name === location)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: location, value: 1 })
      }
      return acc
    }, [])

    // Process referrer data
    const referrerData = analyticsData.sessions.reduce((acc: any[], session) => {
      let referrer = "Direct"
      if (session.referrer) {
        try {
          referrer = new URL(session.referrer).hostname
        } catch {
          referrer = session.referrer
        }
      }
      const existing = acc.find((item) => item.name === referrer)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: referrer, value: 1 })
      }
      return acc
    }, [])

    return { chartData, deviceData, locationData, referrerData, countryData }
  }

  const { chartData, deviceData, locationData, referrerData, countryData } = processAnalyticsData()

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Container>
    )
  }

  if (!athlete) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Profile not found!</AlertTitle>
          <AlertDescription>Unable to load your athlete profile. Please try refreshing the page.</AlertDescription>
        </Alert>
      </Container>
    )
  }

  if (athlete.subscription_tier !== "pro") {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <AlertTitle>Pro Subscription Required</AlertTitle>
            <AlertDescription>
              Analytics are only available for Pro subscribers.{" "}
              <Button as={Link} href="/subscription" size="sm" colorScheme="blue" variant="link">
                Upgrade to Pro
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            <HStack spacing={2}>
              <Icon as={BarChart3} color="purple.500" />
              <Text>Analytics Dashboard</Text>
              <Badge colorScheme="purple" variant="subtle">
                Pro
              </Badge>
            </HStack>
          </Heading>
          <Text color="gray.600">Comprehensive insights into your profile performance and visitor behavior</Text>
        </Box>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={TrendingUp} size={16} />
                <Text>Overview</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={CheckCircle} size={16} />
                <Text>Profile Audit</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={Users} size={16} />
                <Text>Visitor Analytics</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={MapPin} size={16} />
                <Text>Geographic Data</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={CodeIcon} size={16} />
                <Text>SEO Schema</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Key Metrics */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
                  <GridItem>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Overall Score</StatLabel>
                          <StatNumber color={`${getScoreColor(getOverallScore())}.500`}>
                            {getOverallScore()}%
                          </StatNumber>
                          <StatHelpText>Profile health</StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Total Views</StatLabel>
                          <StatNumber>
                            {analyticsData?.analytics
                              .reduce((sum, item) => sum + item.page_views, 0)
                              ?.toLocaleString() || 0}
                          </StatNumber>
                          <StatHelpText>
                            <StatArrow type="increase" />
                            Last {timeRange} days
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Unique Visitors</StatLabel>
                          <StatNumber>
                            {analyticsData?.analytics
                              .reduce((sum, item) => sum + item.unique_visitors, 0)
                              ?.toLocaleString() || 0}
                          </StatNumber>
                          <StatHelpText>
                            <StatArrow type="increase" />
                            Last {timeRange} days
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Avg. Session</StatLabel>
                          <StatNumber>
                            {Math.round(
                              (analyticsData?.analytics.reduce((sum, item) => sum + item.avg_session_duration, 0) ||
                                0) / (analyticsData?.analytics.length || 1),
                            )}
                            s
                          </StatNumber>
                          <StatHelpText>Duration</StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>

                {/* Time Range Selector */}
                <HStack justify="space-between">
                  <Heading size="md">Traffic Overview</Heading>
                  <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} w="200px">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </Select>
                </HStack>

                {/* Traffic Chart */}
                <Card>
                  <CardBody>
                    <Box h="400px">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="views" stroke="#3182CE" strokeWidth={2} name="Page Views" />
                          <Line
                            type="monotone"
                            dataKey="visitors"
                            stroke="#38A169"
                            strokeWidth={2}
                            name="Unique Visitors"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardBody>
                </Card>

                {/* Device and Location Analytics */}
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem>
                    <Card>
                      <CardBody>
                        <Heading size="sm" mb={4}>
                          Device Types
                        </Heading>
                        <Box h="300px">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={deviceData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {deviceData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem>
                    <Card>
                      <CardBody>
                        <Heading size="sm" mb={4}>
                          <HStack spacing={2}>
                            <Icon as={Globe} size={16} />
                            <Text>Top Countries</Text>
                          </HStack>
                        </Heading>
                        <VStack spacing={3} align="stretch">
                          {countryData.slice(0, 5).map((country, index) => (
                            <HStack key={country.name} justify="space-between">
                              <Text>{country.name}</Text>
                              <Badge colorScheme="blue">{country.value} visits</Badge>
                            </HStack>
                          ))}
                          {countryData.length === 0 && (
                            <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                              No location data available yet
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              </VStack>
            </TabPanel>

            {/* Profile Audit Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Box>
                    <Heading size="md">Profile Audit</Heading>
                    <Text color="gray.600">
                      {audit
                        ? `Last updated: ${new Date(audit.audit_date).toLocaleDateString()}`
                        : "No audit available"}
                    </Text>
                  </Box>
                  <Button
                    leftIcon={<RefreshCw size={16} />}
                    colorScheme="blue"
                    onClick={runProfileAudit}
                    isLoading={auditLoading}
                    loadingText="Analyzing..."
                  >
                    Run New Audit
                  </Button>
                </HStack>

                {audit && (
                  <>
                    {/* Score Cards */}
                    <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
                      <GridItem>
                        <Card>
                          <CardBody textAlign="center">
                            <Icon
                              as={CheckCircle}
                              size={32}
                              color={`${getScoreColor(audit.completeness_score)}.500`}
                              mb={2}
                            />
                            <Text
                              fontSize="2xl"
                              fontWeight="bold"
                              color={`${getScoreColor(audit.completeness_score)}.500`}
                            >
                              {audit.completeness_score}%
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Completeness
                            </Text>
                            <Progress
                              value={audit.completeness_score}
                              colorScheme={getScoreColor(audit.completeness_score)}
                              size="sm"
                              mt={2}
                            />
                          </CardBody>
                        </Card>
                      </GridItem>
                      <GridItem>
                        <Card>
                          <CardBody textAlign="center">
                            <Icon as={Search} size={32} color={`${getScoreColor(audit.seo_score)}.500`} mb={2} />
                            <Text fontSize="2xl" fontWeight="bold" color={`${getScoreColor(audit.seo_score)}.500`}>
                              {audit.seo_score}%
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              SEO Score
                            </Text>
                            <Progress
                              value={audit.seo_score}
                              colorScheme={getScoreColor(audit.seo_score)}
                              size="sm"
                              mt={2}
                            />
                          </CardBody>
                        </Card>
                      </GridItem>
                      <GridItem>
                        <Card>
                          <CardBody textAlign="center">
                            <Icon as={Share2} size={32} color={`${getScoreColor(audit.social_score)}.500`} mb={2} />
                            <Text fontSize="2xl" fontWeight="bold" color={`${getScoreColor(audit.social_score)}.500`}>
                              {audit.social_score}%
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Social Presence
                            </Text>
                            <Progress
                              value={audit.social_score}
                              colorScheme={getScoreColor(audit.social_score)}
                              size="sm"
                              mt={2}
                            />
                          </CardBody>
                        </Card>
                      </GridItem>
                      <GridItem>
                        <Card>
                          <CardBody textAlign="center">
                            <Icon as={Eye} size={32} color={`${getScoreColor(audit.content_score)}.500`} mb={2} />
                            <Text fontSize="2xl" fontWeight="bold" color={`${getScoreColor(audit.content_score)}.500`}>
                              {audit.content_score}%
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Content Quality
                            </Text>
                            <Progress
                              value={audit.content_score}
                              colorScheme={getScoreColor(audit.content_score)}
                              size="sm"
                              mt={2}
                            />
                          </CardBody>
                        </Card>
                      </GridItem>
                    </Grid>

                    {/* Content Breakdown - New section showing verified reviews */}
                    {audit.audit_data && (
                      <Card>
                        <CardBody>
                          <Heading size="sm" mb={4}>
                            <HStack spacing={2}>
                              <Icon as={BarChart3} color="blue.500" />
                              <Text>Content Breakdown</Text>
                            </HStack>
                          </Heading>
                          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }} gap={4}>
                            <GridItem>
                              <VStack spacing={2}>
                                <Icon as={Camera} size={24} color="blue.500" />
                                <Text fontSize="sm" fontWeight="medium">
                                  Photos
                                </Text>
                                <Badge
                                  colorScheme={audit.audit_data.photo_count > 0 ? "green" : "gray"}
                                  variant="subtle"
                                >
                                  {audit.audit_data.photo_count || 0}
                                </Badge>
                              </VStack>
                            </GridItem>
                            <GridItem>
                              <VStack spacing={2}>
                                <Icon as={Video} size={24} color="purple.500" />
                                <Text fontSize="sm" fontWeight="medium">
                                  Videos
                                </Text>
                                <Badge
                                  colorScheme={audit.audit_data.video_count > 0 ? "green" : "gray"}
                                  variant="subtle"
                                >
                                  {audit.audit_data.video_count || 0}
                                </Badge>
                              </VStack>
                            </GridItem>
                            <GridItem>
                              <VStack spacing={2}>
                                <Icon as={Award} size={24} color="yellow.500" />
                                <Text fontSize="sm" fontWeight="medium">
                                  Awards
                                </Text>
                                <Badge
                                  colorScheme={audit.audit_data.award_count > 0 ? "green" : "gray"}
                                  variant="subtle"
                                >
                                  {audit.audit_data.award_count || 0}
                                </Badge>
                              </VStack>
                            </GridItem>
                            <GridItem>
                              <VStack spacing={2}>
                                <Icon as={UserCheck} size={24} color="teal.500" />
                                <Text fontSize="sm" fontWeight="medium">
                                  Teams
                                </Text>
                                <Badge colorScheme={audit.audit_data.team_count > 0 ? "green" : "red"} variant="subtle">
                                  {audit.audit_data.team_count || 0}
                                </Badge>
                              </VStack>
                            </GridItem>
                            <GridItem>
                              <VStack spacing={2}>
                                <Icon as={Shield} size={24} color="orange.500" />
                                <Text fontSize="sm" fontWeight="medium">
                                  Verified Reviews
                                </Text>
                                <Badge
                                  colorScheme={
                                    audit.audit_data.verified_reviews > 0
                                      ? "green"
                                      : audit.audit_data.total_reviews > 0
                                        ? "yellow"
                                        : "gray"
                                  }
                                  variant="subtle"
                                >
                                  {audit.audit_data.verified_reviews || 0} of {audit.audit_data.total_reviews || 0}
                                </Badge>
                              </VStack>
                            </GridItem>
                          </Grid>

                          {/* Critical Missing Elements Alert */}
                          {(audit.audit_data.team_count === 0 || audit.audit_data.verified_reviews === 0) && (
                            <Box
                              mt={6}
                              p={4}
                              bg="red.50"
                              borderRadius="md"
                              borderLeft="4px solid"
                              borderColor="red.500"
                            >
                              <HStack spacing={2} mb={2}>
                                <Icon as={AlertCircle} size={16} color="red.500" />
                                <Text fontSize="sm" fontWeight="bold" color="red.700">
                                  Critical Profile Elements Missing
                                </Text>
                              </HStack>
                              <VStack spacing={2} align="start">
                                {audit.audit_data.team_count === 0 && (
                                  <Text fontSize="sm" color="red.600">
                                    • Team history is required for a complete profile - coaches need to see your
                                    experience
                                  </Text>
                                )}
                                {audit.audit_data.verified_reviews === 0 && (
                                  <Text fontSize="sm" color="red.600">
                                    • Verified reviews build credibility and trust with college coaches
                                  </Text>
                                )}
                              </VStack>
                            </Box>
                          )}

                          {/* Review Verification Status */}
                          {audit.audit_data.total_reviews > 0 && (
                            <Box
                              mt={4}
                              p={3}
                              bg="orange.50"
                              borderRadius="md"
                              borderLeft="4px solid"
                              borderColor="orange.500"
                            >
                              <HStack spacing={2}>
                                <Icon as={Shield} size={16} color="orange.500" />
                                <Text fontSize="sm" fontWeight="medium">
                                  Review Verification Status
                                </Text>
                              </HStack>
                              <Text fontSize="sm" color="gray.600" mt={1}>
                                {audit.audit_data.verified_reviews} of {audit.audit_data.total_reviews} reviews are
                                verified.
                                {audit.audit_data.verified_reviews === 0 &&
                                  " Consider requesting verification to increase credibility."}
                                {audit.audit_data.verified_reviews > 0 &&
                                  audit.audit_data.verified_reviews < audit.audit_data.total_reviews &&
                                  " Request verification for remaining reviews to maximize credibility."}
                              </Text>
                            </Box>
                          )}
                        </CardBody>
                      </Card>
                    )}

                    {/* Recommendations and Strengths */}
                    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                      <GridItem>
                        <Card>
                          <CardBody>
                            <Heading size="sm" mb={4} color="red.500">
                              <HStack spacing={2}>
                                <Icon as={AlertCircle} />
                                <Text>Recommendations</Text>
                              </HStack>
                            </Heading>
                            <VStack spacing={3} align="stretch">
                              {(audit?.recommendations || []).map((rec, index) => (
                                <Box
                                  key={index}
                                  p={3}
                                  bg="red.50"
                                  borderRadius="md"
                                  borderLeft="4px solid"
                                  borderColor="red.500"
                                >
                                  <Text fontSize="sm">{rec}</Text>
                                </Box>
                              ))}
                              {(!audit?.recommendations || audit.recommendations.length === 0) && (
                                <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                                  No recommendations - your profile looks great!
                                </Text>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      </GridItem>
                      <GridItem>
                        <Card>
                          <CardBody>
                            <Heading size="sm" mb={4} color="green.500">
                              <HStack spacing={2}>
                                <Icon as={CheckCircle} />
                                <Text>Strengths</Text>
                              </HStack>
                            </Heading>
                            <VStack spacing={3} align="stretch">
                              {(audit?.strengths || []).map((strength, index) => (
                                <Box
                                  key={index}
                                  p={3}
                                  bg="green.50"
                                  borderRadius="md"
                                  borderLeft="4px solid"
                                  borderColor="green.500"
                                >
                                  <Text fontSize="sm">{strength}</Text>
                                </Box>
                              ))}
                              {(!audit?.strengths || audit.strengths.length === 0) && (
                                <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                                  Complete your profile to see strengths
                                </Text>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      </GridItem>
                    </Grid>
                  </>
                )}

                {!audit && (
                  <Card>
                    <CardBody textAlign="center" py={12}>
                      <Icon as={BarChart3} size={48} color="gray.400" mb={4} />
                      <Heading size="md" color="gray.600" mb={2}>
                        No Audit Available
                      </Heading>
                      <Text color="gray.500" mb={6}>
                        Run your first profile audit to get personalized recommendations
                      </Text>
                      <Button
                        leftIcon={<RefreshCw size={16} />}
                        colorScheme="blue"
                        onClick={runProfileAudit}
                        isLoading={auditLoading}
                        loadingText="Analyzing..."
                      >
                        Run Profile Audit
                      </Button>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>

            {/* Visitor Analytics Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Visitor Analytics</Heading>

                {/* Referrer Sources */}
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Traffic Sources
                    </Heading>
                    <Box h="300px">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={referrerData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3182CE" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardBody>
                </Card>

                {/* Recent Sessions */}
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Recent Visitor Sessions
                    </Heading>
                    <VStack spacing={3} align="stretch">
                      {analyticsData?.sessions.slice(0, 10).map((session) => (
                        <Box
                          key={session.id}
                          p={4}
                          bg={bgColor}
                          borderRadius="md"
                          border="1px solid"
                          borderColor={borderColor}
                        >
                          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                            <GridItem>
                              <Text fontSize="sm" color="gray.600">
                                Location
                              </Text>
                              <Text fontWeight="medium">
                                {session.city && session.country
                                  ? `${session.city}, ${session.country}`
                                  : session.country || "Unknown"}
                              </Text>
                            </GridItem>
                            <GridItem>
                              <Text fontSize="sm" color="gray.600">
                                Device
                              </Text>
                              <Text fontWeight="medium">{session.device_type || "Unknown"}</Text>
                            </GridItem>
                            <GridItem>
                              <Text fontSize="sm" color="gray.600">
                                Duration
                              </Text>
                              <Text fontWeight="medium">{Math.round(session.total_time / 60)} min</Text>
                            </GridItem>
                            <GridItem>
                              <Text fontSize="sm" color="gray.600">
                                Time
                              </Text>
                              <Text fontWeight="medium">{new Date(session.session_start).toLocaleDateString()}</Text>
                            </GridItem>
                          </Grid>
                        </Box>
                      ))}
                      {(!analyticsData?.sessions || analyticsData.sessions.length === 0) && (
                        <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
                          No visitor sessions recorded yet
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Geographic Data Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="md" mb={2}>
                    <HStack spacing={2}>
                      <Icon as={MapPin} color="blue.500" />
                      <Text>Geographic Analytics</Text>
                    </HStack>
                  </Heading>
                  <Text color="gray.600">See where your visitors are coming from around the world</Text>
                </Box>

                {/* Country Distribution Chart */}
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Visitors by Country
                    </Heading>
                    <Box h="400px">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={countryData.slice(0, 10)} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3182CE" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardBody>
                </Card>

                {/* Detailed Location Table */}
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Detailed Location Breakdown
                    </Heading>
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Location</Th>
                            <Th isNumeric>Visitors</Th>
                            <Th isNumeric>Percentage</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {locationData.slice(0, 15).map((location, index) => {
                            const total = locationData.reduce((sum, item) => sum + item.value, 0)
                            const percentage = total > 0 ? ((location.value / total) * 100).toFixed(1) : "0"
                            return (
                              <Tr key={index}>
                                <Td>
                                  <HStack spacing={2}>
                                    <Icon as={MapPin} size={14} color="gray.400" />
                                    <Text>{location.name}</Text>
                                  </HStack>
                                </Td>
                                <Td isNumeric>
                                  <Badge colorScheme="blue" variant="subtle">
                                    {location.value}
                                  </Badge>
                                </Td>
                                <Td isNumeric>{percentage}%</Td>
                              </Tr>
                            )
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                    {locationData.length === 0 && (
                      <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
                        No location data available yet. Location data will appear as visitors access your profile.
                      </Text>
                    )}
                  </CardBody>
                </Card>

                {/* Location Insights */}
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Location Data</AlertTitle>
                    <AlertDescription>
                      Location information is automatically detected from visitor IP addresses. This helps you
                      understand your geographic reach and can inform recruitment strategies.
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            </TabPanel>

            {/* SEO Schema Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="md" mb={2}>
                    SEO Schema Markup
                  </Heading>
                  <Text color="gray.600">
                    This structured data helps search engines understand your profile better and can improve your search
                    visibility.
                  </Text>
                </Box>

                <Card>
                  <CardBody>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="sm">JSON-LD Schema</Heading>
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(schema)
                          toast({
                            title: "Copied to clipboard",
                            status: "success",
                            duration: 2000,
                          })
                        }}
                      >
                        Copy Schema
                      </Button>
                    </HStack>
                    <Box maxH="400px" overflowY="auto">
                      <Code as="pre" p={4} fontSize="sm" whiteSpace="pre-wrap" w="full">
                        {schema}
                      </Code>
                    </Box>
                  </CardBody>
                </Card>

                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>How to use this schema</AlertTitle>
                    <AlertDescription>
                      This schema is automatically included in your public profile page. You can also copy it and add it
                      to other websites or platforms where you want to improve your search presence.
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  )
}
