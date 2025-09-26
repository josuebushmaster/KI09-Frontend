import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ErrorBoundary, NotFoundPage } from './presentation/core';
import { CategoriasPage, CategoriasCreatePage, CategoriasEditPage } from './presentation/modules/categorias';
import Home from './presentation/pages/home/index';
import './App.css';
import { ProductosPage, ProductoCreatePage, ProductoEditPage } from './presentation/modules/producto';
import { ClientesPage, ClienteCreatePage, ClienteEditPage } from './presentation/modules/clientes';
import { OrdenesPage, OrdenCreatePage, OrdenEditPage } from './presentation/modules/ordenes';

// Placeholder components (reemplaza con tus componentes reales)
const Productos = () => <ProductosPage />;
const Clientes = () => <ClientesPage />;
const Ventas = () => <div className="p-4"><h1 className="text-2xl font-bold">Ventas</h1><p>Aquí irá el reporte de ventas</p></div>;

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
            <Route path="/ventas" element={<Ventas />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </Layout>
    </Router>
  );
}

export default App;
