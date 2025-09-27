import { useEffect, useMemo, useRef, useState } from 'react';
import astraLogo from '../../../../assets/astra.png';
import logoUma from '../../../../assets/logo uma.jpg';
import { useAstroChat } from '../hooks/useAstroChat';
import Toast from '../../../components/Toast';
import { sendFeedback } from '../../../../infrastructure/api/iaApi';

// Renderizador "inteligente" que muestra JSON de forma amigable (listas/tabla) sin llaves
function SmartContent({ raw }: { raw: string }) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }

  if (parsed === undefined) {
    // Si no es JSON, detectar listas por líneas que empiecen con '-' y renderizarlas como <ul>
    const lines = String(raw).split(/\r?\n/).map((l) => l.trim());
    const looksLikeList = lines.every((l) => l === '' || l.startsWith('-'));
    if (looksLikeList) {
      return (
        <div className="bg-white/5 p-2 rounded-md">
          <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-gray-100">
            {lines.filter(Boolean).map((ln, i) => (
              <li key={i}>{ln.replace(/^-\s*/, '')}</li>
            ))}
          </ul>
        </div>
      );
    }

    return <div className="whitespace-pre-wrap leading-relaxed text-sm text-gray-800">{raw}</div>;
  }

  return (
    <div className="space-y-3">
      <RenderValue value={parsed} depth={0} />
    </div>
  );
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function RenderValue({ value, depth }: { value: unknown; depth: number }) {
  const maxRows = 50;
  const maxDepth = 4;

  const translateKey = (k: string) => {
    const map: Record<string, string> = {
      result: 'Resultado',
      resumen: 'Resumen',
      recomendaciones: 'Recomendaciones',
      analysis_by_category: 'Análisis por categoría',
      missing_fields: 'Campos faltantes',
      'status': 'Estado',
    };
    if (map[k]) return map[k];
    // fallback: snake_case or camelCase to Title Case
    return k
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, (_, a, b) => `${a} ${b}`)
      .replace(/\b\w/g, (m) => m.toUpperCase());
  };

  // Fixed logical operator and type issues in the RenderValue function
  if (value === null || value === undefined) {
    return <span className="text-gray-500">—</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <div className="text-gray-600">Sin datos</div>;
    const allObjects = value.every((x: unknown) => isPlainObject(x));
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
        <div className="overflow-auto rounded-md border border-red-200 bg-red-50/30 p-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-red-50/60">
                {keys.map((k) => (
                  <th key={k} className="text-left font-semibold text-red-700 px-2 py-1 border border-red-100">{translateKey(k)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {limited.map((row, i) => (
                <tr key={i} className="odd:bg-white even:bg-red-50/40">
                  {keys.map((k) => (
                    <td key={k} className="align-top text-red-800 px-2 py-1 border border-red-100">
                      <RenderValue value={(row as Record<string, unknown>)[k]} depth={depth + 1} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > maxRows && (
            <div className="text-xs text-red-600 mt-1">Mostrando {maxRows} de {rows.length} filas…</div>
          )}
        </div>
      );
    }

    // Lista de primitivos
    const limited = value.slice(0, maxRows) as unknown[];
    return (
      <div>
        <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-red-800">
          {limited.map((item, idx) => (
            <li key={idx} className="text-red-800">
              <RenderValue value={item} depth={depth + 1} />
            </li>
          ))}
        </ul>
        {value.length > maxRows && (
          <div className="text-xs text-red-600 mt-1">Mostrando {maxRows} de {value.length} ítems…</div>
        )}
      </div>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div className="space-y-3">
        {entries.map(([k, v]) => (
          <div key={k} className="">
            <div className="text-sm font-semibold text-gray-700 mb-1">{translateKey(k)}</div>
            <div className="rounded-md bg-gray-50/80 p-2 border border-gray-100">
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
    // Detect simple list in string
    const lines = value.split(/\r?\n/).map((l) => l.trim());
    const isListLike = lines.every((l) => l === '' || l.startsWith('-') || /^\d+\./.test(l));
    if (isListLike && lines.some(Boolean)) {
      return (
        <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-gray-800">
          {lines.filter(Boolean).map((ln, i) => (
            <li key={i}>{ln.replace(/^[\d.\s-]+/, '')}</li>
          ))}
        </ul>
      );
    }

    return <div className="text-sm text-gray-800 whitespace-pre-wrap">{value}</div>;
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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'Pregúntale a Astra sobre el resumen de ventas del día',
    
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

  const copy = async (text: string, opts?: { messageId?: string; conversation?: boolean }) => {
    try {
      await navigator.clipboard.writeText(text);
      if (opts?.messageId) {
        setCopiedMessageId(opts.messageId);
        setToastMessage('Mensaje copiado');
        window.setTimeout(() => setCopiedMessageId(null), 2000);
      }
    } catch {
      // noop
    }
  };

  // persist feedback locally and send to backend
  type FeedbackEntry = { messageId?: string; type: 'useful' | 'clarify' | 'other'; message?: string; ts: number };
  const persistFeedback = (payload: { messageId?: string; type: 'useful' | 'clarify' | 'other'; message?: string }) => {
    try {
      const raw = localStorage.getItem('astra_feedback_v1');
      const arr: FeedbackEntry[] = raw ? (JSON.parse(raw) as FeedbackEntry[]) : [];
      arr.push({ ...payload, ts: Date.now() });
      localStorage.setItem('astra_feedback_v1', JSON.stringify(arr));
      // try to send to backend (fire-and-forget)
      sendFeedback({ messageId: payload.messageId, feedbackType: payload.type, message: payload.message }).catch(() => {});
    } catch {
      // ignore
    }
  };

  return (<>
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#3b0b0b] via-[#5d1010] to-[#0f0a0a] p-4 md:p-6"> 
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-4 w-full">
            <div className="flex-shrink-0">
              <img src={astraLogo} alt="Astra logo" className="h-14 w-14 sm:h-20 sm:w-20 object-cover rounded-full shadow-sm" />
            </div>
            <div className="flex-1 ml-3">
              <div className="w-full h-28 sm:h-32 md:h-40 bg-white/6 p-2 rounded-lg flex items-center justify-center overflow-hidden shadow-2xl border-2 border-white/10">
                <img
                  src={logoUma}
                  alt="Logo UMA"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Intro profesional: siempre visible */}
        <div className="rounded-lg bg-white/6 border border-white/8 p-4 text-white/90 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="text-lg font-semibold">Hola, soy Astra — tu asistente virtual</div>
              <p className="mt-1 text-sm text-white/80">Estoy aquí para ayudarte a obtener resúmenes claros, KPIs y recomendaciones accionables. Escribe tu pregunta o usa una sugerencia rápida para empezar.</p>
              {/* botón "Comenzar" removido a petición del usuario */}
            </div>
            <div className="text-sm text-white/60">¿Necesitas ayuda? Prueba: "Pregúntale a Astra sobre ventas"</div>
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
              <div key={m.id} className={`flex items-start ${m.role === 'user' ? 'justify-end' : 'justify-start'} transition-transform duration-150`}> 
                {m.role === 'astro' && (
                  <div className="mr-3">
                    <img src={astraLogo} alt="Astra" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover shadow-md ring-1 ring-white/10" />
                  </div>
                )}

                {/* Message card */}
                <div className={`max-w-[80%] ${m.role === 'user' ? 'flex items-end' : ''} transition transform duration-150 ease-in-out hover:scale-[1.01]`}> 
                  {m.role === 'astro' ? (
                    <div className="rounded-2xl bg-gradient-to-br from-red-50/40 to-white/10 text-gray-900 p-3 shadow-md border border-red-200/20 ring-1 ring-red-50/10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold text-red-600">Astra</div>
                              <div className="text-xs text-red-400">Asistente virtual</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copy(String(m.content ?? ''), { messageId: m.id })}
                            title="Copiar mensaje"
                            className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded-md"
                          >{copiedMessageId === m.id ? 'Copiado' : 'Copiar'}</button>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-800 leading-relaxed">
                        <SmartContent raw={String(m.content ?? '')} />
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-xs text-red-600">
                        <button
                          onClick={() => {
                            persistFeedback({ messageId: m.id, type: 'useful' });
                            setToastMessage('Gracias por tu feedback 👍');
                          }}
                          className="hover:underline"
                        >👍 Útil</button>
                        <button
                          onClick={() => {
                            persistFeedback({ messageId: m.id, type: 'clarify' });
                            setToastMessage('Se solicitó aclaración ✍️');
                          }}
                          className="hover:underline"
                        >✍️ Pide aclaración</button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl px-3 py-2 text-sm bg-red-600 text-white">
                      <div className="whitespace-pre-wrap">{String(m.content ?? '')}</div>
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="ml-3">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/20 text-white grid place-items-center border border-white/30 text-xs sm:text-sm">Yo</div>
                  </div>
                )}
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
    {toastMessage && <Toast message={toastMessage as string} onClose={() => setToastMessage(null)} />}
  </>);
}
