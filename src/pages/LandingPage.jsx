import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store, WifiOff, Smartphone, BarChart3, ShieldCheck,
  Users, Package, Check, ArrowRight, Menu, X,
  Gift, Star, ChevronDown, Leaf, Snowflake, NotebookPen, Wallet
} from "lucide-react";

const IMG_HERO = "/img/hero-phone.png";
const IMG_DUENO = "/img/dueno-almacen.jpg";
const IMG_REPORTES = "/img/reportes-phone.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [faqAbierta, setFaqAbierta] = useState(null);

  // Scroll suave en toda la página (estilo Apple)
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  // 🔥 FIX: El logo SIEMPRE vuelve al inicio, sin quedar pegado en secciones
  function volverInicio(e) {
    e.preventDefault();
    setMenuAbierto(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const caracteristicas = [
    {
      icon: <WifiOff className="w-6 h-6 text-emerald-600" />,
      titulo: "Funciona sin internet",
      desc: "¿Se cortó la señal? Sigue vendiendo. Todo se guarda en tu celular y se sincroniza solo cuando vuelve la conexión.",
    },
    {
      icon: <NotebookPen className="w-6 h-6 text-emerald-600" />,
      titulo: "La libreta de fiados, digital",
      desc: "Cada fiado con nombre, teléfono y dirección. Sabes quién te debe, cuánto y desde cuándo. Nada se pierde.",
    },
    {
      icon: <Package className="w-6 h-6 text-emerald-600" />,
      titulo: "Stock que se cuida solo",
      desc: "Se descuenta con cada venta y te avisa antes de que falte. Nunca más un \"no me di cuenta\".",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
      titulo: "Cuentas claras al cerrar",
      desc: "Cuánto entró en efectivo, tarjeta o transferencia. Cuadrar la caja toma 1 minuto, no media noche.",
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      titulo: "Cada vendedor con su usuario",
      desc: "Si te ayudan en el negocio, cada uno vende con su propio usuario y tú ves quién vendió qué.",
    },
    {
      icon: <Smartphone className="w-6 h-6 text-emerald-600" />,
      titulo: "Tu celular es tu caja",
      desc: "No necesitas computador ni caja registradora nueva. Funciona en el celular que ya tienes.",
    },
  ];

  const planes = [
    {
      nombre: "Básico",
      sub: "Para empezar",
      precioMensual: 5990,
      precioAnual: 59900,
      icon: <Leaf className="w-5 h-5" />,
      popular: false,
      features: [
        "Hasta 500 productos",
        "1 vendedor",
        "POS 100% offline",
        "Control de stock",
        "Ventas y fiados",
        "Reportes básicos",
      ],
    },
    {
      nombre: "Pro",
      sub: "Para crecer",
      precioMensual: 11990,
      precioAnual: 119900,
      icon: <Snowflake className="w-5 h-5" />,
      popular: true,
      features: [
        "Productos ilimitados",
        "Vendedores ilimitados",
        "POS 100% offline",
        "Reportes avanzados",
        "Multi-sucursal",
        "Ofertas y promociones",
        "Soporte prioritario",
      ],
    },
  ];

  const faqs = [
    {
      pregunta: "¿Funciona sin internet?",
      respuesta: "Sí. Si se corta la señal, sigues vendiendo igual: todo queda guardado en el celular y se manda solo a la nube cuando vuelve la conexión. No pierdes ninguna venta.",
    },
    {
      pregunta: "¿Necesito computador o caja registradora?",
      respuesta: "No. Funciona en el celular o tablet que ya tienes. Tampoco hay que instalar nada: entras con tu correo y contraseña y listo.",
    },
    {
      pregunta: "¿Qué pasa con mis fiados si pierdo el celular?",
      respuesta: "Nada. Quedan guardados con nombre, teléfono y dirección. Entras desde cualquier otro celular y ahí está todo, tal como lo dejaste.",
    },
    {
      pregunta: "¿Puede vender alguien más conmigo?",
      respuesta: "Sí. Puedes crear un usuario para cada vendedor, con permisos distintos. Tú ves quién vendió qué y a qué hora.",
    },
    {
      pregunta: "¿Cómo funciona el programa beta?",
      respuesta: "Con un código de invitación tienes 30 días con todo incluido y después 6 meses gratis del Plan Básico, como agradecimiento por ayudarnos a probar el sistema.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" onClick={volverInicio} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition">
              <Store className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Loventa<span className="text-emerald-400">.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <a href="#caracteristicas" className="text-sm text-slate-300 hover:text-white transition">Características</a>
            <a href="#precios" className="text-sm text-slate-300 hover:text-white transition">Precios</a>
            <a href="#faq" className="text-sm text-slate-300 hover:text-white transition">FAQ</a>
            <Link to="/beta-registro" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-1.5 rounded-full text-sm font-semibold transition">
              Empezar Gratis
            </Link>
            <Link to="/login" className="text-sm text-white font-medium hover:text-emerald-300 transition">
              Iniciar sesión
            </Link>
          </div>

          <button className="md:hidden text-slate-300 p-2" onClick={() => setMenuAbierto(!menuAbierto)}>
            {menuAbierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuAbierto && (
          <div className="md:hidden bg-slate-950/95 backdrop-blur-md border-t border-white/5 px-4 py-4 space-y-3">
            <a href="#caracteristicas" onClick={() => setMenuAbierto(false)} className="block text-slate-300 py-2">Características</a>
            <a href="#precios" onClick={() => setMenuAbierto(false)} className="block text-slate-300 py-2">Precios</a>
            <a href="#faq" onClick={() => setMenuAbierto(false)} className="block text-slate-300 py-2">FAQ</a>
            <Link to="/beta-registro" onClick={() => setMenuAbierto(false)} className="block bg-emerald-500 text-slate-950 text-center py-2.5 rounded-full font-semibold">Empezar Gratis</Link>
            <Link to="/login" onClick={() => setMenuAbierto(false)} className="block text-center text-white py-2 font-medium">Iniciar sesión</Link>
          </div>
        )}
      </nav>

      {/* ─── HERO (Mensaje 2) ─── */}
      <header className="relative bg-slate-950 pt-28 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            Programa Beta Abierto — 7 meses gratis
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            Tu almacén ordenado
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
              sin cuaderno ni calculadora
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Cada venta, cada fiado y cada producto registrado en tu celular.
            Funciona con o sin internet, y al cerrar el día
            <strong className="text-slate-200"> la caja cuadra sola.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/beta-registro"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-full text-lg font-bold transition flex items-center justify-center gap-2"
            >
              Empezar Gratis <ArrowRight size={20} />
            </Link>
            <a
              href="#como-funciona"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full text-lg font-medium transition flex items-center justify-center gap-2"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>

        <div className="relative max-w-3xl mx-auto mt-16">
          <img
            src={IMG_HERO}
            alt="Loventa en tu celular: vende con un toque"
            className="w-full rounded-3xl shadow-2xl shadow-emerald-500/10 border border-white/5"
          />
        </div>
      </header>

      {/* ─── HECHO PARA EL BARRIO (foto dueño) ─── */}
      <section id="como-funciona" className="bg-stone-100 py-24 px-4 scroll-mt-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <img
            src={IMG_DUENO}
            alt="Dueño de almacén de barrio usando Loventa"
            className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3]"
          />
          <div>
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-4">Hecho para el barrio</p>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
              Como tener una caja registradora. Pero en tu bolsillo.
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
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
                  <Check size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── OFFLINE (statement oscuro) ─── */}
      <section className="bg-slate-950 py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <WifiOff className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
            ¿Se cortó el internet?
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">Sigue vendiendo.</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Loventa guarda cada venta en tu celular y la sube a la nube cuando vuelve la conexión.
            Ni tú ni tus clientes notan la diferencia.
          </p>
        </div>
      </section>

      {/* ─── REPORTES (foto dashboard) ─── */}
      <section className="bg-slate-900 py-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <p className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">Cuentas claras</p>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
              La caja cuadra sola. Todo suma, nada se pierde.
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Efectivo, tarjeta, transferencia y fiados, separados y ordenados.
              Al cerrar el turno sabes exactamente cuánto debería haber en el cajón,
              y al fin del mes tienes el informe listo para tu contador.
            </p>
            <ul className="space-y-4">
              {[
                "Resumen del turno en 1 minuto.",
                "Ranking de lo que más se vende.",
                "Fiados pendientes y atrasados a la vista.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300">
                  <Check size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <img
            src={IMG_REPORTES}
            alt="Reportes de ventas de Loventa en tu celular"
            className="rounded-3xl w-full shadow-2xl shadow-emerald-500/10 border border-white/5"
          />
        </div>
      </section>

      {/* ─── CARACTERÍSTICAS (grid) ─── */}
      <section id="caracteristicas" className="bg-stone-100 py-24 px-4 scroll-mt-20">
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
              <div key={i} className="bg-white rounded-2xl p-7 border border-stone-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5">
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
      <section className="bg-slate-950 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
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
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center min-w-[160px] w-full sm:w-auto">
              <p className="text-4xl font-bold text-emerald-400 mb-1">$0</p>
              <p className="text-sm text-emerald-200/70">por más de 7 meses</p>
            </div>
          </div>
          <Link
            to="/beta-registro"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-full text-lg font-bold transition"
          >
            Solicitar acceso beta <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── PRECIOS ─── */}
      <section id="precios" className="bg-stone-100 py-24 px-4 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Precios simples, sin sorpresas
            </h2>
            <p className="text-slate-500 text-lg">
              Elige el plan que se ajuste a tu negocio. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
            {planes.map((plan) => (
              <div
                key={plan.nombre}
                className={`relative rounded-3xl p-8 flex flex-col ${
                  plan.popular
                    ? "bg-slate-950 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10"
                    : "bg-white border border-stone-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                    Más popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular ? "bg-emerald-500/10 text-emerald-400" : "bg-stone-100 text-slate-600"
                  }`}>
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
                      <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/beta-registro"
                  className={`block w-full text-center py-3.5 rounded-full font-bold transition ${
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-slate-950 hover:bg-slate-800 text-white"
                  }`}
                >
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
      <section id="faq" className="bg-white py-24 px-4 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Preguntas frecuentes</h2>
            <p className="text-slate-500">Lo que cualquier dueño de almacén nos pregunta antes de partir.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden">
                <button
                  onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-stone-100 transition"
                >
                  <span className="font-semibold text-slate-800 pr-4">{faq.pregunta}</span>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 shrink-0 transition-transform duration-300 ${faqAbierta === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${faqAbierta === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                      {faq.respuesta}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="bg-slate-950 py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
            Deja el cuaderno. Pásate al celular.
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Únete al programa beta y empieza a vender mejor hoy mismo.
            Sin tarjeta, sin compromiso.
          </p>
          <Link
            to="/beta-registro"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-full text-lg font-bold transition"
          >
            Crear cuenta gratis <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-slate-500 mt-6 flex items-center justify-center gap-2">
            <Gift size={14} /> Cupos beta limitados. Pide tu código de invitación.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 border-t border-white/5 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-lg font-bold text-white">Loventa</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                El sistema hecho para almacenes de barrio en Chile.
                Vende sin internet, controla tu stock y no pierdas ni un fiado.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#caracteristicas" className="hover:text-white transition">Características</a></li>
                <li><a href="#precios" className="hover:text-white transition">Precios</a></li>
                <li><Link to="/beta-registro" className="hover:text-white transition">Programa Beta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Cuenta</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition">Iniciar sesión</Link></li>
                <li><Link to="/beta-registro" className="hover:text-white transition">Registrarme</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 Loventa. Hecho con ❤️ en Chile.</p>
            <p className="text-xs text-slate-500">Tu celular, tu caja registradora.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}