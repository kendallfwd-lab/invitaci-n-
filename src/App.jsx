import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronRight,
  Coffee,
  Download,
  Heart,
  IceCreamBowl,
  LockKeyhole,
  MoonStar,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import FloatingHearts from './components/FloatingHearts.jsx';
import ProgressDots from './components/ProgressDots.jsx';
import { lookupCedula } from './services/cedulas.js';
import { clearResponses, fetchResponses, getResponses, isAdminCedula, saveResponse } from './services/responses.js';

const plans = [
  { id: 'cafe', label: 'Café bonito', caption: 'Algo tranquilo para conversar', icon: Coffee },
  { id: 'cena', label: 'Cena', caption: 'Una noche más especial', icon: UtensilsCrossed },
  { id: 'helado', label: 'Helado', caption: 'Simple, dulce y sin presión', icon: IceCreamBowl },
  { id: 'paseo', label: 'Paseo', caption: 'Caminar, hablar y ver qué pasa', icon: MoonStar },
];

const GOOGLE_CALENDAR_URL = 'https://calendar.google.com/calendar/u/0/r?hl=es&pli=1';

const screenMotion = {
  initial: { opacity: 0, y: 28, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -24, scale: 0.985 },
  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
};

function celebrate() {
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.68 } });
  setTimeout(() => {
    confetti({ particleCount: 70, spread: 100, origin: { x: 0.25, y: 0.55 } });
    confetti({ particleCount: 70, spread: 100, origin: { x: 0.75, y: 0.55 } });
  }, 220);
}

