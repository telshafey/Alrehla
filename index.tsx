
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import GlobalErrorBoundary from './components/shared/GlobalErrorBoundary';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Intelligent Router: Use HashRouter for the specific preview environment,
// and BrowserRouter for all other environments (like production on Vercel).
const isPreviewEnvironment = window.location.href.includes('usercontent.goog');
const Router = isPreviewEnvironment ? HashRouter : BrowserRouter;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement as HTMLElement).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <Router>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <ProductProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </ProductProvider>
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </Router>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
