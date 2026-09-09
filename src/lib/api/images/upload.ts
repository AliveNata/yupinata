import { supabase } from '../../supabase';
import { type Image, type ImageSection, SECTION_LIMITS } from './types';

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

export async function uploadImage(file: File, section: ImageSection, description: string) {
  try {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      throw new Error('Only JPEG, PNG, GIF and WebP images are allowed');
    }

    // Check section limits
    if (section !== 'gallery') {
      const { data: existingImages } = await supabase
        .from('images')
        .select('id')
        .eq('section', section);

      const limit = SECTION_LIMITS[section];
      if (existingImages && existingImages.length >= limit) {
        throw new Error(`Maximum ${limit} images allowed for ${section} section`);
      }
    }

    // Create safe filename with section prefix
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const filename = `${section}/${sanitizeFilename(`${timestamp}-${file.name}`)}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filename, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filename);

    // Create image record
    const { data, error: insertError } = await supabase
      .from('images')
      .insert({
        section,
        path: publicUrl,
        description
      })
      .select()
      .single();

    if (insertError) {
      // Clean up uploaded file if record creation fails
      await supabase.storage
        .from('images')
        .remove([filename])
        .catch(console.error);
      
      throw insertError;
    }

    return data;
  } catch (error: any) {
    // Enhance error message for user feedback
    if (error.message.includes('storage/object-not-found')) {
      throw new Error('Failed to upload image. Please try again.');
    }
    if (error.message.includes('row-level-security')) {
      throw new Error('You do not have permission to upload images.');
    }
    throw error;
  }
}