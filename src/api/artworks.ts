import axios from 'axios'
import type { Art, ArtApiResponse } from '../types/art'

const client = axios.create({ baseURL: 'https://api.artic.edu/api/v1' })

export async function fetchArtworks(page: number, limit = 12): Promise<{ rows: Art[]; total: number; totalPages: number; currentPage: number; limit: number }> {
  const fields = 'id,title,place_of_origin,artist_display,inscriptions,date_start,date_end'
  const res = await client.get<ArtApiResponse>(`/artworks`, { params: { page, limit, fields } })
  const { data, pagination } = res.data
  const rows: Art[] = data.map((d: any) => ({
    id: d.id,
    title: d.title ?? null,
    place_of_origin: d.place_of_origin ?? null,
    artist_display: d.artist_display ?? null,
    inscriptions: d.inscriptions ?? null,
    date_start: d.date_start ?? null,
    date_end: d.date_end ?? null,
  }))
  return { rows, total: pagination.total, totalPages: pagination.total_pages, currentPage: pagination.current_page, limit: pagination.limit }
}
