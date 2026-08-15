import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Store, WifiOff, Smartphone, BarChart3, Users, Package,
  Check, ArrowRight, Menu, X, Gift, Star, ChevronDown,
  NotebookPen, Wallet, Crown, Zap,
} from "lucide-react";

// Mockup de celular hecho 100% con CSS (sin imágenes que puedan fallar)
function PhoneMockup() {
  const productos = [
    { nombre: "Pan", precio: "$1.500", emoji: "🥖" },
    { nombre: "Leche", precio: "$1.500", emoji: "🥛" },
    { nombre: "Huevos", precio: "$3.500", emoji: "🥚" },
    { nombre: "Arroz", precio: "$1.800", emoji: "🍚" },
    { nombre: "Bebida", precio: "$1.500", emoji: "🥤" },
    { nombre: "Galletas", precio: "$900", emoji: "🍪" },
  ];
  return (
    <div className="relative">
      <div className="absolute -inset-10 bg-sky-400/20 blur-3xl rounded-full"></div>
      <div className="relative w-[280px] sm:w-[320px] mx-auto bg-slate-900 rounded-[2.5rem] border border-slate-700 shadow-2xl p-3 rotate-3 hover:rotate-0 transition-transform duration-500">
        <div className="bg-slate-100 rounded-[2rem] overflow-hidden">
          <div className="bg-slate-900 h-6 flex items-center justify-center">
            <div className="w-16 h-3 bg-slate-800 rounded-full"></div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-800">Turno abierto</p>
              <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">En línea</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {productos.map((p) => (
                <div key={p.nombre} className="bg-white rounded-xl border border-slate-200 p-2 text-center shadow-sm">
                  <div className="text-xl mb-1">{p.emoji}</div>
                  <p className="text-[10px] font-medium text-slate-700 truncate">{p.nombre}</p>
                  <p className="text-[10px] font-bold text-sky-600">{p.precio}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-2.5 mb-3">
              <div className="flex justify-between text-[11px] text-slate-600 mb-1.5">
                <span>2 productos</span>
                <span className="font-bold text-slate-900">$3.000</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full">
                <div className="h-1.5 w-2/3 bg-sky-500 rounded-full"></div>
              </div>
            </div>
            <div className="bg-sky-600 text-white text-center text-sm font-bold py-2.5 rounded-xl">Cobrar</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [faqAbierta, setFaqAbierta] = useState(null);

  const caracteristicas = [
    { icon: <WifiOff className="w-6 h-6 text-sky-600" />, titulo: "Funciona sin internet", desc: "¿Se cortó la señal? Sigue vendiendo. Todo se guarda en tu celular y se sincroniza solo cuando vuelve la conexión." },
    { icon: <NotebookPen className="w-6 h-6 text-blue-600" />, titulo: "La libreta de fiados, digital", desc: "Cada fiado con nombre, teléfono y dirección. Sabes quién te debe, cuánto y desde cuándo. Nada se pierde." },
    { icon: <Package className="w-6 h-6 text-sky-600" />, titulo: "Stock que se cuida solo", desc: "Se descuenta con cada venta y te avisa antes de que falte. Nunca más un \"no me di cuenta\"." },
    { icon: <Wallet className="w-6 h-6 text-blue-600" />, titulo: "Cuentas claras al cerrar", desc: "Cuánto entró en efectivo, tarjeta o transferencia. Cuadrar la caja toma 1 minuto, no media noche." },
    { icon: <Users className="w-6 h-6 text-sky-600" />, titulo: "Cada vendedor con su usuario", desc: "Si te ayudan en el negocio, cada uno vende con su propio usuario y tú ves quién vendió qué." },
    { icon: <Smartphone className="w-6 h-6 text-blue-600" />, titulo: "Tu celular es tu caja", desc: "No necesitas computador ni caja registradora nueva. Funciona en el celular que ya tienes." },
  ];

  const planes = [
    {
      nombre: "Básico", precioMensual: 5990, precioAnual: 59900,
      icon: <Zap className="w-5 h-5" />, popular: false, sub: "Para empezar",
      features: ["Hasta 500 productos", "1 vendedor", "Funciona sin internet", "Control de stock", "Ventas y fiados", "Resumen del día"],
    },
    {
      nombre: "Pro", precioMensual: 11990, precioAnual: 119900,
      icon: <Crown className="w-5 h-5" />, popular: true, sub: "Para crecer",
      features: ["Productos ilimitados", "Vendedores ilimitados", "Funciona sin internet", "Informes para el contador", "Varias sucursales", "Ofertas y promociones", "Atención prioritaria"],
    },
  ];

  const faqs = [
    { pregunta: "¿Funciona sin internet?", respuesta: "Sí. Si se corta la señal, sigues vendiendo igual: todo queda guardado en el celular y se manda solo a la nube cuando vuelve la conexión. No pierdes ninguna venta." },
    { pregunta: "¿Necesito computador o caja registradora?", respuesta: "No. Funciona en el celular o tablet que ya tienes. Tampoco hay que instalar nada: entras con tu correo y contraseña y listo." },
    { pregunta: "¿Qué pasa con mis fiados si pierdo el celular?", respuesta: "Nada. Quedan guardados con nombre, teléfono y dirección. Entras desde cualquier otro celular y ahí está todo, tal como lo dejaste." },
    { pregunta: "¿Puede vender alguien más conmigo?", respuesta: "Sí. Puedes crear un usuario para cada vendedor, con permisos distintos. Tú ves quién vendió qué y a qué hora." },
    { pregunta: "¿Cómo funciona el programa beta?", respuesta: "Con un código de invitación tienes 30 días con todo incluido y después 6 meses gratis del Plan Básico, como agradecimiento por ayudarnos a probar el sistema." },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-lg font-bold text-white">Loventa<span className="text-sky-400">.</span></span>
          </button>
          <div className="hidden md:flex items-center gap-7">
            <a href="#caracteristicas" className="text-sm text-slate-300 hover:text-white transition">Características</a>
            <a href="#precios" className="text-sm text-slate-300 hover:text-white transition">Precios</a>
            <a href="#faq" className="text-sm text-slate-300 hover:text-white transition">FAQ</a>
            {isAuthenticated ? (
              <Link to="/app" className="bg-sky-500 hover:bg-sky-400 text-slate-900 px-4 py-1.5 rounded-full text-sm font-bold transition">
                Ir a mi panel
              </Link>
            ) : (
              <>
                <Link to="/beta-registro" className="bg-sky-500 hover:bg-sky-400 text-slate-900 px-4 py-1.5 rounded-full text-sm font-bold transition">
                  Empezar Gratis
                </Link>
                <Link to="/login" className="text-sm text-white font-medium hover:text-sky-300 transition">
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-slate-300 p-2">
            {menuAbierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuAbierto && (
          <div className="md:hidden bg-slate-900/95 border-t border-white/5 px-4 py-4 space-y-3">
            <a href="#caracteristicas" onClick={() => setMenuAbierto(false)} className="block text-slate-300 py-2">Características</a>
            <a href="#precios" onClick={() => setMenuAbierto(false)} className="block text-slate-300 py-2">Precios</a>
            <a href="#faq" onClick={() => setMenuAbierto(false)} className="block text-slate-300 py-2">FAQ</a>
            {isAuthenticated ? (
              <Link to="/app" onClick={() => setMenuAbierto(false)} className="block bg-sky-500 text-slate-900 text-center py-2.5 rounded-full font-bold">Ir a mi panel</Link>
            ) : (
              <>
                <Link to="/beta-registro" onClick={() => setMenuAbierto(false)} className="block bg-sky-500 text-slate-900 text-center py-2.5 rounded-full font-bold">Empezar Gratis</Link>
                <Link to="/login" onClick={() => setMenuAbierto(false)} className="block text-center text-white py-2 font-medium">Iniciar sesión</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ─── HERO ── */}
      <header className="pt-28 pb-20 px-4 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-sky-300 px-4 py-1.5 rounded-full text-xs font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-sky-400"></span>
              Programa beta abierto — 7 meses gratis
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Tu almacén ordenado
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
                sin cuaderno ni calculadora
              </span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Vende sin internet. Controla tu stock. Registra fiados. Todo desde tu celular.
              <strong className="text-slate-200"> Sin computador, sin caja registradora.</strong>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/beta-registro" className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-slate-900 px-8 py-4 rounded-full text-lg font-bold transition flex items-center justify-center gap-2">
                Empezar Gratis <ArrowRight size={20} />
              </Link>
              <a href="#caracteristicas" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full text-lg font-medium transition">
                Ver cómo funciona
              </a>
            </div>
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 mt-12 pt-8 border-t border-white/10">
              <div><p className="text-2xl font-bold text-white">100%</p><p className="text-sm text-slate-400 mt-1">Funciona sin señal</p></div>
              <div><p className="text-2xl font-bold text-white">$5.990</p><p className="text-sm text-slate-400 mt-1">Desde /mes</p></div>
              <div><p className="text-2xl font-bold text-white">0</p><p className="text-sm text-slate-400 mt-1">Cuadernos y planillas</p></div>
            </div>
          </div>
          <PhoneMockup />
        </div>
      </header>

      {/* ─── CARACTERÍSTICAS ─── */}
      <section id="caracteristicas" className="py-20 bg-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Hecho para la realidad del barrio</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Pensado para almacenes, minimarkets y negocios familiares de Chile.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caracteristicas.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-4">{c.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{c.titulo}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANNER BETA ─── */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star size={14} className="fill-current" /> Programa Beta Exclusivo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">Únete ahora y vende gratis por más de 6 meses</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center min-w-[140px] w-full sm:w-auto">
              <p className="text-3xl font-bold text-white">30</p><p className="text-sm text-slate-400">días con todo incluido</p>
            </div>
            <span className="text-slate-500 text-2xl hidden sm:block">+</span>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center min-w-[140px] w-full sm:w-auto">
              <p className="text-3xl font-bold text-white">6</p><p className="text-sm text-slate-400">meses gratis</p>
            </div>
            <span className="text-slate-500 text-2xl hidden sm:block">=</span>
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-6 text-center min-w-[140px] w-full sm:w-auto">
              <p className="text-3xl font-bold text-sky-400">$0</p><p className="text-sm text-sky-200/70">por más de 7 meses</p>
            </div>
          </div>
          <Link to="/beta-registro" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-900 px-8 py-4 rounded-full text-lg font-bold transition">
            Solicitar acceso beta <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── PRECIOS ─── */}
      <section id="precios" className="py-20 bg-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Precios simples, sin sorpresas</h2>
            <p className="text-slate-500 text-lg">Elige el plan que se ajuste a tu negocio. Cancela cuando quieras.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {planes.map((plan) => (
              <div key={plan.nombre} className={`relative rounded-2xl p-8 flex flex-col ${plan.popular ? "bg-slate-900 border-2 border-sky-500 shadow-xl" : "bg-white border border-slate-200 shadow-sm"}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">Más popular</div>
                )}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? "bg-sky-500/10 text-sky-400" : "bg-slate-100 text-slate-600"}`}>{plan.icon}</div>
                  <div>
                    <h3 className={`text-xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.nombre}</h3>
                    <p className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.sub}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>${plan.precioMensual.toLocaleString("es-CL")}</span>
                    <span className={plan.popular ? "text-slate-400" : "text-slate-500"}>/mes</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">o ${plan.precioAnual.toLocaleString("es-CL")}/año (ahorras 2 meses)</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`flex items-start gap-2 text-sm ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                      <Check size={16} className="text-sky-500 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/beta-registro" className={`block w-full text-center py-3 rounded-full font-bold transition ${plan.popular ? "bg-sky-500 hover:bg-sky-400 text-slate-900" : "bg-slate-900 hover:bg-slate-800 text-white"}`}>
                  {plan.popular ? "Empezar con Pro" : "Empezar con Básico"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Preguntas frecuentes</h2>
            <p className="text-slate-500">Lo que cualquier dueño de almacén nos pregunta antes de partir.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <button onClick={() => setFaqAbierta(faqAbierta === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-100 transition">
                  <span className="font-medium text-slate-800">{faq.pregunta}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${faqAbierta === i ? "rotate-180" : ""}`} />
                </button>
                {faqAbierta === i && (
                  <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed">{faq.respuesta}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-20 bg-slate-100 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Deja el cuaderno. Pásate al celular.</h2>
        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">Únete al programa beta y empieza a vender mejor hoy mismo. Sin tarjeta, sin compromiso.</p>
        <Link to="/beta-registro" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-bold transition">
          Crear cuenta gratis <ArrowRight size={20} />
        </Link>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-lg font-bold text-white">Loventa</span>
          </div>
          <p className="text-sm">© 2026 Loventa. Hecho con ❤️ en Chile.</p>
          <p className="text-xs text-slate-500">Tu celular, tu caja registradora.</p>
        </div>
      </footer>
    </div>
  );
}