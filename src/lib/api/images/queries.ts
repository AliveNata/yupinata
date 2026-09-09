import { supabase } from '../../supabase';
import type { Image } from './types';

export async function getImagesBySection(): Promise<Image[]> {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function deleteImage(id: string) {
  // Get image info first
  const { data: image, error: fetchError } = await supabase
    .from('images')
    .select('path')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  try {
    // Extract filename from path
    const filename = image.path.split('/').pop();
    
    if (filename) {
      // Delete from storage
      await supabase.storage
        .from('images')
        .remove([filename]);
    }

    // Delete record
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('Error deleting image:', error);
    // Still try to delete the database record even if storage delete fails
    await supabase
      .from('images')
      .delete()
      .eq('id', id);
  }
}