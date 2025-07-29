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
        throw new Error(`Canva API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.items || []
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
