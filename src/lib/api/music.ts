import { supabase } from '../supabase';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover_url: string;
  audio_url: string;
  lyrics?: string;
  display_order: number;
  created_at: string;
}

// Add file name sanitization
function sanitizeFilename(filename: string): string {
  // Remove special characters and spaces
  const cleanName = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^-+|-+$/g, '');

  // Ensure filename is not too long
  const MAX_LENGTH = 100;
  const ext = cleanName.split('.').pop() || '';
  const name = cleanName.slice(0, -ext.length - 1);
  const truncatedName = name.slice(0, MAX_LENGTH - ext.length - 1);
  
  return `${truncatedName}.${ext}`;
}

export async function uploadSongFile(file: File, type: 'cover' | 'audio'): Promise<string> {
  try {
    // Sanitize filename
    const safeFilename = sanitizeFilename(file.name);
    const timestamp = Date.now();
    const filename = `${type}s/${timestamp}-${safeFilename}`; // Add folder prefix

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('songs')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('songs')
      .getPublicUrl(filename);

    return publicUrl;
  } catch (error: any) {
    // Enhance error message
    if (error.message.includes('storage/object-not-found')) {
      throw new Error('Failed to upload file. Please try again.');
    }
    throw error;
  }
}

export async function getSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createSong(song: Omit<Song, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('songs')
    .insert(song)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSong(id: string, song: Partial<Song>) {
  const { data, error } = await supabase
    .from('songs')
    .update(song)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSong(id: string) {
  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}