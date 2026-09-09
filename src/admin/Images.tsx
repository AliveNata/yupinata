import { useEffect, useState } from 'react'
import { Upload, Info, X, Trash2, ExternalLink, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiGet, apiPost, apiDelete, uploadFile } from './api'
import { Button, Input, Select } from './ui'

type Img = { id: string; section: string; path: string; description: string; display_order?: number }

const IMAGE_SECTIONS: Record<string, string> = {
  hero: 'Hero Image (Max 1)',
  background: 'Section Backgrounds (Max 3)',
  profile: 'Profile Photos (Max 2)',
  gallery: 'Gallery Images',
  parallax: 'Parallax Divider (Max 1)',
  intimate: 'Our Intimate Photos (Max 6)',
}
const SECTION_LIMITS: Record<string, number> = { hero: 1, background: 3, profile: 2, gallery: Infinity, parallax: 1, intimate: 6 }
const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: 'Main hero image at the top of the home page. Use a high-quality landscape image.',
  background: 'Background images for different sections. Pick images that work under overlaid text.',
  profile: 'Profile photos (Yupi / Nata). Use square images with good face visibility.',
  gallery: 'Images for the gallery section. Any aspect or orientation.',
  parallax: 'Single image for the parallax divider. Wide landscape works best.',
  intimate: 'Featured photos in the Our Intimate section. Up to 6 favorite moments.',
}
const SECTION_ORDER = ['hero', 'background', 'profile', 'gallery', 'parallax', 'intimate']

export default function Images() {
  const [images, setImages] = useState<Img[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = () => {
    setLoading(true)
    apiGet('/api/images').then((d) => { setImages(d); setError('') }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const bySection = (s: string) => images.filter((i) => i.section === s)

  const handleUpload = async (file: File, section: string, description: string) => {
    setUploading(true)
    try {
      const path = await uploadFile(file)
      await apiPost('/api/images', { section, path, description, display_order: bySection(section).length })
      setModalOpen(false); load()
    } catch (e: any) { alert(e.message) } finally { setUploading(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this image?')) return
    try { await apiDelete(`/api/images/${id}`); load() } catch (e: any) { alert(e.message) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Image Management</h1>
        <Button variant="primary" icon={Upload} onClick={() => setModalOpen(true)} disabled={uploading}>Upload Image</Button>
      </div>

      {error && <p className="text-pink-accent text-sm mb-4">{error}</p>}
      {loading ? <p className="text-gray-500 text-sm">Loading...</p> : (
        <div className="space-y-8">
          {SECTION_ORDER.map((section) => (
            <SectionGrid key={section} title={IMAGE_SECTIONS[section]} section={section} images={bySection(section)} onDelete={remove} onUpload={() => setModalOpen(true)} />
          ))}
        </div>
      )}

      {modalOpen && <UploadModal onClose={() => setModalOpen(false)} onUpload={handleUpload} uploading={uploading} />}
    </div>
  )
}

function SectionGrid({ title, section, images, onDelete, onUpload }: { title: string; section: string; images: Img[]; onDelete: (id: string) => void; onUpload: () => void }) {
  const limit = SECTION_LIMITS[section] ?? Infinity
  const description = SECTION_DESCRIPTIONS[section]
  const canUpload = images.length < limit

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-soft">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            {description && (
              <div className="group relative">
                <Info size={16} className="text-gray-400 cursor-help" />
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 bg-black text-white text-xs p-2 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">{description}</div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">{images.length} / {limit === Infinity ? '∞' : limit} images</p>
        </div>
        <Button variant="primary" icon={Upload} onClick={onUpload} disabled={!canUpload} title={!canUpload ? `Maximum ${limit} images` : undefined}>Upload</Button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg"><p className="text-gray-600">No images in this section</p></div>
      ) : section === 'gallery' ? (
        <GalleryGrid images={images} onDelete={onDelete} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((img) => <ImageCard key={img.id} image={img} onDelete={() => onDelete(img.id)} />)}
        </div>
      )}
    </div>
  )
}

function GalleryGrid({ images, onDelete }: { images: Img[]; onDelete: (id: string) => void }) {
  const [page, setPage] = useState(1)
  const PER_PAGE = 12
  const totalPages = Math.ceil(images.length / PER_PAGE)
  const start = (page - 1) * PER_PAGE
  const current = images.slice(start, start + PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {current.map((img) => <ImageCard key={img.id} image={img} onDelete={() => onDelete(img.id)} />)}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-6">
          <Button variant="secondary" icon={ChevronLeft} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-full text-sm transition-colors ${page === n ? 'bg-sky text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{n}</button>
            ))}
          </div>
          <Button variant="secondary" icon={ChevronRight} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  )
}

function ImageCard({ image, onDelete }: { image: Img; onDelete: () => void }) {
  const [err, setErr] = useState(false)
  const fallback = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" fill="#9ca3af" font-size="12" text-anchor="middle" dy=".3em">no image</text></svg>')
  return (
    <div className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
      <div className="aspect-video relative">
        <img src={err ? fallback : image.path} alt={image.description || ''} className="w-full h-full object-cover" onError={() => setErr(true)} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <a href={image.path} target="_blank" rel="noreferrer" className="p-2 text-white hover:text-sky transition-colors" title="View full size"><ExternalLink size={20} /></a>
            <button onClick={onDelete} className="p-2 text-white hover:text-pink-accent transition-colors" title="Delete"><Trash2 size={20} /></button>
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm text-gray-600 truncate">{image.description}</p>
        <p className="text-xs text-gray-400 mt-1">Section: {image.section}</p>
      </div>
    </div>
  )
}

function UploadModal({ onClose, onUpload, uploading }: { onClose: () => void; onUpload: (file: File, section: string, description: string) => void; uploading: boolean }) {
  const [file, setFile] = useState<File | null>(null)
  const [section, setSection] = useState('gallery')
  const [description, setDescription] = useState('')
  const [preview, setPreview] = useState('')

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)) }
  }
  const changeSection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const s = e.target.value
    setSection(s)
    setDescription(s === 'background' ? 'About Background' : '')
  }
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (file && description) onUpload(file, section, description) }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onMouseDown={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Upload Image</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {preview ? (
              <div className="aspect-video"><img src={preview} alt="Preview" className="w-full h-full object-cover rounded" /></div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
                <ImageIcon size={40} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to select an image</span>
                <input type="file" accept="image/*" onChange={pickFile} className="hidden" />
              </label>
            )}
          </div>

          <Select label="Section" value={section} onChange={changeSection} required>
            {Object.entries(IMAGE_SECTIONS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>

          {section === 'background' ? (
            <Select label="Background Type" value={description} onChange={(e) => setDescription(e.target.value)} required>
              <option value="">Select background type</option>
              <option value="Who We Are Background">Who We Are Background</option>
              <option value="About Background">About Background</option>
              <option value="Music Background">Music Background</option>
            </Select>
          ) : section === 'profile' ? (
            <Select label="Profile Type" value={description} onChange={(e) => setDescription(e.target.value)} required>
              <option value="">Select profile type</option>
              <option value="Yupi Profile">Yupi Profile</option>
              <option value="Nata Profile">Nata Profile</option>
            </Select>
          ) : (
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter image description" required />
          )}

          {SECTION_DESCRIPTIONS[section] && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg flex items-start gap-2">
              <Info size={16} className="mt-0.5 flex-shrink-0" /> <span>{SECTION_DESCRIPTIONS[section]}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={uploading}>Cancel</Button>
            <Button type="submit" variant="primary" icon={Upload} disabled={!file || !description || uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
