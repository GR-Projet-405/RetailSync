import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { AppRoutes } from './routes/AppRoutes';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();


function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <AppRoutes />
          </QueryClientProvider>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;