import { useState, useEffect, useMemo } from "react";

const MODES = {
  bestia: {
    id: "bestia", label: "MODO BESTIA", emoji: "🔴", color: "#ff4444", glow: "rgba(255,68,68,0.3)",
    desc: "Energía alta. Noche despejada. Sin límites.",
    tasks: [
      { id: "b1", text: "Completar 1 sección completa del curso TCM (teoría + lab juntos)", xp: 40 },
      { id: "b2", text: "2 labs de PortSwigger del tema actual del curso", xp: 30 },
      { id: "b3", text: "Documentar en Obsidian: qué aprendiste, qué falló, qué entendiste", xp: 20 },
      { id: "b4", text: "BONUS: explorar 1 técnica nueva en Burp que no hayas usado antes", xp: 10 },
    ],
  },
  crucero: {
    id: "crucero", label: "MODO CRUCERO", emoji: "🟡", color: "#f5c518", glow: "rgba(245,197,24,0.3)",
    desc: "Energía media. Avanzas igual. Sin presión.",
    tasks: [
      { id: "c1", text: "Avanzar 1 tema del curso TCM con su lab correspondiente", xp: 30 },
      { id: "c2", text: "1 lab de PortSwigger del tema actual", xp: 20 },
      { id: "c3", text: "Revisar notas de la sesión anterior en Obsidian", xp: 10 },
    ],
  },
  minimo: {
    id: "minimo", label: "MODO MÍNIMO", emoji: "🟢", color: "#44dd88", glow: "rgba(68,221,136,0.3)",
    desc: "Día complicado. La cadena no se rompe.",
    tasks: [
      { id: "m1", text: "Ver 1 video del curso TCM, aunque sea solo teoría", xp: 15 },
      { id: "m2", text: "Leer 1 writeup de web hacking (PortSwigger blog, HackTricks, lo que sea)", xp: 10 },
      { id: "m3", text: "5 minutos repasando algo que ya dominás", xp: 5 },
    ],
  },
};

const PROGRESS_PER_DAY = 2; // % que avanza el curso por día completado
const todayKey = () => new Date().toISOString().slice(0, 10);

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const h = time.getHours(), m = String(time.getMinutes()).padStart(2, "0"), s = String(time.getSeconds()).padStart(2, "0");
  const h12 = h % 12 || 12, ampm = h >= 12 ? "PM" : "AM";
  const isNight = h >= 22 || h < 5, isPeak = h >= 0 && h < 4;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: "2.8rem", fontWeight: 700, letterSpacing: "0.06em", color: isNight ? "#f5c518" : "#6a7a8a", textShadow: isNight ? "0 0 28px rgba(245,197,24,0.5)" : "none", transition: "all 0.5s", lineHeight: 1 }}>
        {h12}:{m}<span style={{ fontSize: "1.4rem", opacity: 0.5 }}>:{s}</span><span style={{ fontSize: "0.82rem", marginLeft: "0.3rem", opacity: 0.4 }}>{ampm}</span>
      </div>
      <div style={{ marginTop: "0.3rem", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: isPeak ? "#ff4444" : isNight ? "#f5c518" : "#2e3e4e", fontFamily: "'Courier New',monospace" }}>
        {isPeak ? "⚡ HORA PICO — MÁXIMO FOCO" : isNight ? "🦉 ZONA NOCTURNA ACTIVA" : "🌤 FUERA DEL BLOQUE PRINCIPAL"}
      </div>
    </div>
  );
}

function Bar({ value, color, glow, h = "7px" }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: h, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: "100%", background: color, boxShadow: `0 0 8px ${glow}`, borderRadius: 99, transition: "width 0.7s ease" }} />
    </div>
  );
}

