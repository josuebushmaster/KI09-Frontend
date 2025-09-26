import { Link } from 'react-router-dom';
import { useCategorias } from '../../modules/categorias/hooks/useCategorias';
import { useProductos } from '../../modules/producto/hooks/useProductos';
import { useClientes } from '../../modules/clientes/hooks/useClientes';

const Home = () => {
  const { items: categorias, loading: loadingCategorias } = useCategorias();
  const { items: productos, loading: loadingProductos } = useProductos();
  const { items: clientes, loading: loadingClientes } = useClientes();

  const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-800"></div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
  <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white rounded-3xl mx-6 lg:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span className="text-sm font-semibold uppercase tracking-wider">Sistema KI09</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                  Panel de 
                  <span className="bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent"> Control</span>
                </h1>
                <p className="text-xl text-red-200 leading-relaxed max-w-lg">
                  Gestión inteligente y ágil de productos, categorías, clientes y ventas. 
                  <strong className="text-white">Diseñado para la productividad.</strong>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/categorias" 
                  className="group inline-flex items-center justify-center gap-2 bg-white text-red-900 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  Ver Categorías
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link 
                  to="/productos" 
                  className="group inline-flex items-center justify-center gap-2 bg-red-700/20 backdrop-blur text-white border border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-red-700/30 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  Ver Productos
                </Link>
              </div>
            </div>
            
            {/* Right side illustration */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-red-700/20 to-red-800/10 rounded-3xl backdrop-blur border border-white/10 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-4 p-8">
                    <div className="w-16 h-16 bg-white/20 rounded-xl"></div>
                    <div className="w-16 h-16 bg-white/30 rounded-xl"></div>
                    <div className="w-16 h-16 bg-white/20 rounded-xl"></div>
                    <div className="w-16 h-16 bg-white/30 rounded-xl"></div>
                    <div className="w-16 h-16 bg-white/40 rounded-xl"></div>
                    <div className="w-16 h-16 bg-white/30 rounded-xl"></div>
                    <div className="w-16 h-16 bg-white/20 rounded-xl"></div>
                    <div className="w-16 h-16 bg-white/30 rounded-xl"></div>
                    <div className="w-16 h-16 bg-white/20 rounded-xl"></div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
  {/* Stats Cards */}
  <section className="relative -mt-16 z-10 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="group bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <Link to="/categorias" className="text-red-700 hover:text-red-800 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Gestionar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">Categorías</h3>
              <div className="flex items-baseline gap-2">
                {loadingCategorias ? (
                  <LoadingSpinner />
                ) : (
                  <div className="text-3xl font-black text-gray-900">{categorias.length}</div>
                )}
                <div className="text-sm text-gray-500">Total registradas</div>
              </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-red-600 to-red-700 h-2 rounded-full w-4/5"></div>
              </div>
            </div>
          </div>

          <div className="group bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              </div>
              <Link to="/productos" className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Gestionar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">Productos</h3>
              <div className="flex items-baseline gap-2">
                {loadingProductos ? (
                  <LoadingSpinner />
                ) : (
                  <div className="text-3xl font-black text-gray-900">{productos.length}</div>
                )}
                <div className="text-sm text-gray-500">En inventario</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full w-3/5"></div>
              </div>
            </div>
          </div>

          <div className="group bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
              </div>
              <Link to="/ordenes" className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Gestionar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">Órdenes</h3>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-gray-900">—</div>
                <div className="text-sm text-gray-500">Pendientes</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full w-2/5"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Summary */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-gray-200/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Resumen del Sistema</h3>
                  <p className="text-gray-600">Métricas y estadísticas en tiempo real</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Sistema activo
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Crecimiento mensual</div>
                      <div className="text-2xl font-bold text-gray-800">+24%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Clientes registrados</div>
                      {loadingClientes ? (
                        <LoadingSpinner />
                      ) : (
                        <div className="text-2xl font-bold text-gray-800">{clientes.length}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl">
                    <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.467-.22-2.121-.659-1.172-.879-1.172-2.303 0-3.182s3.07-.879 4.242 0l.879.659M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Ventas este mes</div>
                      <div className="text-2xl font-bold text-gray-800">$48,294</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Nuevas ideas</div>
                      <div className="text-2xl font-bold text-gray-800">12</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Accesos Rápidos</h4>
              <div className="space-y-3">
                <Link to="/categorias/create" className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-700/20 transition-colors group">
                  <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center text-white text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 group-hover:text-red-800 transition-colors">Nueva Categoría</div>
                    <div className="text-xs text-gray-500">Crear categoría de producto</div>
                  </div>
                </Link>
                
                <Link to="/productos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors group">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Buscar Productos</div>
                    <div className="text-xs text-gray-500">Explorar inventario</div>
                  </div>
                </Link>
                
                <Link to="/ventas" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors group">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Ver Reportes</div>
                    <div className="text-xs text-gray-500">Análisis de ventas</div>
                  </div>
                </Link>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-700 to-red-800 text-white rounded-2xl p-6 shadow-xl">
              <h4 className="text-lg font-bold mb-2">¿Necesitas ayuda?</h4>
              <p className="text-red-200 text-sm mb-4">Consulta nuestra documentación o contacta soporte técnico.</p>
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Obtener Ayuda
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
