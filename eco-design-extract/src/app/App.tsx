import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AppProvider } from './context/AppContext';
import { router } from './routes';

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </AppProvider>
  );
}

export default App;
