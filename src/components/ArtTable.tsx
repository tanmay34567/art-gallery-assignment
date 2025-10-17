import { useEffect, useMemo, useRef, useState } from 'react'
import { DataTable, type DataTablePageEvent } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { OverlayPanel } from 'primereact/overlaypanel'
import { InputNumber } from 'primereact/inputnumber'
import { Button } from 'primereact/button'
import { fetchArtworks } from '../api/artworks'
import type { Art } from '../types/art'

export default function ArtTable() {
  const [rows, setRows] = useState<Art[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(12)
  const [totalRecords, setTotalRecords] = useState(0)

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [selectCount, setSelectCount] = useState<number>(0)

  const toastRef = useRef<Toast>(null)
  const overlayRef = useRef<OverlayPanel>(null)

  
  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      try {
        const apiPage = page + 1
        console.log('fetching page', apiPage, 'rowsPerPage', rowsPerPage)
        const res = await fetchArtworks(apiPage, rowsPerPage)
        if (cancelled) return
        setRows(res.rows)
        setTotalRecords(res.total)
        try {
          
        } catch {}
      } catch (err) {
        console.error(err)
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch artworks.',
        })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [page, rowsPerPage])

  
  const pageSelection = useMemo(
    () => rows.filter((r) => selectedIds.has(r.id)),
    [rows, selectedIds]
  )

  function onSelectionChange(e: { value: Art[] }) {
    const next = new Set(selectedIds)
    for (const r of rows) next.delete(r.id)
    for (const r of e.value) next.add(r.id)
    setSelectedIds(next)
  }

  function onPageChange(e: DataTablePageEvent) {
    setPage(e.page ?? 0)
    if (e.rows && e.rows !== rowsPerPage) setRowsPerPage(e.rows)
  }


  async function selectFirstN(n: number) {
    if (n <= 0) return
    const next = new Set<number>()
    let fetched = 0
    let currentPage = 1
    const perPage = rowsPerPage

    while (fetched < n && (currentPage - 1) * perPage < totalRecords) {
      try {
        const res = await fetchArtworks(currentPage, perPage)
        for (const art of res.rows) {
          if (fetched < n) {
            next.add(art.id)
            fetched++
          } else break
        }
      } catch (err) {
        console.error(err)
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch artworks for selection.',
        })
        break
      }
      currentPage++
    }

    setSelectedIds(next)
    overlayRef.current?.hide()
  }

  return (
    <div>
      <Toast ref={toastRef} />

      <DataTable
        value={rows}
        dataKey="id"
        paginator
        lazy
        rows={rowsPerPage}
        totalRecords={totalRecords}
        first={page * rowsPerPage}
        onPage={onPageChange}
        loading={loading}
        selectionMode="checkbox"
        selection={pageSelection}
        onSelectionChange={onSelectionChange}
        scrollable
      >
        <Column selectionMode="multiple" />
        <Column
          header={() => (
            <i
              className="pi pi-chevron-down"
              onClick={(e) => overlayRef.current?.toggle(e)}
            />
          )}
        />

        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist Display" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column
          field="date_start"
          header="Date Start"
        />
        <Column
          field="date_end"
          header="Date End"
        />
      </DataTable>
      
      <OverlayPanel ref={overlayRef} showCloseIcon={false} className="select-overlay">
        <div className="select-overlay-content">
          <InputNumber
            placeholder="Select rows..."
            value={selectCount}
            onValueChange={(e) => setSelectCount(e.value ?? 0)}
            min={0}
            max={totalRecords}
          />
          <Button
            label="submit"
            onClick={() => selectFirstN(selectCount)}
            disabled={selectCount <= 0}
            className="p-button-sm"
          />
        </div>
      </OverlayPanel>
    </div>
  )
}