function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear(), month = today.getMonth(), todayD = today.getDate();
  const monthName = today.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  return (
    <div style={{ background: "rgba(10,15,25,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "0.95rem 1rem", marginBottom: "1rem" }}>
      <div style={{ fontSize: "0.62rem", letterSpacing: "0.15em", color: "#3a5068", textTransform: "uppercase", marginBottom: "0.7rem", textAlign: "center" }}>{monthName}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: "0.3rem" }}>
        {days.map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: "0.56rem", color: i >= 5 ? "#253a4a" : "#1a2a38", fontWeight: 600 }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {cells.map((d, i) => {
          const isToday = d === todayD, col = i % 7, isWknd = col === 5 || col === 6;
          return (
            <div key={i} style={{ textAlign: "center", fontSize: "0.65rem", padding: "3px 0", borderRadius: 5, background: isToday ? "#f5c518" : "transparent", color: isToday ? "#000" : isWknd ? "#254560" : d ? "#2e4050" : "transparent", fontWeight: isToday ? 700 : 400, fontFamily: "'Courier New',monospace", boxShadow: isToday ? "0 0 8px rgba(245,197,24,0.5)" : "none" }}>
              {d || ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShanghaiBanner() {
  return (
    <div style={{ background: "linear-gradient(135deg,rgba(180,50,10,0.09),rgba(240,140,0,0.05))", border: "1px solid rgba(200,80,20,0.16)", borderRadius: 16, padding: "0.9rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
      <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>🏮</div>
      <div>
        <div style={{ fontSize: "0.56rem", letterSpacing: "0.17em", color: "#7a2808", textTransform: "uppercase", marginBottom: "0.15rem" }}>Recompensa final</div>
        <div style={{ fontSize: "0.82rem", color: "#b05828", fontWeight: 600 }}>Shanghái te espera.</div>
        <div style={{ fontSize: "0.66rem", color: "#401808", marginTop: "0.12rem", lineHeight: 1.4 }}>Cada día completado = un paso más cerca. Primero el PWPE.</div>
      </div>
    </div>
  );
}

function Roadmap({ tcmProgress, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(tcmProgress));

  useEffect(() => { setInputVal(String(tcmProgress)); }, [tcmProgress]);

  const handleSave = () => {
    const v = Math.min(100, Math.max(0, parseInt(inputVal) || 0));
    onEdit(v);
    setEditing(false);
  };

  const steps = [
    { label: "TCM · Practical Web Hacking", prog: tcmProgress, color: "#f5c518", current: true },
    { label: "PWPE", prog: 0, color: "#ff6b6b", current: false },
    { label: "eWPTX", prog: 0, color: "#444", current: false },
    { label: "OSWE", prog: 0, color: "#444", current: false },
  ];

  return (
    <div style={{ background: "rgba(10,15,25,0.85)", border: "1px solid rgba(255,107,107,0.1)", borderRadius: 16, padding: "0.95rem 1rem", marginBottom: "1rem" }}>
      <div style={{ fontSize: "0.58rem", letterSpacing: "0.17em", color: "#6a2a38", textTransform: "uppercase", marginBottom: "0.75rem" }}>🎯 Roadmap · Logro final</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: s.current ? s.color : "#151f2a", boxShadow: s.current ? `0 0 6px ${s.color}` : "none" }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: s.current ? "0.22rem" : 0 }}>
                <span style={{ fontSize: "0.7rem", color: s.current ? s.color : "#3a4a5a", fontWeight: s.current ? 600 : 400 }}>
                  {s.label}{s.current && <span style={{ fontSize: "0.52rem", marginLeft: "0.3rem", opacity: 0.5 }}>← ahora</span>}
                </span>
                {s.current && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    {editing ? (
                      <>
                        <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()}
                          style={{ width: "40px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(245,197,24,0.4)", borderRadius: 5, color: "#f5c518", fontSize: "0.68rem", fontFamily: "'Courier New',monospace", textAlign: "center", padding: "1px 3px", outline: "none" }} />
                        <button onClick={handleSave} style={{ background: "#f5c518", border: "none", borderRadius: 4, color: "#000", fontSize: "0.55rem", fontWeight: 700, padding: "2px 5px", cursor: "pointer" }}>OK</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: "0.68rem", color: s.color, fontFamily: "'Courier New',monospace" }}>{s.prog}%</span>
                        <button onClick={() => setEditing(true)} style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.2)", borderRadius: 4, color: "#f5c518", fontSize: "0.5rem", padding: "1px 5px", cursor: "pointer" }}>✎</button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {s.current && <Bar value={s.prog} color={s.color} glow="rgba(245,197,24,0.4)" h="4px" />}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "0.8rem", padding: "0.6rem 0.85rem", background: "rgba(255,107,107,0.05)", borderRadius: 9, border: "1px solid rgba(255,107,107,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: "0.6rem", color: "#ff6b6b", letterSpacing: "0.1em", fontWeight: 700 }}>🏆 LOGRO FINAL · PWPE CERTIFIED</div>
        <div style={{ fontSize: "0.62rem", color: "#ffb3b3", marginTop: "0.1rem" }}>~$399–499 USD · TCM Security · Web Pentesting Pro</div>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState(null);
  const [done, setDone] = useState({});
  const [xp, setXp] = useState(0);
  const [tcmProg, setTcmProg] = useState(42);
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [todayDone, setTodayDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const [p, s, td, last] = await Promise.allSettled([
          window.storage.get("owl_progress"),
          window.storage.get("owl_streak"),
          window.storage.get("owl_totaldays"),
          window.storage.get("owl_lastday"),
        ]);
        if (p.value?.value) setTcmProg(parseInt(p.value.value));
        if (s.value?.value) setStreak(parseInt(s.value.value));
        if (td.value?.value) setTotalDays(parseInt(td.value.value));
        if (last.value?.value === todayKey()) setTodayDone(true);
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const saveProgress = async (newProg) => {
    setTcmProg(newProg);
    try { await window.storage.set("owl_progress", String(newProg)); } catch (e) {}
  };

  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  const dayName = today.toLocaleDateString("es-CL", { weekday: "long" });
  const dateStr = today.toLocaleDateString("es-CL", { day: "numeric", month: "long" });

  const toggleTask = (id) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    setXp(Object.entries(next).reduce((acc, [tid, v]) => {
      if (!v) return acc;
      for (const m of Object.values(MODES)) { const t = m.tasks.find(t => t.id === tid); if (t) return acc + t.xp; }
      return acc;
    }, 0));
  };

  const cur = mode ? MODES[mode] : null;
  const tDone = cur ? cur.tasks.filter(t => done[t.id]).length : 0;
  const tTotal = cur ? cur.tasks.length : 0;
  const allDone = tTotal > 0 && tDone === tTotal;

  const handleCompleteDay = async () => {
    if (todayDone) return;
    const newProg = Math.min(100, tcmProg + PROGRESS_PER_DAY);
    const newStreak = streak + 1;
    const newTotal = totalDays + 1;
    setTcmProg(newProg);
    setStreak(newStreak);
    setTotalDays(newTotal);
    setTodayDone(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    try {
      await window.storage.set("owl_progress", String(newProg));
      await window.storage.set("owl_streak", String(newStreak));
      await window.storage.set("owl_totaldays", String(newTotal));
      await window.storage.set("owl_lastday", todayKey());
    } catch (e) {}
  };

  const stars = useMemo(() => Array.from({ length: 50 }, () => ({
    w: Math.random() > 0.8 ? 2 : 1, op: Math.random() * 0.28 + 0.06,
    top: Math.random() * 100, left: Math.random() * 100,
    dur: 2 + Math.random() * 4, delay: Math.random() * 5,
  })), []);

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#030507", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "2rem" }}>🦉</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 20% 40%,#0c1016 0%,#05080c 60%,#020304 100%)", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "#c9d4e0", padding: "1.5rem 0.85rem 3rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {stars.map((s, i) => <div key={i} style={{ position: "absolute", width: s.w, height: s.w, borderRadius: "50%", background: "#fff", opacity: s.op, top: `${s.top}%`, left: `${s.left}%`, animation: `twinkle ${s.dur}s ease-in-out infinite`, animationDelay: `${s.delay}s` }} />)}
      </div>

      <style>{`
        @keyframes twinkle{0%,100%{opacity:0.06}50%{opacity:0.45}}
        @keyframes glow{0%,100%{box-shadow:0 0 14px rgba(245,197,24,0.08)}50%{box-shadow:0 0 30px rgba(245,197,24,0.22)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.04)}100%{transform:scale(1)}}
        .tr:hover{background:rgba(255,255,255,0.04)!important}
        .mb{transition:all 0.2s}.mb:hover{transform:translateY(-2px)}.mb:active{transform:scale(0.97)}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
      `}</style>

      <div style={{ maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2.3rem", marginBottom: "0.2rem" }}>🦉</div>
          <div style={{ fontSize: "0.92rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#283848", fontWeight: 400 }}>PROTOCOLO NOCTURNO</div>
          <div style={{ marginTop: "0.22rem", fontSize: "0.6rem", color: "#141e28", letterSpacing: "0.13em" }}>
            {dayName.toUpperCase()} · {dateStr} · {isWeekend ? "📡 Ing. en Redes" : "🕸️ Web Hacking"}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "1rem" }}>
          {[
            { label: "RACHA", value: `${streak} días`, color: "#f5c518", icon: "🔥" },
            { label: "DÍAS TOTALES", value: totalDays, color: "#44dd88", icon: "✅" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "rgba(8,12,20,0.85)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 13, padding: "0.75rem 0.9rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.1rem", marginBottom: "0.15rem" }}>{stat.icon}</div>
              <div style={{ fontSize: "0.62rem", color: "#1a2a38", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.1rem" }}>{stat.label}</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: stat.color, fontFamily: "'Courier New',monospace" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Clock */}
        <div style={{ background: "rgba(6,9,16,0.92)", border: "1px solid rgba(245,197,24,0.08)", borderRadius: 16, padding: "1.25rem", marginBottom: "1rem", animation: "glow 4s ease-in-out infinite" }}>
          <Clock />
        </div>

        <MiniCalendar />
        <ShanghaiBanner />
        <Roadmap tcmProgress={tcmProg} onEdit={saveProgress} />

        {/* XP */}
        {xp > 0 && (
          <div style={{ background: "rgba(68,221,136,0.06)", border: "1px solid rgba(68,221,136,0.13)", borderRadius: 12, padding: "0.6rem 1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "fadeUp 0.4s ease" }}>
            <span style={{ fontSize: "0.65rem", color: "#44dd88", letterSpacing: "0.1em" }}>⚡ XP GANADO HOY</span>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "#44dd88", fontFamily: "'Courier New',monospace" }}>{xp} XP</span>
          </div>
        )}

        {/* Mode selector */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.58rem", letterSpacing: "0.2em", color: "#141e28", textTransform: "uppercase", marginBottom: "0.6rem" }}>¿Cómo estás hoy?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.55rem" }}>
            {Object.values(MODES).map(m => (
              <button key={m.id} className="mb"
                onClick={() => { setMode(m.id); setDone({}); setXp(0); }}
                style={{ background: mode === m.id ? `rgba(${m.id === "bestia" ? "255,68,68" : m.id === "crucero" ? "245,197,24" : "68,221,136"},0.09)` : "rgba(6,9,16,0.88)", border: `1px solid ${mode === m.id ? m.color : "rgba(255,255,255,0.05)"}`, borderRadius: 12, padding: "0.75rem 0.3rem", cursor: "pointer", textAlign: "center", boxShadow: mode === m.id ? `0 0 12px ${m.glow}` : "none" }}>
                <div style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>{m.emoji}</div>
                <div style={{ fontSize: "0.54rem", letterSpacing: "0.07em", textTransform: "uppercase", color: mode === m.id ? m.color : "#1a2a38", fontWeight: 600, lineHeight: 1.3 }}>{m.label.replace("MODO ", "")}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tasks */}
        {cur && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ background: "rgba(5,9,15,0.92)", border: `1px solid ${cur.color}16`, borderRadius: 16, overflow: "hidden", marginBottom: "0.85rem" }}>
              <div style={{ padding: "0.82rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.57rem", letterSpacing: "0.15em", color: cur.color, textTransform: "uppercase", marginBottom: "0.1rem" }}>{cur.label}</div>
                  <div style={{ fontSize: "0.66rem", color: "#253545" }}>{cur.desc}</div>
                </div>
                <div style={{ fontSize: "0.68rem", color: allDone ? "#44dd88" : cur.color, fontWeight: 700, fontFamily: "'Courier New',monospace" }}>{tDone}/{tTotal}</div>
              </div>
              {cur.tasks.map((task, i) => (
                <div key={task.id} className="tr" onClick={() => toggleTask(task.id)}
                  style={{ padding: "0.82rem 1rem", display: "flex", alignItems: "flex-start", gap: "0.7rem", cursor: "pointer", borderBottom: i < cur.tasks.length - 1 ? "1px solid rgba(255,255,255,0.025)" : "none", background: done[task.id] ? "rgba(68,221,136,0.03)" : "transparent", transition: "background 0.15s" }}>
                  <div style={{ width: 16, height: 16, minWidth: 16, borderRadius: 5, border: `1.5px solid ${done[task.id] ? "#44dd88" : "rgba(255,255,255,0.1)"}`, background: done[task.id] ? "#44dd88" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", marginTop: 1 }}>
                    {done[task.id] && <span style={{ fontSize: 10, color: "#000", fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, fontSize: "0.74rem", color: done[task.id] ? "#1e3028" : "#607a8a", textDecoration: done[task.id] ? "line-through" : "none", lineHeight: 1.45, transition: "color 0.2s" }}>{task.text}</div>
                  <div style={{ fontSize: "0.56rem", color: done[task.id] ? "#44dd88" : "#121c28", fontFamily: "'Courier New',monospace", whiteSpace: "nowrap" }}>+{task.xp} XP</div>
                </div>
              ))}
            </div>

            {/* Complete day button */}
            {allDone && !todayDone && (
              <button onClick={handleCompleteDay}
                style={{ width: "100%", background: "linear-gradient(135deg,rgba(245,197,24,0.15),rgba(245,197,24,0.08))", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 13, padding: "0.9rem", cursor: "pointer", color: "#f5c518", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.1em", marginBottom: "0.85rem", animation: "fadeUp 0.4s ease", transition: "all 0.2s" }}>
                🦉 MARCAR DÍA COMPLETO · +{PROGRESS_PER_DAY}% PROGRESO
              </button>
            )}

            {todayDone && allDone && (
              <div style={{ background: "rgba(68,221,136,0.07)", border: "1px solid rgba(68,221,136,0.16)", borderRadius: 12, padding: "0.85rem 1rem", textAlign: "center", animation: "fadeUp 0.4s ease", marginBottom: "0.85rem" }}>
                <div style={{ fontSize: "1.2rem", marginBottom: "0.22rem" }}>🦉</div>
                <div style={{ fontSize: "0.73rem", color: "#44dd88", letterSpacing: "0.05em" }}>Día guardado. Un paso más cerca de Shanghái. 🏮</div>
              </div>
            )}

            {saved && (
              <div style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", background: "rgba(68,221,136,0.9)", borderRadius: 99, padding: "0.5rem 1.2rem", fontSize: "0.72rem", color: "#000", fontWeight: 600, animation: "fadeUp 0.3s ease", zIndex: 999, whiteSpace: "nowrap" }}>
                ✓ Progreso guardado
              </div>
            )}
          </div>
        )}

        {/* Rules */}
        <div style={{ padding: "0.95rem 1rem", background: "rgba(3,5,10,0.75)", border: "1px solid rgba(255,255,255,0.025)", borderRadius: 14 }}>
          <div style={{ fontSize: "0.56rem", letterSpacing: "0.2em", color: "#10181f", textTransform: "uppercase", marginBottom: "0.55rem" }}>Protocolo base</div>
          {["🕙  El bloque comienza a las 10 PM. Antes es tiempo libre.", "🏋️  Post-gym: comer, ducha, descanso. Sin culpa.", "📌  La unidad es la tarea, no el tiempo.", "🔗  Modo Mínimo existe para no romper la cadena.", "📅  Fin de semana → Ing. en Redes.", "🏮  Cada día = un paso más cerca de Shanghái."].map((r, i) => (
            <div key={i} style={{ fontSize: "0.66rem", color: "#162030", marginBottom: "0.35rem", lineHeight: 1.5 }}>{r}</div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.6rem", fontSize: "0.6rem", color: "#8a9ba8", letterSpacing: "0.15em", fontWeight: 600 }}>
          ABSORB WHAT IS USEFUL · DISCARD WHAT IS NOT
        </div>
      </div>
    </div>
  );
}
