import { NextResponse } from "next/server"

export async function GET() {
  // Return hardcoded notification types since the database table might not be set up yet
  const notificationTypes = [
    {
      id: "new_video",
      type: "new_video",
      name: "New Videos",
      description: "Get notified when new videos are uploaded",
      required_tier: "free",
      is_active: true,
    },
    {
      id: "new_photos",
      type: "new_photos",
      name: "New Photos",
      description: "Get notified when new photos are added",
      required_tier: "pro",
      is_active: true,
    },
    {
      id: "schedule_updates",
      type: "schedule_updates",
      name: "Schedule Updates",
      description: "Get notified about upcoming games and events",
      required_tier: "free",
      is_active: true,
    },
    {
      id: "new_reviews",
      type: "new_reviews",
      name: "New Reviews",
      description: "Get notified when new reviews are posted",
      required_tier: "premium",
      is_active: true,
    },
    {
      id: "new_awards",
      type: "new_awards",
      name: "New Awards",
      description: "Get notified when new awards are added",
      required_tier: "pro",
      is_active: true,
    },
  ]

  return NextResponse.json({ types: notificationTypes })
}
