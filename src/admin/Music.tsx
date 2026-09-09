import { useEffect, useState } from 'react'
import { Plus, Save, Trash2, AlertCircle, GripVertical, Pencil } from 'lucide-react'
import { apiGet, apiPost, apiPut, apiDelete, uploadFile } from './api'
import { Button, Input, TextArea } from './ui'

type Song = {
  id?: string; title?: string; artist?: string; album?: string
  cover_url?: string; audio_url?: string; lyrics?: string; display_order?: number
}

export default function Music() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [current, setCurrent] = useState<Song>({})
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState<Record<string, string>>({})

  const load = () => {
    setLoading(true)
    apiGet('/api/songs')
      .then((d) => { setSongs([...d].sort((a: Song, b: Song) => (a.display_order || 0) - (b.display_order || 0))); setError('') })
      .catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const startNew = () => { setCurrent({ display_order: songs.length }); setEditing(true); reset() }
  const startEdit = (s: Song) => { setCurrent(s); setCoverPreview(s.cover_url || ''); setEditing(true); setCoverFile(null); setAudioFile(null) }
  const reset = () => { setCoverFile(null); setAudioFile(null); setCoverPreview(''); setFormErr({}) }
  const cancel = () => { setEditing(false); setCurrent({}); reset() }

  const pickCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setCoverFile(f); setCoverPreview(URL.createObjectURL(f))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!current.title?.trim()) errs.title = 'Title is required'
    if (!current.artist?.trim()) errs.artist = 'Artist is required'
    if (!current.album?.trim()) errs.album = 'Album is required'
    if (!current.id && !coverFile && !current.cover_url) errs.cover = 'Cover image is required'
    if (!current.id && !audioFile && !current.audio_url) errs.audio = 'Audio file is required'
    setFormErr(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    try {
      const data: Song = { ...current }
      if (coverFile) data.cover_url = await uploadFile(coverFile)
      if (audioFile) data.audio_url = await uploadFile(audioFile)
      data.display_order = Number(current.display_order) || 0
      if (current.id) await apiPut(`/api/songs/${current.id}`, data)
      else await apiPost('/api/songs', data)
      cancel(); load()
    } catch (ex: any) { setFormErr({ general: ex.message }) } finally { setSaving(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this song?')) return
    try { await apiDelete(`/api/songs/${id}`); load() } catch (e: any) { alert(e.message) }
  }

  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const drop = async (target: number) => {
    if (dragIdx === null || dragIdx === target) return
    const next = [...songs]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(target, 0, moved)
    setSongs(next)
    setDragIdx(null)
    try { await Promise.all(next.map((s, i) => apiPut(`/api/songs/${s.id}`, { ...s, display_order: i }))) } catch (e: any) { alert(e.message); load() }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Music Management</h1>
        {!editing && <Button variant="primary" icon={Plus} onClick={startNew}>Add Song</Button>}
      </div>

      {error && <p className="text-pink-accent text-sm mb-4">{error}</p>}

      {editing && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-soft mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{current.id ? 'Edit Song' : 'Add New Song'}</h2>
          {formErr.general && (
            <div className="mb-4 p-4 bg-pink-accent/10 rounded-lg flex items-center gap-2 text-pink-accent"><AlertCircle size={20} /><span>{formErr.general}</span></div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <Input label="Title" value={current.title || ''} onChange={(e) => setCurrent((p) => ({ ...p, title: e.target.value }))} error={formErr.title} required />
            <Input label="Artist" value={current.artist || ''} onChange={(e) => setCurrent((p) => ({ ...p, artist: e.target.value }))} error={formErr.artist} required />
            <Input label="Album" value={current.album || ''} onChange={(e) => setCurrent((p) => ({ ...p, album: e.target.value }))} error={formErr.album} required />
            <TextArea label="Lyrics" value={current.lyrics || ''} onChange={(e) => setCurrent((p) => ({ ...p, lyrics: e.target.value }))} rows={6} placeholder="Enter song lyrics..." />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cover Image</label>
              <div className="flex items-center gap-4">
                {coverPreview && <img src={coverPreview} alt="Cover preview" className="w-24 h-24 object-cover rounded-lg border border-pink-soft" />}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={pickCover} error={formErr.cover} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Audio File</label>
              <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} error={formErr.audio} />
              {current.audio_url && !audioFile && <audio src={current.audio_url} controls className="w-full mt-2" />}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={cancel} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="primary" icon={Save} disabled={saving}>{saving ? 'Saving...' : 'Save Song'}</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500 text-sm">Loading...</p> : (
        <div className="grid gap-4">
          {songs.map((song, index) => (
            <div key={song.id} draggable onDragStart={() => setDragIdx(index)} onDragOver={(e) => e.preventDefault()} onDrop={() => drop(index)}
              className="bg-white p-4 rounded-xl shadow-sm border border-pink-soft flex items-center gap-4 cursor-move">
              <GripVertical className="text-gray-400" size={20} />
              <div className="w-16 h-16 flex-shrink-0">
                {song.cover_url && <img src={song.cover_url} alt={song.album} className="w-full h-full object-cover rounded-lg" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{song.title}</h3>
                <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                <p className="text-xs text-gray-500 truncate">{song.album}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" icon={Pencil} onClick={() => startEdit(song)}>Edit</Button>
                <Button variant="danger" icon={Trash2} onClick={() => song.id && remove(song.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {songs.length === 0 && <div className="text-center py-8 bg-gray-50 rounded-xl"><p className="text-gray-600">No songs yet. Add your first song!</p></div>}
        </div>
      )}
    </div>
  )
}
