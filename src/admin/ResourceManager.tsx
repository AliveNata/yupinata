import { useEffect, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut, uploadFile } from './api'

export type FieldKind = 'text' | 'textarea' | 'number' | 'image' | 'audio' | 'json'
export type Field = { key: string; label: string; kind: FieldKind; required?: boolean }
export type ResourceConfig = {
  endpoint: string          // e.g. '/api/sections'
  title: string
  fields: Field[]
  columns: string[]         // field keys shown in the list table
}

type Row = Record<string, any>

const empty = (fields: Field[]): Row => {
  const r: Row = {}
  for (const f of fields) r[f.key] = f.kind === 'number' ? 0 : ''
  return r
}

export default function ResourceManager({ config }: { config: ResourceConfig }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Row | null>(null)

  const load = () => {
    setLoading(true)
    apiGet(config.endpoint)
      .then((d) => setRows(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [config.endpoint])

  const remove = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try { await apiDelete(`${config.endpoint}/${id}`); load() }
    catch (e: any) { alert(e.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{config.title}</h2>
        <button onClick={() => setEditing(empty(config.fields))} className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm">+ New</button>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading ? <p className="text-neutral-400">Loading...</p> : (
        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left">
              <tr>{config.columns.map((c) => <th key={c} className="px-3 py-2 font-medium">{c}</th>)}<th className="px-3 py-2 w-px" /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-100">
                  {config.columns.map((c) => <td key={c} className="px-3 py-2 max-w-xs truncate align-top">{renderCell(r[c])}</td>)}
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <button onClick={() => setEditing(r)} className="text-pink-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => remove(r.id)} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={config.columns.length + 1} className="px-3 py-6 text-center text-neutral-400">No items yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && <EditModal config={config} row={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
    </div>
  )
}

function renderCell(v: any) {
  if (v == null) return <span className="text-neutral-300">-</span>
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  if (/^\/(media|uploads)\/.+\.(png|jpe?g|gif|webp|svg)$/i.test(s)) return <img src={s} alt="" className="h-10 w-10 object-cover rounded" />
  return s
}

function EditModal({ config, row, onClose, onSaved }: { config: ResourceConfig; row: Row; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Row>(row)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isNew = !row.id

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload: Row = {}
      for (const f of config.fields) {
        let v = form[f.key]
        if (f.kind === 'number') v = Number(v) || 0
        if (f.kind === 'json') v = v && String(v).trim() ? JSON.parse(v) : null
        payload[f.key] = v
      }
      if (isNew) await apiPost(config.endpoint, payload)
      else await apiPut(`${config.endpoint}/${row.id}`, payload)
      onSaved()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-lg font-semibold mb-4">{isNew ? 'New' : 'Edit'} {config.title.replace(/s$/, '')}</h3>
        {config.fields.map((f) => (
          <FieldInput key={f.key} field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />
        ))}
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-neutral-200">Cancel</button>
          <button disabled={saving} className="px-4 py-2 rounded-lg text-sm bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}

function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  const [uploading, setUploading] = useState(false)
  const val = value == null ? '' : typeof value === 'object' ? JSON.stringify(value, null, 2) : value
  const base = 'w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-3'

  const doUpload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try { onChange(await uploadFile(file)) } catch (e: any) { alert(e.message) } finally { setUploading(false) }
  }

  return (
    <label className="block mb-1">
      <span className="text-sm font-medium text-neutral-700">{field.label}</span>
      {field.kind === 'textarea' || field.kind === 'json' ? (
        <textarea value={val} required={field.required} onChange={(e) => onChange(e.target.value)} rows={field.kind === 'json' ? 5 : 4} className={`${base} font-mono`} />
      ) : field.kind === 'image' || field.kind === 'audio' ? (
        <div>
          <input value={val} required={field.required} onChange={(e) => onChange(e.target.value)} placeholder="/media/... or /uploads/..." className={base} />
          <div className="flex items-center gap-3 -mt-2 mb-3">
            <input type="file" accept={field.kind === 'image' ? 'image/*' : 'audio/*'} onChange={(e) => doUpload(e.target.files?.[0])} className="text-xs" />
            {uploading && <span className="text-xs text-neutral-400">uploading...</span>}
          </div>
          {field.kind === 'image' && val && <img src={val} alt="" className="h-20 rounded mb-3 border border-neutral-100" />}
          {field.kind === 'audio' && val && <audio src={val} controls className="mb-3 w-full" />}
        </div>
      ) : (
        <input type={field.kind === 'number' ? 'number' : 'text'} value={val} required={field.required} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
    </label>
  )
}
