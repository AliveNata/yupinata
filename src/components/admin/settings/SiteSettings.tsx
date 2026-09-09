import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ImageUploadModal } from '../images/ImageUploadModal';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

export function SiteSettings() {
  const [siteTitle, setSiteTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [currentFavicon, setCurrentFavicon] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data: settings } = await supabase
        .from('settings')
        .select('*')
        .in('key', ['site_title', 'favicon_url']);

      if (settings) {
        const titleSetting = settings.find((s: any) => s.key === 'site_title');
        const faviconSetting = settings.find((s: any) => s.key === 'favicon_url');
        
        setSiteTitle(titleSetting?.value || '');
        setCurrentFavicon(faviconSetting?.value || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update site title
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'site_title', value: siteTitle });

      if (error) throw error;

      // Update document title immediately
      document.title = siteTitle;
      
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFaviconUpload(file: File) {
    try {
      // Validate file type
      if (!file.type.match(/^image\/(png|gif)$/)) {
        throw new Error('Only PNG and GIF files are allowed for favicon');
      }

      // Upload favicon file
      const filename = `favicon/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filename, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filename);

      // Update favicon setting
      const { error: updateError } = await supabase
        .from('settings')
        .upsert({ key: 'favicon_url', value: publicUrl });

      if (updateError) throw updateError;

      // Update favicon immediately
      const favicon = (document.querySelector("link[rel*='icon']") || document.createElement('link')) as HTMLLinkElement;
      favicon.type = file.type;
      favicon.rel = 'shortcut icon';
      favicon.href = publicUrl;
      document.head.appendChild(favicon);

      setCurrentFavicon(publicUrl);
      toast.success('Favicon updated successfully');
    } catch (error) {
      console.error('Error updating favicon:', error);
      toast.error('Failed to update favicon');
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Site Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <Input
          label="Site Title"
          value={siteTitle}
          onChange={(e) => setSiteTitle(e.target.value)}
          placeholder="Enter site title"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Favicon
          </label>
          {currentFavicon && (
            <div className="flex items-center gap-4 mb-2">
              <img
                src={currentFavicon}
                alt="Current favicon"
                className="w-8 h-8 object-contain"
              />
              <span className="text-sm text-gray-500">Current favicon</span>
            </div>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowImageUpload(true)}
          >
            Change Favicon
          </Button>
          <p className="text-sm text-gray-500">
            Supported formats: PNG, GIF
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {showImageUpload && (
        <ImageUploadModal
          isOpen={showImageUpload}
          onClose={() => setShowImageUpload(false)}
          onUpload={async (file) => {
            await handleFaviconUpload(file);
            setShowImageUpload(false);
          }}
          isUploading={false}
        />
      )}
    </div>
  );
}