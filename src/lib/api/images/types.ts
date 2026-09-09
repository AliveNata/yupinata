export type ImageSection = 
  | 'hero'
  | 'background'
  | 'profile'
  | 'gallery'
  | 'parallax'
  | 'favicon'
  | 'intimate'; // Add new section type

export interface Image {
  id: string;
  section: ImageSection;
  path: string;
  description: string;
  display_order?: number;
}

export const IMAGE_SECTIONS = {
  hero: 'Hero Image (Max 1)',
  background: 'Section Backgrounds (Max 3)',
  profile: 'Profile Photos (Max 2)',
  gallery: 'Gallery Images',
  parallax: 'Parallax Divider (Max 1)',
  favicon: 'Site Favicon (Max 1)',
  intimate: 'Our Intimate Photos (Max 6)'
} as const;

export const SECTION_LIMITS = {
  hero: 1,
  background: 3,
  profile: 2,
  gallery: Infinity,
  parallax: 1,
  favicon: 1,
  intimate: 6
} as const;

export const SECTION_DESCRIPTIONS = {
  hero: 'Main hero image shown at the top of the home page. Choose a high-quality landscape image.',
  background: 'Background images for different sections. Select images that work well with overlaid text.',
  profile: 'Profile photos for team members. Use square images with good face visibility.',
  gallery: 'Images for the gallery section. Can include various aspects and orientations.',
  parallax: 'Single image used for the parallax divider section. Wide landscape image works best.',
  favicon: 'Website favicon shown in browser tabs. Use a simple, recognizable design.',
  intimate: 'Featured photos shown in the Our Intimate section. Select up to 6 of your favorite moments.'
} as const;