import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { router } from '@/router';

function App(): React.JSX.Element {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
