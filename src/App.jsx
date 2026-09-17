import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CalendarDays,
  Check,
  ChevronRight,
  Coffee,
  Heart,
  IceCreamBowl,
  LockKeyhole,
  MoonStar,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import FloatingHearts from './components/FloatingHearts.jsx';
import ProgressDots from './components/ProgressDots.jsx';
import { lookupCedula } from './services/cedulas.js';

const plans = [
  { id: 'cafe', label: 'Café bonito', caption: 'Algo tranquilo para conversar', icon: Coffee },
  { id: 'cena', label: 'Cena', caption: 'Una noche más especial', icon: UtensilsCrossed },
  { id: 'helado', label: 'Helado', caption: 'Simple, dulce y sin presión', icon: IceCreamBowl },
  { id: 'paseo', label: 'Paseo', caption: 'Caminar, hablar y ver qué pasa', icon: MoonStar },
];

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

export default function App() {
  const [step, setStep] = useState(1);
  const [cedula, setCedula] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationBlocked, setValidationBlocked] = useState(false);
  const [date, setDate] = useState('');
  const [plan, setPlan] = useState('');

  const selectedPlan = useMemo(
    () => plans.find((item) => item.id === plan),
    [plan],
  );

  async function handleAccess(event) {
    event.preventDefault();
    setError('');
    setValidationBlocked(false);
    setLoading(true);

    try {
      const result = await lookupCedula(cedula);
      setName(result.firstName);

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

  function finishPlan() {
    if (!date || !plan) return;
    celebrate();
    setStep(4);
  }

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
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="1 2345 6789"
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

              <p className="privacy" id="privacy-note">La cédula se usa únicamente para consultar esta invitación y no se guarda en la página.</p>
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
                <button className="ghost-btn" onClick={() => setError('Está bien 💗 La invitación seguirá aquí si cambias de opinión.')}>Quiero pensarlo</button>
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
                <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
                      onClick={() => setPlan(item.id)}
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

              <p className="signature">Con cariño, alguien que tenía ganas de preguntarte esto. ♥</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <p className="footer-copy">Una invitación sin presión, solo con intención bonita ♥</p>
    </main>
  );
}
