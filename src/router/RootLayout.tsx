import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoGuide } from '@/components/demo-guide/DemoGuide';
export function RootLayout(): React.JSX.Element {
  return (
    <>
      <Outlet />
      <DemoGuide />
    </>
  );
}
