import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ErrorBoundary, NotFoundPage } from './presentation/core';
import { CategoriasPage, CategoriasCreatePage, CategoriasEditPage } from './presentation/modules/categorias';
import Home from './presentation/pages/home/index';
import './App.css';
import { ProductosPage, ProductoCreatePage, ProductoEditPage } from './presentation/modules/producto';
import { ClientesPage, ClienteCreatePage, ClienteEditPage } from './presentation/modules/clientes';
import { OrdenesPage, OrdenCreatePage, OrdenEditPage } from './presentation/modules/ordenes';
import { VentasPage } from './presentation/modules/ventas';
import AstroChatPage from './presentation/modules/ia/pages/AstroChatPage';

// Placeholder components (reemplaza con tus componentes reales)
const Productos = () => <ProductosPage />;
const Clientes = () => <ClientesPage />;
// Reemplazado por VentasPage real

function App() {
  return (
    <Router>
      <Layout>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categorias" element={<CategoriasPage />} />
            <Route path="/categorias/create" element={<CategoriasCreatePage />} />
            <Route path="/categorias/:id/edit" element={<CategoriasEditPage />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/create" element={<ProductoCreatePage />} />
            <Route path="/productos/:id/edit" element={<ProductoEditPage />} />
            <Route path="/ordenes" element={<OrdenesPage />} />
            <Route path="/ordenes/create" element={<OrdenCreatePage />} />
            <Route path="/ordenes/:id/edit" element={<OrdenEditPage />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/create" element={<ClienteCreatePage />} />
            <Route path="/clientes/:id/edit" element={<ClienteEditPage />} />
            <Route path="/ventas" element={<VentasPage />} />
            <Route path="/astro" element={<AstroChatPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </Layout>
    </Router>
  );
}

export default App;
