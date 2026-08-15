import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Store, WifiOff, Smartphone, BarChart3, Users, Package,
  Check, ArrowRight, Menu, X, Gift, Star, ChevronDown,
  ShieldCheck, Crown, Zap, NotebookPen, Wallet
} from "lucide-react";

// ─── Mockup de celular hecho 100% con CSS (nunca se rompe) ───
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
      <div className="relative w-[280px] sm:w-[320px] mx-auto bg-slate-900 rounded-[2.5rem] border border-slate-700 shadow-2xl shadow-sky-900/40 p-3 rotate-3 hover:rotate-0 transition-transform duration-500">
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
            <div className="bg-sky-600 text-white text-center text-sm font-bold py-2.5 rounded-xl shadow-lg shadow-sky-600/30">
              Cobrar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Gráfico de ventas hecho 100% con CSS ───
function ChartMockup() {
  const barras = [45, 70, 55, 85, 65, 100, 80];
  const dias = ["L", "M", "W", "J", "V", "S", "D"];
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-blue-500/20 blur-3xl rounded-full"></div>
      <div className="relative bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl shadow-blue-900/40 p-6 w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-400">Ventas de hoy</p>
            <p className="text-2xl font-bold text-white">$248.900</p>
          </div>
          <span className="text-xs bg-sky-500/20 text-sky-400 px-2.5 py-1 rounded-full font-medium">+18%</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-32 mb-3">
          {barras.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-full rounded-t-lg ${i === 5 ? "bg-sky-400" : "bg-sky-600/60"}`}
                style={{ height: `${h}%` }}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-2">
          {dias.map((d, i) => (
            <p key={i} className="flex-1 text-center text-[10px] text-slate-500">{d}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [faqAbierta, setFaqAbierta] = useState(null);

  function volverArriba() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 selection:bg-sky-100 selection:text-sky-900">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={volverArriba} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-sky-500/20 transition">
              <Store className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Loventa<span className="text-sky-400">.</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-7">
            <a href="#caracteristicas" className="text-sm text-slate-300 hover:text-white transition">Características</a>
            <a href="#precios" className="text-sm text-slate-300 hover:text-white transition">Precios</a>
            <a href="#faq" className="text-sm text-slate-300 hover:text-white transition">FAQ</a>
            <Link to="/beta-registro" className="bg-sky-500 hover:bg-sky-400 text-slate-900 px-4 py-1.5 rounded-full text-sm font-bold transition">
              Empezar Gratis
            </Link>
            <Link to="/login" className="text-sm text-white font-medium hover:text-sky-300 transition">
              Iniciar sesión
            </Link>
          </div>

          <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-slate-300 p-2">
            {menuAbierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuAbierto && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-white/5 px-4 py-4 space-y-3">
            <a href="#caracteristicas" onClick={() => setMenuAbierto(false)} className="block text-slate-300 py-2">Características</a>
            <a href="#precios" onClick={() => setMenuAbierto(false)} className="block text-slate-300 py-2">Precios</a>
            <a href="#faq" onClick={() => setMenuAbierto(false)} className="block text-slate-300 py-2">FAQ</a>
            <Link to="/beta-registro" onClick={() => setMenuAbierto(false)} className="block bg-sky-500 text-slate-900 text-center py-2.5 rounded-full font-bold">Empezar Gratis</Link>
            <Link to="/login" onClick={() => setMenuAbierto(false)} className="block text-center text-white py-2 font-medium">Iniciar sesión</Link>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <header className="pt-28 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/60 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-200/60 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-medium mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-sky-500"></span>
              Programa beta abierto — 7 meses gratis
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Tu almacén ordenado
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-500">
                sin cuaderno ni calculadora
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 mb-8 leading-relaxed">
              Cada venta, cada fiado y cada producto registrado en tu celular.
              Funciona con o sin internet, y al cerrar el día
              <strong className="text-slate-700"> la caja cuadra sola.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/beta-registro" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-bold transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Empezar Gratis <ArrowRight size={20} />
              </Link>
              <a href="#caracteristicas" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full text-lg font-medium transition flex items-center justify-center gap-2">
                Ver cómo funciona
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 mt-12 pt-8 border-t border-slate-200">
              <div><p className="text-2xl md:text-3xl font-bold text-slate-900">100%</p><p className="text-sm text-slate-500 mt-1">Funciona sin señal</p></div>
              <div><p className="text-2xl md:text-3xl font-bold text-slate-900">$5.990</p><p className="text-sm text-slate-500 mt-1">Desde /mes</p></div>
              <div><p className="text-2xl md:text-3xl font-bold text-slate-900">0</p><p className="text-sm text-slate-500 mt-1">Cuadernos y planillas</p></div>
            </div>
          </div>

          <PhoneMockup />
        </div>
      </header>

      {/* ─── HECHO PARA EL BARRIO ─── */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-slate-100 rounded-3xl p-8 border border-slate-200 order-2 md:order-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-sky-600 text-white flex items-center justify-center text-lg font-bold">JP</div>
              <div>
                <p className="font-bold text-slate-900">Juan Pérez</p>
                <p className="text-sm text-slate-500">Almacén La Esquina · Santiago</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6">
              "Antes cerraba el día a las 11 de la noche contando billetes y anotando fiados en la libreta.
              Ahora cierro en 5 minutos y lo que dice la pantalla es lo que hay en la caja."
            </p>
            <div className="flex items-center gap-1 text-sky-500">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="text-sky-600 font-semibold text-sm uppercase tracking-widest mb-4">Hecho para el barrio</p>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
              Como tener una caja registradora. Pero en tu bolsillo.
            </h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              Atiende, cobra y registra en segundos. Tus clientes no esperan,
              tú no te equivales con las vueltas y todo queda anotado sin escribir una sola línea.
            </p>
            <ul className="space-y-4">
              {[
                "Cobras con un toque: efectivo, tarjeta, transferencia o fiado.",
                "El stock se descuenta solo con cada venta.",
                "Los fiados quedan con nombre, teléfono y dirección.",
                "Al cerrar el día, ves exactamente cuánto hay en caja.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700">
                  <Check size={20} className="text-sky-600 shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── OFFLINE ─── */}
      <section className="bg-slate-900 py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="w-14 h-14 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <WifiOff className="w-6 h-6 text-sky-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
            ¿Se cortó el internet?
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">Sigue vendiendo.</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Loventa guarda cada venta en tu celular y la sube a la nube cuando vuelve la conexión.
            Ni tú ni tus clientes notan la diferencia.
          </p>
        </div>
      </section>

      {/* ─── REPORTES ─── */}
      <section className="py-24 bg-slate-100 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sky-600 font-semibold text-sm uppercase tracking-widest mb-4">Cuentas claras</p>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
              La caja cuadra sola. Todo suma, nada se pierde.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed mb-8">
              Efectivo, tarjeta, transferencia y fiados, separados y ordenados.
              Al cerrar el turno sabes exactamente cuánto debería haber en el cajón,
              y al fin de mes tienes el informe listo para tu contador.
            </p>
            <ul className="space-y-4">
              {[
                "Resumen del turno en 1 minuto.",
                "Ranking de lo que más se vende.",
                "Fiados pendientes y atrasados a la vista.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700">
                  <Check size={20} className="text-sky-600 shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <ChartMockup />
        </div>
      </section>

      {/* ─── CARACTERÍSTICAS ─── */}
      <section id="caracteristicas" className="py-24 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Todo lo que tu almacén necesita. Nada que te sobre.
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Diseñado para almacenes, minimarkets y negocios familiares de Chile.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caracteristicas.map((c, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-7 border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm border border-slate-200">
                  {c.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{c.titulo}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANNER BETA ─── */}
      <section className="bg-slate-900 py-20 px-4 relative overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star size={14} className="fill-current" />
            Programa Beta Exclusivo
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-10">
            Únete ahora y vende gratis por más de 6 meses
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center min-w-[160px] w-full sm:w-auto">
              <p className="text-4xl font-bold text-white mb-1">30</p>
              <p className="text-sm text-slate-400">días con todo incluido</p>
            </div>
            <span className="text-slate-500 text-2xl hidden sm:block">+</span>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center min-w-[160px] w-full sm:w-auto">
              <p className="text-4xl font-bold text-white mb-1">6</p>
              <p className="text-sm text-slate-400">meses gratis</p>
            </div>
            <span className="text-slate-500 text-2xl hidden sm:block">=</span>
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-6 text-center min-w-[160px] w-full sm:w-auto">
              <p className="text-4xl font-bold text-sky-400 mb-1">$0</p>
              <p className="text-sm text-sky-200/70">por más de 7 meses</p>
            </div>
          </div>
          <Link to="/beta-registro" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-900 px-8 py-4 rounded-full text-lg font-bold transition shadow-xl">
            Solicitar acceso beta <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── PRECIOS ─── */}
      <section id="precios" className="py-24 bg-slate-100 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Precios simples, sin sorpresas</h2>
            <p className="text-slate-500 text-lg">Elige el plan que se ajuste a tu negocio. Cancela cuando quieras.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
            {planes.map((plan) => (
              <div key={plan.nombre} className={`relative rounded-3xl p-8 flex flex-col ${plan.popular ? "bg-slate-900 border-2 border-sky-500 shadow-2xl shadow-sky-500/10" : "bg-white border border-slate-200 shadow-sm"}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                    Más popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? "bg-sky-500/10 text-sky-400" : "bg-slate-100 text-slate-600"}`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.nombre}</h3>
                    <p className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.sub}</p>
                  </div>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>
                      ${plan.precioMensual.toLocaleString("es-CL")}
                    </span>
                    <span className={plan.popular ? "text-slate-400" : "text-slate-500"}>/mes</span>
                  </div>
                  <p className={`text-sm mt-2 ${plan.popular ? "text-slate-400" : "text-slate-400"}`}>
                    o ${plan.precioAnual.toLocaleString("es-CL")}/año (ahorras 2 meses)
                  </p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                      <Check size={18} className="text-sky-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/beta-registro" className={`block w-full text-center py-3.5 rounded-full font-bold transition ${plan.popular ? "bg-sky-500 hover:bg-sky-400 text-slate-900" : "bg-slate-900 hover:bg-slate-800 text-white"}`}>
                  {plan.popular ? "Empezar con Pro" : "Empezar con Básico"}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-400 mt-10 flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> Pago seguro. Sin contratos de permanencia.
          </p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 bg-white px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Preguntas frecuentes</h2>
            <p className="text-slate-500">Lo que cualquier dueño de almacén nos pregunta antes de partir.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <button onClick={() => setFaqAbierta(faqAbierta === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-100/50 transition">
                  <span className="font-semibold text-slate-800 pr-4">{faq.pregunta}</span>
                  <ChevronDown size={20} className={`text-slate-400 shrink-0 transition-transform duration-300 ${faqAbierta === i ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${faqAbierta === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">{faq.respuesta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-24 bg-slate-100 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">Deja el cuaderno. Pásate al celular.</h2>
          <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
            Únete al programa beta y empieza a vender mejor hoy mismo. Sin tarjeta, sin compromiso.
          </p>
          <Link to="/beta-registro" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-bold transition shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Crear cuenta gratis <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-slate-400 mt-6 flex items-center justify-center gap-2">
            <Gift size={14} /> Cupos beta limitados. Pide tu código de invitación.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-xl font-bold text-white">Loventa</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                El sistema hecho para almacenes de barrio en Chile.
                Vende sin internet, controla tu stock y no pierdas ni un fiado.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#caracteristicas" className="hover:text-sky-400 transition">Características</a></li>
                <li><a href="#precios" className="hover:text-sky-400 transition">Precios</a></li>
                <li><Link to="/beta-registro" className="hover:text-sky-400 transition">Programa Beta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Cuenta</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-sky-400 transition">Iniciar sesión</Link></li>
                <li><Link to="/beta-registro" className="hover:text-sky-400 transition">Registrarme</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 Loventa. Hecho con ❤️ en Chile.</p>
            <p className="text-xs text-slate-500">Tu celular, tu caja registradora.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}