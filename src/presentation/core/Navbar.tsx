import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { listCategorias } from '../modules/categorias/services/categoriasService';
import { listClientes } from '../modules/clientes/services/clientesService';
import { listProductos } from '../modules/producto/services/productosService';
import type { Categoria, Cliente, Producto } from '../../domain/entities';
import type { ReactElement } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: ReactElement;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface NavbarProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}
const Navbar = ({ isCollapsed, setIsCollapsed }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Buscador global
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  interface SearchHit { type: 'categoria' | 'cliente' | 'producto'; id: number; nombre: string }
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const MIN_LEN = 2;

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [setIsCollapsed]);

  // Búsqueda (debounce simple)
  useEffect(() => {
    let active = true;
    if (searchQuery.trim().length < MIN_LEN) {
      setSearchResults([]);
      return; // No dispara búsqueda
    }
    setSearchLoading(true);
    const handle = setTimeout(async () => {
      try {
        const q = searchQuery.trim().toLowerCase();
        const [cats, clients, products] = await Promise.allSettled([listCategorias(), listClientes(), listProductos()]);
        if (!active) return;
        const catData: Categoria[] = cats.status === 'fulfilled' ? cats.value : [];
        const cliData: Cliente[] = clients.status === 'fulfilled' ? clients.value : [];
        const prodData: Producto[] = products.status === 'fulfilled' ? products.value : [];
        const filteredCats: SearchHit[] = catData
          .filter(c => c?.nombre?.toLowerCase().includes(q))
          .slice(0, 5)
          .map(c => ({ type: 'categoria', id: Number(c.id_categoria), nombre: c.nombre }));
        const filteredClients: SearchHit[] = cliData
          .filter(c => c?.nombre?.toLowerCase().includes(q) || c?.apellido?.toLowerCase().includes(q))
          .slice(0, 5)
          .map(c => ({ type: 'cliente', id: Number(c.id_cliente), nombre: c.apellido ? `${c.nombre} ${c.apellido}` : c.nombre }));
        const filteredProducts: SearchHit[] = prodData
          .filter(p => p?.nombre_producto?.toLowerCase().includes(q) || p?.descripcion?.toLowerCase().includes(q))
          .slice(0, 5)
          .map(p => ({ type: 'producto', id: Number(p.id_producto), nombre: p.nombre_producto || 'Sin nombre' }));
        setSearchResults([...filteredCats, ...filteredClients, ...filteredProducts]);
      } catch {
        if (active) setSearchResults([]);
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(handle); };
  }, [searchQuery]);

  const handleNavigateResult = (r: { type: 'categoria' | 'cliente' | 'producto'; id: number; nombre: string }) => {
    if (!r.id || !Number.isFinite(r.id)) return;
    let path = '';
    if (r.type === 'categoria') path = `/categorias/${r.id}/edit`;
    else if (r.type === 'cliente') path = `/clientes/${r.id}/edit`;
    else if (r.type === 'producto') path = `/productos/${r.id}/edit`;
    
    if (path) {
      navigate(path);
      setShowSearchPanel(false);
      setSearchQuery('');
    }
  };

  const navSections: NavSection[] = [
    {
      items: [
        {
          path: '/',
          label: 'Dashboard',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          ),
        },
        {
          path: '/productos',
          label: 'Productos',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          ),
        },
        {
          path: '/tienda',
          label: 'Tienda',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M5.25 7.5V6A2.25 2.25 0 0 1 7.5 3.75h9A2.25 2.25 0 0 1 18.75 6v1.5m-12 0-1.443 8.658A2.25 2.25 0 0 0 7.53 18.75h8.94a2.25 2.25 0 0 0 2.223-2.592L17.25 7.5m-6.75 3.75v5.25m3-5.25v5.25" />
            </svg>
          ),
        },
        {
          path: '/analisis',
          label: 'Analíticas',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-6 3 4 4-8 3 12" />
            </svg>
          ),
        },
        {
          path: '/categorias',
          label: 'Categorías',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
          ),
        },
        {
          path: '/ordenes',
          label: 'Órdenes',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
          ),
        },
        {
          path: '/clientes',
          label: 'Clientes',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          ),
        },
        {
          path: '/ventas',
          label: 'ventas',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
          ),
        },
        {
          path: '/astro',
          label: 'IA (Astra)',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
            </svg>
          ),
        },
        
      ],
    },
    {
      title: 'Configuración',
      items: [
        {
          path: '/configuracion',
          label: 'Sistema',
          icon: (
            <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">S</div>
          ),
        },
        {
          path: '/usuarios',
          label: 'Usuarios',
          icon: (
            <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center text-white text-xs font-bold">U</div>
          ),
        },
        {
          path: '/backup',
          label: 'Respaldos',
          icon: (
            <div className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center text-white text-xs font-bold">B</div>
          ),
        },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-white font-semibold text-lg">KI09</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 ${isMobile ? 'top-16 bottom-0' : 'top-0 bottom-0'} bg-gradient-to-b from-gray-950 via-gray-900 to-gray-900 border-r border-gray-800/80 transition-all duration-300 z-40 flex flex-col min-h-0 shadow-xl shadow-black/20 ${
        isMobile 
          ? (mobileMenuOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full')
          : (isCollapsed ? 'w-16' : 'w-64')
      }`}>
        {/* Desktop Header */}
        {!isMobile && (
          <div className="p-4 border-b border-gray-800">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition"
                  title={isCollapsed ? "Expandir menú" : "Contraer menú"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-lg">KI09</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title={isCollapsed ? "Expandir menú" : "Contraer menú"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Buscador (solo visible cuando expandido) */}
                <div className="relative group">
                  <input
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSearchPanel(true); }}
                    placeholder="Buscar categorías, clientes o productos..."
                    className="w-full rounded-lg bg-gray-800/70 border border-gray-700 px-9 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                  </span>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      title="Limpiar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                  {showSearchPanel && (searchQuery.length >= MIN_LEN) && (
                    <div className="absolute z-50 mt-2 left-0 right-0 rounded-xl border border-gray-700 bg-gray-900/95 backdrop-blur shadow-lg max-h-80 overflow-auto">
                      <div className="p-2 text-[11px] uppercase tracking-wider text-gray-500 flex items-center justify-between">
                        <span>Resultados</span>
                        {searchLoading && <span className="animate-pulse text-gray-400">Buscando…</span>}
                      </div>
                      {(!searchLoading && searchResults.length === 0) && (
                        <div className="px-4 py-6 text-center text-xs text-gray-500">Sin coincidencias</div>
                      )}
                      <ul className="divide-y divide-gray-800">
                        {searchResults.map(r => (
                          <li key={r.type + r.id}>
                            <button
                              type="button"
                              onClick={() => handleNavigateResult(r)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-800/80 focus:bg-gray-800/80 focus:outline-none group"
                            >
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                r.type === 'categoria' ? 'border-red-400/40 text-red-300 bg-red-400/10' :
                                r.type === 'cliente' ? 'border-blue-400/40 text-blue-300 bg-blue-400/10' :
                                'border-orange-400/40 text-orange-300 bg-orange-400/10'
                              }`}>
                                {r.type === 'categoria' ? '📂 Cat' : r.type === 'cliente' ? '👤 Cli' : '📦 Prod'}
                              </span>
                              <span className="text-sm text-gray-200 flex-1 truncate group-hover:text-white">{r.nombre}</span>
                              <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="p-2 text-[10px] text-gray-600 text-center">Escribe al menos {MIN_LEN} caracteres</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

  {/* Navigation */}
  {/* Fade top overlay */}
  <div className="pointer-events-none sticky top-0 h-6 bg-gradient-to-b from-gray-900 to-transparent z-10"></div>
  <nav className="flex-1 p-3 space-y-6 overflow-y-auto overscroll-contain ki09-scroll">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && !(isCollapsed && !isMobile) && (
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                        title={isCollapsed && !isMobile ? item.label : undefined}
                        className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group border ${
                          active
                            ? 'bg-blue-600/90 border-blue-400/30 text-white shadow shadow-blue-600/30'
                            : 'bg-white/0 border-transparent text-gray-300 hover:bg-white/5 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                          {item.icon}
                        </span>
                        {/* Mostrar etiqueta solo si el sidebar está expandido */}
                        {!isCollapsed && (
                          <span className="ml-3 truncate">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
  </nav>
  {/* Fade bottom overlay */}
  <div className="pointer-events-none sticky bottom-0 h-7 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>

        {/* User Profile */}
        {(!isCollapsed || isMobile) && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin</p>
                <p className="text-xs text-gray-400 truncate">admin@ki09.com</p>
              </div>
              <button className="p-1 text-gray-400 hover:text-white transition-colors" title="Opciones de usuario">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;