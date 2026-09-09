import { supabase } from '../supabase';

export interface Profile {
  birth: string;
  profession: string;
  badside: string;
}

export interface Section {
  id: string;
  name: string;
  title: string;
  content: string;
  profiles?: {
    nata: Profile;
    yupi: Profile;
  };
}

export async function getSections() {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .order('created_at');

  if (error) throw error;
  return data;
}

export async function getSection(name: string) {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('name', name)
    .single();

  if (error) throw error;
  return data;
}

export async function updateSection(id: string, section: Partial<Section>) {
  const { data, error } = await supabase
    .from('sections')
    .update(section)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSection(id: string) {
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createSection(section: Omit<Section, 'id'>) {
  const { data, error } = await supabase
    .from('sections')
    .insert(section)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function initializeSections() {
  const { data: existingSections, error } = await supabase
    .from('sections')
    .select('name');

  if (error) throw error;

  const defaultSections = [
    {
      name: 'who-we-are',
      title: 'WHO WE ARE?',
      content: '',
      profiles: {
        nata: {
          birth: '2002-02-22',
          profession: 'Freelance',
          badside: 'Black Dragon'
        },
        yupi: {
          birth: '2002-12-27',
          profession: 'Freelance',
          badside: '69 Hoover'
        }
      }
    },
    {
      name: 'hero',
      title: 'Welcome to Our World',
      content: 'Discover the journey of two creative souls'
    }
  ];

  const existingNames = existingSections?.map((s: any) => s.name) || [];
  const sectionsToCreate = defaultSections.filter(section => 
    !existingNames.includes(section.name)
  );

  if (sectionsToCreate.length > 0) {
    const { error: insertError } = await supabase
      .from('sections')
      .insert(sectionsToCreate);

    if (insertError) throw insertError;
  }
}