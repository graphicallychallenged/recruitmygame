export function getVideoThumbnail(url: string): string {
  // YouTube thumbnail extraction
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (youtubeMatch) {
    const videoId = youtubeMatch[1]
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  // Vimeo thumbnail extraction (basic)
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    // For now, return a placeholder. In production, you'd call Vimeo's API
    return `/placeholder.svg?height=360&width=640&text=Vimeo+Video`
  }

  // Default placeholder for other video types
  return `/placeholder.svg?height=360&width=640&text=Video+Thumbnail`
}

export function getVideoEmbedUrl(url: string): string {
  // YouTube embed URL
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (youtubeMatch) {
    const videoId = youtubeMatch[1]
    return `https://www.youtube.com/embed/${videoId}`
  }

  // Vimeo embed URL
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    const videoId = vimeoMatch[1]
    return `https://player.vimeo.com/video/${videoId}`
  }

  // Return original URL for direct video files
  return url
}

export function getVideoType(url: string): "youtube" | "vimeo" | "direct" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube"
  }
  if (url.includes("vimeo.com")) {
    return "vimeo"
  }
  return "direct"
}
