import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/admin/Layout';
import { Plus, Music as MusicIcon, Save, Trash2, Upload, AlertCircle, GripVertical } from 'lucide-react';
import { Button } from '../../components/admin/ui/Button';
import { Input } from '../../components/admin/ui/Input';
import { TextArea } from '../../components/admin/ui/TextArea';
import { type Song, getSongs, createSong, updateSong, deleteSong } from '../../lib/api/music';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

// Add file validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav'];

export function Music() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSong, setCurrentSong] = useState<Partial<Song>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [errors, setErrors] = useState<{
    cover?: string;
    audio?: string;
    title?: string;
    artist?: string;
    album?: string;
    lyrics?: string;
    general?: string;
  }>({});

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    try {
      const data = await getSongs();
      setSongs(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
    } catch (error) {
      console.error('Error loading songs:', error);
      toast.error('Failed to load songs');
    }
  }

  const validateFile = (file: File, type: 'cover' | 'audio'): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    if (type === 'cover' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, or WebP)';
    }

    if (type === 'audio' && !ALLOWED_AUDIO_TYPES.includes(file.type)) {
      return 'Please select a valid audio file (MP3 or WAV)';
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file, type);
    if (error) {
      setErrors(prev => ({ ...prev, [type]: error }));
      e.target.value = ''; // Reset input
      return;
    }

    setErrors(prev => ({ ...prev, [type]: undefined }));

    if (type === 'cover') {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setAudioFile(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!currentSong.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!currentSong.artist?.trim()) {
      newErrors.artist = 'Artist is required';
    }
    if (!currentSong.album?.trim()) {
      newErrors.album = 'Album is required';
    }
    if (!currentSong.id && !coverFile && !currentSong.cover_url) {
      newErrors.cover = 'Cover image is required';
    }
    if (!currentSong.id && !audioFile && !currentSong.audio_url) {
      newErrors.audio = 'Audio file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      let coverUrl = currentSong.cover_url;
      let audioUrl = currentSong.audio_url;

      if (coverFile) {
        const coverPath = `covers/${Date.now()}-${coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from('songs')
          .upload(coverPath, coverFile);

        if (coverError) throw new Error(`Failed to upload cover: ${coverError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from('songs')
          .getPublicUrl(coverPath);
        coverUrl = publicUrl;
      }

      if (audioFile) {
        const audioPath = `audio/${Date.now()}-${audioFile.name}`;
        const { error: audioError } = await supabase.storage
          .from('songs')
          .upload(audioPath, audioFile);

        if (audioError) throw new Error(`Failed to upload audio: ${audioError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from('songs')
          .getPublicUrl(audioPath);
        audioUrl = publicUrl;
      }

      const songData = {
        ...currentSong,
        cover_url: coverUrl,
        audio_url: audioUrl
      };

      if (currentSong.id) {
        await updateSong(currentSong.id, songData);
        toast.success('Song updated successfully');
      } else {
        await createSong(songData as Omit<Song, 'id' | 'created_at'>);
        toast.success('Song created successfully');
      }

      await loadSongs();
      handleCancel();
    } catch (error: any) {
      console.error('Error saving song:', error);
      const errorMessage = error.message || 'Failed to save song';
      setErrors({ general: errorMessage });
      
      // Show more specific error message in toast
      if (errorMessage.includes('upload')) {
        toast.error('Failed to upload file. Please check file size and format.');
      } else {
        toast.error('Failed to save song. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this song?')) return;

    try {
      await deleteSong(id);
      toast.success('Song deleted successfully');
      await loadSongs();
    } catch (error) {
      console.error('Error deleting song:', error);
      toast.error('Failed to delete song');
    }
  }

  function handleEdit(song: Song) {
    setCurrentSong(song);
    setCoverPreview(song.cover_url);
    setIsEditing(true);
  }

  function handleCancel() {
    setCurrentSong({});
    setIsEditing(false);
    setCoverFile(null);
    setAudioFile(null);
    setCoverPreview('');
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (sourceIndex === targetIndex) return;

    const newSongs = [...songs];
    const [movedSong] = newSongs.splice(sourceIndex, 1);
    newSongs.splice(targetIndex, 0, movedSong);

    // Update display order for all affected songs
    const updates = newSongs.map((song, index) => 
      supabase
        .from('songs')
        .update({ display_order: index })
        .eq('id', song.id)
    );

    try {
      await Promise.all(updates);
      toast.success('Song order updated');
      await loadSongs();
    } catch (error) {
      console.error('Error updating song order:', error);
      toast.error('Failed to update song order');
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Music Management</h1>
          {!isEditing && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsEditing(true)}
            >
              Add Song
            </Button>
          )}
        </div>

        {isEditing && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentSong.id ? 'Edit Song' : 'Add New Song'}
            </h2>

            {errors.general && (
              <div className="mb-4 p-4 bg-pink-accent/10 rounded-lg flex items-center gap-2 text-pink-accent">
                <AlertCircle size={20} />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title"
                value={currentSong.title || ''}
                onChange={(e) => setCurrentSong(prev => ({ ...prev, title: e.target.value }))}
                error={errors.title}
                required
              />
              <Input
                label="Artist"
                value={currentSong.artist || ''}
                onChange={(e) => setCurrentSong(prev => ({ ...prev, artist: e.target.value }))}
                error={errors.artist}
                required
              />
              <Input
                label="Album"
                value={currentSong.album || ''}
                onChange={(e) => setCurrentSong(prev => ({ ...prev, album: e.target.value }))}
                error={errors.album}
                required
              />

              <TextArea
                label="Lyrics"
                value={currentSong.lyrics || ''}
                onChange={(e) => setCurrentSong(prev => ({ ...prev, lyrics: e.target.value }))}
                error={errors.lyrics}
                rows={6}
                placeholder="Enter song lyrics..."
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cover Image
                </label>
                <div className="flex items-center gap-4">
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(',')}
                      onChange={(e) => handleFileChange(e, 'cover')}
                      error={errors.cover}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Supported formats: JPEG, PNG, WebP (max {MAX_FILE_SIZE / 1024 / 1024}MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Audio File
                </label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept={ALLOWED_AUDIO_TYPES.join(',')}
                    onChange={(e) => handleFileChange(e, 'audio')}
                    error={errors.audio}
                  />
                  <p className="text-sm text-gray-500">
                    Supported formats: MP3, WAV (max {MAX_FILE_SIZE / 1024 / 1024}MB)
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={Save}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Song'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {songs.map((song, index) => (
            <div
              key={song.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 cursor-move"
            >
              <GripVertical className="text-gray-400" size={20} />
              
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src={song.cover_url}
                  alt={song.album}
                  className="w-full h-full object-cover rounded"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">{song.title}</h3>
                <p className="text-sm text-gray-600">{song.artist}</p>
                <p className="text-xs text-gray-500">{song.album}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(song)}
                  icon={MusicIcon}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(song.id)}
                  icon={Trash2}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}