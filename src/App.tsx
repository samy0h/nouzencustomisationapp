import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Catalog } from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Customizer from './pages/Customizer';
import AdminProducts from './pages/AdminProducts';
import AdminProductEditor from './pages/AdminProductEditor';
import AdminSettings from './pages/AdminSettings';
import './styles/catalog.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/custom/product/:slug" element={<ProductDetail />} />
            <Route path="/custom/product/:slug/customize" element={<Customizer />} />
            <Route path="/admin" element={<AdminProducts />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/products/new" element={<AdminProductEditor />} />
            <Route path="/admin/products/:id" element={<AdminProductEditor />} />
            <Route path="*" element={<Navigate to="/catalog" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
