import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './presentation/Layout';
import CategoriasPage from './presentation/pages/CategoriasPage';
import Home from './presentation/pages/Home';
import './App.css';
import ProductosPage from './presentation/pages/ProductosPage';
import ClientesPage from './presentation/pages/ClientesPage';

// Placeholder components (reemplaza con tus componentes reales)
const Productos = () => <ProductosPage />;
const Ordenes = () => <div className="p-4"><h1 className="text-2xl font-bold">Órdenes</h1><p>Aquí irá la gestión de órdenes</p></div>;
const Clientes = () => <ClientesPage />;
const Ventas = () => <div className="p-4"><h1 className="text-2xl font-bold">Ventas</h1><p>Aquí irá el reporte de ventas</p></div>;

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/ventas" element={<Ventas />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
