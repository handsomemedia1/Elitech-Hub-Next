import React from 'react';
import { getServerUser, getServerWriter } from '@/lib/auth';
import ClientLayout from './ClientLayout';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let userName = '';
  const user = await getServerUser();
  
  if (user) {
    userName = user.name || '';
  } else {
    const writer = await getServerWriter();
    if (writer) {
      userName = writer.display_name || writer.name || '';
    }
  }

  return <ClientLayout initialUserName={userName}>{children}</ClientLayout>;
}
