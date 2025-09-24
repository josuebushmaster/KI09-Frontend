import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
  <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link to="/" className="hover:text-blue-200">KI09</Link>
        </div>
        <div className="flex space-x-4">
          <Link to="/" className="hover:underline">Inicio</Link>
          <Link to="/categorias" className="hover:underline">Categorías</Link>
          <Link to="/productos" className="hover:underline">Productos</Link>
          <Link to="/ordenes" className="hover:underline">Órdenes</Link>
          <Link to="/clientes" className="hover:underline">Clientes</Link>
          <Link to="/ventas" className="hover:underline">Ventas</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;