function downloadCalendarEvent({ date, name, planLabel }) {
  const startDate = date.replaceAll('-', '');
  const nextDate = new Date(`${date}T12:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  const endDate = nextDate.toISOString().slice(0, 10).replaceAll('-', '');
  const event = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Amor Cedula//Invitacion//ES',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${planLabel} con ${name}`,
    'DESCRIPTION:Una cita bonita para conocernos mejor.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([event], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cita-invitacion.ics';
  link.click();
  URL.revokeObjectURL(url);
}

function AdminPanel() {
  const [responses, setResponses] = useState(() => getResponses());
  const [loadingResponses, setLoadingResponses] = useState(true);

  useEffect(() => {
    fetchResponses()
      .then(setResponses)
      .finally(() => setLoadingResponses(false));
  }, []);

  function removeResponses() {
    if (!window.confirm('¿Borrar todas las respuestas guardadas en este navegador?')) return;
    clearResponses();
    setResponses([]);
  }

  function exportResponses() {
    const file = new Blob([JSON.stringify(responses, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'respuestas-invitacion.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell admin-shell">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="noise" />
      <section className="admin-card">
        <div className="admin-heading">
          <div>
            <p className="eyebrow"><ShieldCheck size={15} /> Área privada</p>
            <h1>Respuestas</h1>
            <p className="lead admin-lead">Respuestas guardadas en la base de datos.</p>
          </div>
          <strong className="response-count">{responses.length}</strong>
        </div>

        <div className="admin-actions">
          <button className="ghost-btn" onClick={exportResponses} disabled={!responses.length}>
            <Download size={17} /> Exportar JSON
          </button>
          <button className="danger-btn" onClick={removeResponses} disabled={!responses.length}>Borrar todo</button>
        </div>

        {responses.length ? (
          <div className="responses-table-wrap">
            <table className="responses-table">
              <thead><tr><th>Nombre</th><th>Cédula</th><th>Fecha</th><th>Plan</th><th>Estado</th><th>Actualizada</th></tr></thead>
              <tbody>
                {responses.map((response) => (
                  <tr key={response.id}>
                    <td>{response.name}</td>
                    <td>{response.cedula}</td>
                    <td>{new Date(`${response.date}T12:00:00`).toLocaleDateString('es-CR')}</td>
                    <td>{response.planLabel}</td>
                    <td>{response.status === 'completed' ? 'Completada' : 'En progreso'}</td>
                    <td>{new Date(response.updatedAt || response.createdAt).toLocaleString('es-CR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty-state">{loadingResponses ? 'Cargando respuestas...' : 'Todavía no hay respuestas guardadas.'}</p>}

        <a className="back-link" href={window.location.pathname}>Volver a la invitación</a>
      </section>
    </main>
  );
}

export default function App() {
  const [adminMode, setAdminMode] = useState(() => new URLSearchParams(window.location.search).get('admin') === '1');
  const [step, setStep] = useState(1);
  const [cedula, setCedula] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationBlocked, setValidationBlocked] = useState(false);
  const [date, setDate] = useState('');
  const [plan, setPlan] = useState('');
  const [noButtonOffset, setNoButtonOffset] = useState({ x: 0, y: 0 });

  const selectedPlan = useMemo(
    () => plans.find((item) => item.id === plan),
    [plan],
  );

  async function handleAccess(event) {
    event.preventDefault();
    setError('');
    setValidationBlocked(false);

    if (isAdminCedula(cedula)) {
      setAdminMode(true);
      return;
    }

    setLoading(true);

    try {
      const result = await lookupCedula(cedula);
      setName(result.firstName);
      saveResponse({ cedula: cedula.replace(/\D/g, ''), name: result.firstName, status: 'consulted' });

      if (!result.isNotMoroso) {
        // No exponemos detalles tributarios en pantalla; simplemente no avanzamos.
        setValidationBlocked(true);
        return;
      }

      setStep(2);
    } catch (err) {
      setError(err?.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  function acceptInvitation() {
    celebrate();
    setStep(3);
  }

  function moveNoButton() {
    setNoButtonOffset({
      x: Math.round((Math.random() - 0.5) * 150),
      y: Math.round((Math.random() - 0.5) * 70),
    });
  }

  function finishPlan() {
    if (!date || !plan) return;
    saveResponse({ cedula: cedula.replace(/\D/g, ''), name, date, plan, planLabel: selectedPlan?.label, status: 'completed' });
    celebrate();
    setStep(4);
  }

  if (adminMode) return <AdminPanel />;

  return (
    <main className="app-shell">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="noise" />
      <FloatingHearts />

      <div className="top-pill">
        <Heart size={15} fill="currentColor" />
        <span>Hecho especialmente para ti</span>
      </div>

      <section className="experience-card">
        <ProgressDots current={step} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="access" {...screenMotion} className="screen login-screen">
              <div className="icon-orbit">
                <div className="icon-core"><LockKeyhole size={31} /></div>
                <span className="orbit-dot one" />
                <span className="orbit-dot two" />
              </div>

              <p className="eyebrow"><Sparkles size={15} /> Hay algo para ti</p>
              <h1>Una pequeña sorpresa<br /><span>empieza aquí.</span></h1>
              <p className="lead">
                Escribe tu cédula para encontrar la invitación que preparé especialmente para ti.
              </p>

              <form onSubmit={handleAccess} className="access-form">
                <label htmlFor="cedula">Cédula</label>
                <div className="input-wrap">
                  <input
                    id="cedula"
                    value={cedula}
                    onChange={(event) => setCedula(event.target.value)}
                    inputMode="text"
                    autoComplete="off"
                    placeholder="Cédula o clave administrativa"
                    aria-describedby="privacy-note"
                  />
                  <Heart size={18} />
                </div>

                <button className="primary-btn" disabled={loading || !cedula.trim()}>
                  {loading ? <span className="loader" /> : <><span>Descubrir mi sorpresa</span><ChevronRight size={19} /></>}
                </button>
              </form>

              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="status error">{error}</motion.p>}
              {validationBlocked && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="status neutral">
                  Esta invitación no puede continuar con la validación actual.
                </motion.p>
              )}

              <p className="privacy" id="privacy-note">La información se guarda para que el administrador pueda ver el avance de la invitación.</p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="invite" {...screenMotion} className="screen invite-screen">
              <div className="mini-hearts"><span>♥</span><span>♥</span><span>♥</span></div>
              <p className="eyebrow"><Sparkles size={15} /> Encontré a la persona correcta</p>
              <h1>Hola, <span>{name}</span>.</h1>
              <p className="big-question">¿Te gustaría que nos conociéramos un poquito más?</p>
              <p className="lead narrow">
                Sin grandes discursos. Solo una invitación sincera para compartir un momento bonito y ver qué sucede.
              </p>

              <div className="choice-row">
                <button className="primary-btn huge" onClick={acceptInvitation}>
                  <Heart size={20} fill="currentColor" /> Sí, me gustaría
                </button>
                <button
                  type="button"
                  className="ghost-btn dodge-btn"
                  style={{ transform: `translate(${noButtonOffset.x}px, ${noButtonOffset.y}px)` }}
                  onMouseEnter={moveNoButton}
                  onFocus={moveNoButton}
                  onTouchStart={moveNoButton}
                  onClick={moveNoButton}
                >
                  Quiero pensarlo
                </button>
              </div>
              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="status soft">{error}</motion.p>}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="plan" {...screenMotion} className="screen plan-screen">
              <p className="eyebrow"><CalendarDays size={15} /> Entonces hagámoslo especial</p>
              <h1>Perfecto, <span>{name}</span> 💗</h1>
              <p className="lead">Elige un día y el tipo de plan que más te gustaría.</p>

              <div className="date-panel">
                <label htmlFor="date">¿Qué día te queda bonito?</label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    saveResponse({ cedula: cedula.replace(/\D/g, ''), name, date: e.target.value, status: 'date-selected' });
                  }}
                />
              </div>

              <div className="plans-grid">
                {plans.map((item) => {
                  const Icon = item.icon;
                  const active = plan === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.98 }}
                      className={active ? 'plan-card selected' : 'plan-card'}
                      onClick={() => {
                        setPlan(item.id);
                        saveResponse({ cedula: cedula.replace(/\D/g, ''), name, plan: item.id, planLabel: item.label, status: 'plan-selected' });
                      }}
                    >
                      <div className="plan-icon"><Icon size={24} /></div>
                      <strong>{item.label}</strong>
                      <span>{item.caption}</span>
                      {active && <div className="selected-check"><Check size={14} /></div>}
                    </motion.button>
                  );
                })}
              </div>

              <button className="primary-btn" onClick={finishPlan} disabled={!date || !plan}>
                <span>Guardar nuestro plan</span><Heart size={18} fill="currentColor" />
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="final" {...screenMotion} className="screen final-screen">
              <motion.div
                className="final-heart"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                <Heart size={52} fill="currentColor" />
              </motion.div>
              <p className="eyebrow"><Sparkles size={15} /> Tenemos un plan</p>
              <h1>Me hace ilusión,<br /><span>{name}.</span></h1>
              <p className="lead narrow">Gracias por decir que sí. Ahora ya tenemos una excusa bonita para conocernos mejor.</p>

              <div className="summary-card">
                <div><span>Fecha</span><strong>{new Date(`${date}T12:00:00`).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></div>
                <div className="summary-divider" />
                <div><span>Plan</span><strong>{selectedPlan?.label}</strong></div>
              </div>

              <a className="calendar-btn" href={GOOGLE_CALENDAR_URL} target="_blank" rel="noreferrer">
                <CalendarPlus size={18} /> Agendar en Google Calendar
              </a>
              <button className="calendar-btn device-calendar-btn" onClick={() => downloadCalendarEvent({ date, name, planLabel: selectedPlan?.label })}>
                <Download size={18} /> Guardar en el calendario del dispositivo
              </button>

              <p className="signature">Con cariño, alguien que tenía ganas de preguntarte esto. ♥</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <p className="footer-copy">Una invitación sin presión, solo con intención bonita ♥</p>
    </main>
  );
}
