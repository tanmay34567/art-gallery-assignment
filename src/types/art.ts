export type Art = {
  id: number
  title: string | null
  place_of_origin: string | null
  artist_display: string | null
  inscriptions: string | null
  date_start: number | null
  date_end: number | null
}

export type ArtApiResponse = {
  data: Art[]
  pagination: {
    total: number
    total_pages: number
    current_page: number
    limit: number
  }
}
