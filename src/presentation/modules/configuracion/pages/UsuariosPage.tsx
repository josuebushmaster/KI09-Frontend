import { useMemo } from 'react';

type UserRole = 'admin' | 'manager' | 'viewer';

type User = {
  id: number;
  name: string;
  email: string;
  status: 'Activo' | 'Invitado' | 'Suspendido';
  role: UserRole;
};

const SAMPLE_USERS: User[] = [
  { id: 1, name: 'Ana Martínez', email: 'ana@empresa.com', status: 'Activo', role: 'admin' },
  { id: 2, name: 'Carlos Pérez', email: 'carlos@empresa.com', status: 'Invitado', role: 'manager' },
  { id: 3, name: 'Lucía Gómez', email: 'lucia@empresa.com', status: 'Activo', role: 'viewer' },
  { id: 4, name: 'Pedro Ortiz', email: 'pedro@empresa.com', status: 'Suspendido', role: 'manager' },
];

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  manager: 'Gestor',
  viewer: 'Solo lectura',
};

export default function UsuariosPage() {
  const users = useMemo(() => SAMPLE_USERS, []);

  return (
    <div className="min-h-screen bg-slate-950/90 p-4 md:p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
          <h1 className="text-2xl font-semibold">Gestión de usuarios</h1>
          <p className="mt-2 text-sm text-slate-400">
            Administra el acceso de los miembros del equipo, asigna roles y controla el estado de cada cuenta.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Equipo actual</h2>
              <p className="text-sm text-slate-400">Ejemplo de distribución de roles y estados (reemplaza con datos reales).</p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500/90" type="button">
                Invitar usuario
              </button>
              <button className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-blue-500/40 hover:text-blue-200" type="button">
                Exportar listado
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/80">
            <table className="min-w-full divide-y divide-slate-800/80 bg-slate-950/40 text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Correo</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Rol</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-medium text-slate-100">{user.name}</td>
                    <td className="px-4 py-3 text-slate-400">{user.email}</td>
                    <td className="px-4 py-3 text-slate-300">{ROLE_LABEL[user.role]}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.status === 'Activo'
                            ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/40'
                            : user.status === 'Invitado'
                              ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/40'
                              : 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/40'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-200 hover:border-blue-500/40 hover:text-blue-200" type="button">
                          Cambiar rol
                        </button>
                        <button className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-200 hover:border-rose-500/40 hover:text-rose-200" type="button">
                          Suspender
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
