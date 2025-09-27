import { useEffect, useMemo, useRef, useState } from 'react';
import { useAstroChat } from '../hooks/useAstroChat';

// Renderizador "inteligente" que muestra JSON de forma amigable (listas/tabla) sin llaves
function SmartContent({ raw }: { raw: string }) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }

  if (parsed === undefined) {
    return <div className="whitespace-pre-wrap leading-relaxed">{raw}</div>;
  }

  return (
    <div className="space-y-2">
      <RenderValue value={parsed} depth={0} />
    </div>
  );
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function RenderValue({ value, depth }: { value: unknown; depth: number }) {
  const maxRows = 50;
  const maxDepth = 3;
  if (value === null || value === undefined) {
    return <span className="text-gray-500">—</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <div className="text-gray-600">Sin datos</div>;
    const allObjects = value.every((x) => isPlainObject(x));
    if (allObjects) {
      const rows = value as Array<Record<string, unknown>>;
      const keys = Array.from(
        rows.reduce((set, r) => {
          Object.keys(r).forEach((k) => set.add(k));
          return set;
        }, new Set<string>())
      );
      const limited = rows.slice(0, maxRows);
      return (
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100/80">
                {keys.map((k) => (
                  <th key={k} className="text-left font-semibold text-gray-700 px-2 py-1 border border-gray-200">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {limited.map((row, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  {keys.map((k) => (
                    <td key={k} className="align-top text-gray-800 px-2 py-1 border border-gray-200">
                      <RenderValue value={(row as Record<string, unknown>)[k]} depth={depth + 1} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > maxRows && (
            <div className="text-xs text-gray-600 mt-1">Mostrando {maxRows} de {rows.length} filas…</div>
          )}
        </div>
      );
    }
    // Lista de primitivos
    const limited = value.slice(0, maxRows);
    return (
      <div>
        <ul className="list-disc pl-5 space-y-1">
          {limited.map((item, idx) => (
            <li key={idx} className="text-gray-800">
              <RenderValue value={item} depth={depth + 1} />
            </li>
          ))}
        </ul>
        {value.length > maxRows && (
          <div className="text-xs text-gray-600 mt-1">Mostrando {maxRows} de {value.length} ítems…</div>
        )}
      </div>
    );
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div className="space-y-1">
        {entries.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[auto,1fr] gap-2">
            <div className="text-gray-600 font-medium text-sm">{k}:</div>
            <div className="text-gray-900">
              {depth >= maxDepth && (isPlainObject(v) || Array.isArray(v)) ? (
                <span className="text-gray-500">(contenido anidado)</span>
              ) : (
                <RenderValue value={v} depth={depth + 1} />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
  // Primitivos
  if (typeof value === 'string') {
    return <span className="whitespace-pre-wrap">{value}</span>;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className="px-1 py-0.5 rounded bg-gray-100 text-gray-800">{String(value)}</span>;
  }
  return <span className="whitespace-pre-wrap">{String(value)}</span>;
}

// Página limpia y mínima del chat Astro
export default function AstroChatPage() {
  const { messages, loading, send, clear } = useAstroChat();
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'Resumen de ventas del día',
    'Órdenes pendientes por estado',
    'Top 5 productos más vendidos este mes',
  ];

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, loading]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const onSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canSend) return;
    const v = input.trim();
    send(v);
    setInput('');
  };

  const sendSuggestion = (s: string) => {
    if (loading) return;
    send(s);
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* noop */ }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#3b0b0b] via-[#5d1010] to-[#0f0a0a] p-4 md:p-6"> 
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">Astra — Asistente IA</h1>
            <p className="text-white/70 text-sm">Respuestas claras y accionables para decisiones rápidas.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => copy(messages.map(m => `${m.role === 'user' ? 'Yo' : 'Astra'}: ${m.content}`).join('\n\n'))}
              className="text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >Copiar conversación</button>
          </div>
        </div>

        {/* Sugerencias */}
        <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
            <button
              key={s}
              disabled={loading}
              onClick={() => sendSuggestion(s)}
              className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >{s}</button>
          ))}
        </div>

        {/* Chat */}
        <div className="rounded-xl bg-white/10 border border-white/10 backdrop-blur-md min-h-[60vh] flex flex-col">
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="h-full grid place-items-center text-white/70 text-sm">
                Empieza a conversar con Astro.
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-red-600 text-white' : 'bg-white text-gray-900'}`}>
                  {m.role === 'astro' ? (
                    <SmartContent raw={String(m.content ?? '')} />
                  ) : (
                    <div className="whitespace-pre-wrap">{String(m.content ?? '')}</div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-white/80 text-sm">Astra está procesando tu consulta…</div>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={onSubmit} className="border-t border-white/10 p-3 flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="Escribe tu consulta para Astra y presiona Enter"
              className="flex-1 resize-none rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 px-3 py-2 outline-none focus:ring-2 focus:ring-red-400/30"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!canSend}
                className="rounded-lg px-4 py-2 bg-red-600 text-white disabled:opacity-50"
              >Enviar</button>
              <button
                type="button"
                onClick={clear}
                className="rounded-lg px-3 py-2 bg-white/10 text-white border border-white/20 hover:bg-white/20"
              >Limpiar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
