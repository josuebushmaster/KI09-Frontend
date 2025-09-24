import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="py-12">
      <section className="bg-gradient-to-r from-sky-600 to-indigo-700 text-white rounded-xl p-10 shadow-lg">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">KI09 — Panel de control</h1>
            <p className="text-sky-100/90 mb-6">Gestión ágil de productos, categorías, clientes y ventas. Intuitivo, rápido y preparado para producción.</p>
            <div className="flex gap-3">
              <Link to="/categorias" className="bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded shadow">Ver Categorías</Link>
                <Link to="/productos" className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded border border-white/20">Ver Productos</Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-white/10 rounded-xl flex items-center justify-center">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-95">
                <path d="M3 7h18M3 12h18M3 17h12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-8 max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-500">Categorías</h3>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-semibold">—</div>
              <div className="text-xs text-gray-400">Total categorías</div>
            </div>
            <Link to="/categorias" className="text-indigo-600 font-medium">Ir</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-500">Productos</h3>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-semibold">—</div>
              <div className="text-xs text-gray-400">Total productos</div>
            </div>
            <Link to="/productos" className="text-indigo-600 font-medium">Ir</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-500">Órdenes</h3>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-semibold">—</div>
              <div className="text-xs text-gray-400">Órdenes recientes</div>
            </div>
            <Link to="/ordenes" className="text-indigo-600 font-medium">Ir</Link>
          </div>
        </div>
      </section>

      <section className="mt-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold">Resumen</h3>
          <p className="mt-2 text-sm text-gray-500">Próximamente: gráficos, métricas y actividad reciente.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
