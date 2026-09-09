import React from 'react';
import { Layout } from '../../components/admin/Layout';
import { AccountSettings } from '../../components/admin/settings/AccountSettings';
import { SectionOrder } from '../../components/admin/settings/SectionOrder';
import { SiteSettings } from '../../components/admin/settings/SiteSettings';

export function Settings() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
        
        <SiteSettings />
        <AccountSettings />
        <SectionOrder />
      </div>
    </Layout>
  );
}