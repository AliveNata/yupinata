import { useEffect, useState } from 'react'
import { Plus, Save, X, Edit2, Trash2 } from 'lucide-react'
import { apiGet, apiPost, apiPut, apiDelete } from './api'
import { Button, Input, TextArea } from './ui'

type Profile = { birth?: string; profession?: string; badside?: string }
type Section = {
  id?: string; name?: string; title?: string; content?: string; display_order?: number
  profiles?: { nata?: Profile; yupi?: Profile } | null
}

export default function Content() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Section | null>(null)
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    apiGet('/api/sections').then((d) => { setSections(d); setError('') }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const cancel = () => { setEditing(null); setCreating(false) }

  const save = async (values: Section) => {
    try {
      if (creating) await apiPost('/api/sections', values)
      else if (editing?.id) await apiPut(`/api/sections/${editing.id}`, values)
      cancel(); load()
    } catch (e: any) { alert(e.message) }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this section?')) return
    try { await apiDelete(`/api/sections/${id}`); load() } catch (e: any) { alert(e.message) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Content Management</h1>
        {!creating && !editing && <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>Add Section</Button>}
      </div>

      {error && <p className="text-pink-accent text-sm mb-4">{error}</p>}

      {creating || editing ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-soft mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{creating ? 'Create New Section' : 'Edit Section'}</h2>
          <SectionForm initial={editing || { name: '', title: '', content: '', display_order: sections.length }} onSubmit={save} onCancel={cancel} />
        </div>
      ) : loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : sections.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl"><p className="text-gray-600">No sections yet. Add your first section!</p></div>
      ) : (
        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm hover:shadow transition-shadow p-6 border border-pink-soft">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{s.name}</h3>
                  <p className="text-gray-600 mt-1">{s.title}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" icon={Edit2} onClick={() => setEditing(s)}>Edit</Button>
                  <Button variant="danger" icon={Trash2} onClick={() => s.id && remove(s.id)}>Delete</Button>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{s.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionForm({ initial, onSubmit, onCancel }: { initial: Section; onSubmit: (v: Section) => void; onCancel: () => void }) {
  const [values, setValues] = useState<Section>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setField = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }
  const setProfile = (who: 'nata' | 'yupi', key: keyof Profile, value: string) =>
    setValues((prev) => ({ ...prev, profiles: { ...prev.profiles, [who]: { ...prev.profiles?.[who], [key]: value } } }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!values.name?.trim()) errs.name = 'Name is required'
    if (!values.title?.trim()) errs.title = 'Title is required'
    setErrors(errs)
    if (Object.keys(errs).length) return
    onSubmit({ ...values, display_order: Number(values.display_order) || 0 })
  }

  const showProfiles = values.name === 'who-we-are'

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="Section Name" value={values.name || ''} onChange={(e) => setField('name', e.target.value)} error={errors.name} placeholder="e.g. hero, who-we-are" required />
      <Input label="Title" value={values.title || ''} onChange={(e) => setField('title', e.target.value)} error={errors.title} placeholder="Enter title" required />
      <TextArea label="Content" value={values.content || ''} onChange={(e) => setField('content', e.target.value)} placeholder="Enter content" rows={5} />
      <Input label="Display order" type="number" value={values.display_order ?? 0} onChange={(e) => setField('display_order', e.target.value)} />

      {showProfiles && (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-800">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Nata Goricx</h4>
              <Input label="Birth" value={values.profiles?.nata?.birth || ''} onChange={(e) => setProfile('nata', 'birth', e.target.value)} placeholder="YYYY-MM-DD" />
              <Input label="Profession" value={values.profiles?.nata?.profession || ''} onChange={(e) => setProfile('nata', 'profession', e.target.value)} />
              <Input label="Badside" value={values.profiles?.nata?.badside || ''} onChange={(e) => setProfile('nata', 'badside', e.target.value)} />
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Yupi Coklat</h4>
              <Input label="Birth" value={values.profiles?.yupi?.birth || ''} onChange={(e) => setProfile('yupi', 'birth', e.target.value)} placeholder="YYYY-MM-DD" />
              <Input label="Profession" value={values.profiles?.yupi?.profession || ''} onChange={(e) => setProfile('yupi', 'profession', e.target.value)} />
              <Input label="Badside" value={values.profiles?.yupi?.badside || ''} onChange={(e) => setProfile('yupi', 'badside', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" icon={X} onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" icon={Save}>Save</Button>
      </div>
    </form>
  )
}
