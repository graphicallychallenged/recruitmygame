// Utility functions for Canva integration

export interface CanvaConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  apiBase: string
}

export interface CanvaDesignRequest {
  design_type: string
  template_id?: string
  title: string
}

export interface CanvaDesignResponse {
  id: string
  title: string
  thumbnail?: {
    url: string
  }
  created_at: string
  updated_at: string
}

export class CanvaAPI {
  private config: CanvaConfig

  constructor(config: CanvaConfig) {
    this.config = config
  }

  async getDesigns(accessToken: string, designType?: string): Promise<CanvaDesignResponse[]> {
    try {
      const url = new URL(`${this.config.apiBase}/designs`)
      if (designType) {
        url.searchParams.set("design_type", designType)
      }
      url.searchParams.set("limit", "50")

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Canva API error response:", errorText)
        throw new Error(`Canva API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Canva API response:", data)

      // Handle both possible response formats
      return data.items || data.designs || []
    } catch (error) {
      console.error("Error fetching Canva designs:", error)
      throw error
    }
  }

  async createDesignFromTemplate(accessToken: string, templateId: string, title: string): Promise<CanvaDesignResponse> {
    try {
      const response = await fetch(`${this.config.apiBase}/designs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          design_type: "BusinessCard",
          template_id: templateId,
          title: title,
        }),
      })

      if (!response.ok) {
        throw new Error(`Canva API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating Canva design:", error)
      throw error
    }
  }

  async exportDesign(accessToken: string, designId: string, format: "PNG" | "PDF" = "PNG"): Promise<{ url: string }> {
    try {
      const response = await fetch(`${this.config.apiBase}/designs/${designId}/export`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: format,
          quality: "high",
        }),
      })

      if (!response.ok) {
        throw new Error(`Canva API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error exporting Canva design:", error)
      throw error
    }
  }
}

// Helper function to get Canva API instance
export function getCanvaAPI(): CanvaAPI {
  return new CanvaAPI({
    clientId: process.env.CANVA_CLIENT_ID!,
    clientSecret: process.env.CANVA_CLIENT_SECRET!,
    redirectUri: process.env.CANVA_REDIRECT_URI!,
    apiBase: "https://api.canva.com/rest/v1",
  })
}

// Generate a cryptographically secure random string for OAuth PKCE
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Generate code challenge from code verifier for OAuth PKCE
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest("SHA-256", data)
  const base64String = btoa(String.fromCharCode(...new Uint8Array(digest)))
  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// Exchange authorization code for access tokens
export async function exchangeCodeForTokens(code: string, codeVerifier: string) {
  const tokenUrl = "https://api.canva.com/rest/v1/oauth/token"

  // Determine redirect URI based on environment
  const redirectUri =
    process.env.NODE_ENV === "production"
      ? "https://recruitmygame.com/api/canva/callback"
      : "http://127.0.0.1:3000/api/canva/callback"

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.CANVA_CLIENT_ID!,
      client_secret: process.env.CANVA_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      code,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string) {
  const tokenUrl = "https://api.canva.com/rest/v1/oauth/token"

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.CANVA_CLIENT_ID!,
      client_secret: process.env.CANVA_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token refresh failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}
