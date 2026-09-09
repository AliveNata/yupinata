import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react'
import { apiDelete, apiGet, apiPost, apiPut, uploadFile } from './api'

export type FieldKind = 'text' | 'textarea' | 'number' | 'image' | 'audio' | 'json'
export type Field = { key: string; label: string; kind: FieldKind; required?: boolean }
export type ResourceConfig = {
  endpoint: string          // e.g. '/api/sections'
  title: string
  newLabel: string          // singular noun for buttons ("section")
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
      .then((d) => { setRows(d); setError('') })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [config.endpoint])

  const remove = async (row: Row) => {
    if (!confirm(`Delete "${row.title || row.name || row.description || 'this item'}"?`)) return
    try { await apiDelete(`${config.endpoint}/${row.id}`); load() }
    catch (e: any) { alert(e.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{config.title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{rows.length} item</p>
        </div>
        <button onClick={() => setEditing(empty(config.fields))} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-sky hover:bg-sky-dark text-white transition-all">
          <Plus size={20} /> New {config.newLabel}
        </button>
      </div>

      {error && <p className="text-pink-accent text-sm mb-4">{error}</p>}
      {loading ? <p className="text-gray-500 text-sm">Loading...</p> : (
        <div className="border border-pink-soft rounded-xl overflow-x-auto bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pink-soft/40 border-b border-pink-soft text-left">
                {config.columns.map((c) => <th key={c} className="px-4 py-3 font-medium text-gray-600 capitalize">{c.replace(/_/g, ' ')}</th>)}
                <th className="px-4 py-3 w-px" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-pink-soft/60 last:border-0 hover:bg-pink-soft/20">
                  {config.columns.map((c) => <td key={c} className="px-4 py-3 text-gray-700 align-middle max-w-[280px] truncate">{renderCell(r[c])}</td>)}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 justify-end text-gray-400">
                      <button title="Edit" onClick={() => setEditing(r)} className="p-2 rounded-lg hover:bg-sky/10 hover:text-sky transition-colors"><Pencil size={16} /></button>
                      <button title="Delete" onClick={() => remove(r)} className="p-2 rounded-lg hover:bg-pink-accent/10 hover:text-pink-accent transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-gray-400">No data yet. Click "New {config.newLabel}".</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && <EditModal config={config} row={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
    </div>
  )
}

function renderCell(v: any) {
  if (v == null || v === '') return <span className="text-gray-300">-</span>
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  if (/^\/(media|uploads)\/.+\.(png|jpe?g|gif|webp|svg)$/i.test(s)) return <img src={s} alt="" className="h-10 w-10 object-cover rounded-lg border border-pink-soft" />
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
    } catch (e: any) { setError(e.message); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4" onMouseDown={onClose}>
      <form onMouseDown={(e) => e.stopPropagation()} onSubmit={submit} className="bg-white rounded-2xl shadow-xl border border-pink-soft w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-soft">
          <h3 className="text-lg font-semibold text-gray-800">{isNew ? 'New' : 'Edit'} {config.newLabel}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-pink-accent"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {config.fields.map((f) => <FieldInput key={f.key} field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />)}
          {error && <p className="text-pink-accent text-sm">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-pink-soft">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Cancel</button>
          <button disabled={saving} className="px-4 py-2 rounded-lg font-medium bg-sky hover:bg-sky-dark text-white transition-all disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}

function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  const [uploading, setUploading] = useState(false)
  const val = value == null ? '' : typeof value === 'object' ? JSON.stringify(value, null, 2) : value
  const base = 'w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sky-light focus:border-sky outline-none transition-all text-black'

  const doUpload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try { onChange(await uploadFile(file)) } catch (e: any) { alert(e.message) } finally { setUploading(false) }
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{field.label}{field.required && <span className="text-pink-accent"> *</span>}</label>
      {field.kind === 'textarea' || field.kind === 'json' ? (
        <textarea value={val} required={field.required} onChange={(e) => onChange(e.target.value)} rows={field.kind === 'json' ? 5 : 4} className={`${base} ${field.kind === 'json' ? 'font-mono text-xs' : ''}`} />
      ) : field.kind === 'image' || field.kind === 'audio' ? (
        <div>
          <input value={val} required={field.required} onChange={(e) => onChange(e.target.value)} placeholder="/media/... or /uploads/..." className={base} />
          <div className="flex items-center gap-3 mt-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-sky/40 text-sky hover:bg-sky hover:text-white cursor-pointer transition-colors">
              <Upload size={16} /> Upload
              <input type="file" accept={field.kind === 'image' ? 'image/*' : 'audio/*'} onChange={(e) => doUpload(e.target.files?.[0])} className="hidden" />
            </label>
            {uploading && <span className="text-sm text-gray-400">uploading...</span>}
          </div>
          {field.kind === 'image' && val && <img src={val} alt="" className="h-24 rounded-lg mt-3 border border-pink-soft" />}
          {field.kind === 'audio' && val && <audio src={val} controls className="mt-3 w-full" />}
        </div>
      ) : (
        <input type={field.kind === 'number' ? 'number' : 'text'} value={val} required={field.required} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
    </div>
  )
}
