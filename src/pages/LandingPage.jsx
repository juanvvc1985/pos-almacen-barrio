import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Store, WifiOff, Smartphone, BarChart3, ShieldCheck, Zap, 
  Users, Package, CreditCard, Check, ArrowRight, Menu, X, 
  Clock, Gift, Crown, Star, ChevronDown, Leaf, Snowflake 
} from "lucide-react";

export default function LandingPage() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [faqAbierta, setFaqAbierta] = useState(null);

  // Paleta Nórdica: Slate (Gris azulado), Stone (Gris cálido/piedra), Emerald (Verde bosque suave)
  const caracteristicas = [
    {
      icon: <WifiOff className="w-6 h-6 text-emerald-600" />,
      titulo: "100% Offline",
      desc: "Vende sin internet. Todo se guarda localmente y se sincroniza cuando vuelvas a conectar.",
    },
    {
      icon: <Smartphone className="w-6 h-6 text-slate-600" />,
      titulo: "Desde tu celular",
      desc: "No necesitas computador ni caja registradora. Tu celular es tu POS.",
    },
    {
      icon: <Package className="w-6 h-6 text-stone-600" />,
      titulo: "Control de stock",
      desc: "Sabe exactamente qué tienes, qué se vende más y qué está por agotarse.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
      titulo: "Reportes claros",
      desc: "Ventas por día, producto, vendedor. Toma decisiones con datos reales.",
    },
    {
      icon: <Users className="w-6 h-6 text-slate-600" />,
      titulo: "Multi-vendedor",
      desc: "Cada vendedor con su usuario. Controla quién puede vender, editar o ver reportes.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-stone-600" />,
      titulo: "Fiados seguros",
      desc: "Registra deudas de clientes con nombre, teléfono y dirección. Nunca pierdas una cuenta.",
    },
  ];

  const planes = [
    {
      nombre: "Básico",
      precioMensual: 5990,
      precioAnual: 59900,
      icon: <Leaf className="w-5 h-5" />,
      color: "slate",
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
      precioMensual: 11990,
      precioAnual: 119900,
      icon: <Snowflake className="w-5 h-5" />,
      color: "emerald",
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
      pregunta: "¿Necesito internet para usar Loventa?",
      respuesta: "No. Loventa funciona 100% offline. Puedes vender, agregar productos y registrar fiados sin conexión. Todo se sincroniza automáticamente cuando recuperes internet.",
    },
    {
      pregunta: "¿Puedo usarlo en mi computador?",
      respuesta: "Sí, Loventa es una aplicación web responsive. Funciona perfectamente en celulares, tablets y computadores. Solo necesitas un navegador.",
    },
    {
      pregunta: "¿Qué pasa si pierdo mi celular?",
      respuesta: "Tus datos están seguros en la nube de Firebase. Solo inicia sesión desde otro dispositivo y recuperas toda tu información al instante.",
    },
    {
      pregunta: "¿Puedo tener varias tiendas?",
      respuesta: "Sí, con el Plan Pro puedes gestionar múltiples sucursales desde una sola cuenta, con reportes consolidados y stock por tienda.",
    },
    {
      pregunta: "¿Cómo funciona el programa beta?",
      respuesta: "Si tienes un código de invitación, obtienes 30 días de prueba completa del Plan Pro + 6 meses gratis. Después eliges si quedarte con el Plan Básico o Pro.",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 bg-stone-50/80 backdrop-blur-md border-b border-stone-200 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-emerald-700 transition-colors duration-300">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Loventa<span className="text-emerald-600">.</span>
            </span>
          </Link>
          
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#caracteristicas" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Características</a>
            <a href="#precios" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Precios</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">FAQ</a>
            <Link
              to="/beta-registro"
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition shadow-sm hover:shadow-md"
            >
              Empezar Gratis
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 text-slate-600 hover:bg-stone-200 rounded-lg transition"
          >
            {menuAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuAbierto && (
          <div className="md:hidden bg-stone-50 border-t border-stone-200 px-4 py-4 space-y-3 animate-in slide-in-from-top-5">
            <a href="#caracteristicas" onClick={() => setMenuAbierto(false)} className="block text-slate-600 py-2 font-medium">Características</a>
            <a href="#precios" onClick={() => setMenuAbierto(false)} className="block text-slate-600 py-2 font-medium">Precios</a>
            <a href="#faq" onClick={() => setMenuAbierto(false)} className="block text-slate-600 py-2 font-medium">FAQ</a>
            <Link to="/beta-registro" onClick={() => setMenuAbierto(false)} className="block bg-slate-900 text-white text-center py-3 rounded-full font-medium">Empezar Gratis</Link>
            <Link to="/login" onClick={() => setMenuAbierto(false)} className="block text-center text-slate-600 py-2 font-medium">Iniciar sesión</Link>
          </div>
        )}
      </nav>

      {/* ─── HERO ── */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-slate-200 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-stone-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-medium mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            Programa Beta Abierto — 7 meses gratis
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            El POS que tu almacén <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-slate-600">
              realmente necesita
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Vende sin internet. Controla tu stock. Registra fiados. 
            Todo desde tu celular, con un diseño limpio y moderno.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/beta-registro"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Empezar Gratis <ArrowRight size={20} />
            </Link>
            <a
              href="#caracteristicas"
              className="w-full sm:w-auto bg-white hover:bg-stone-50 text-slate-700 border border-stone-200 px-8 py-4 rounded-full text-lg font-medium transition flex items-center justify-center gap-2"
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20 pt-10 border-t border-stone-200">
            <div>
              <p className="text-3xl font-bold text-slate-900">100%</p>
              <p className="text-sm text-slate-500 mt-1">Offline</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">$5.990</p>
              <p className="text-sm text-slate-500 mt-1">Desde /mes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">0</p>
              <p className="text-sm text-slate-500 mt-1">Complicaciones</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CARACTERÍSTICAS ─── */}
      <section id="caracteristicas" className="py-24 bg-white border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Diseñado para la realidad del barrio
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Olvida el software complejo. Loventa es simple, rápido y funciona incluso cuando se cae el internet.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caracteristicas.map((c, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-stone-50 border border-stone-100 hover:border-emerald-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm border border-stone-100 group-hover:scale-110 transition-transform duration-300">
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
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star size={14} className="fill-current" />
            Oferta Limitada Beta
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Únete ahora y vende gratis <br/>por más de 6 meses
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Los primeros usuarios obtienen acceso completo al Plan Pro por 30 días, 
            y luego 6 meses adicionales del Plan Básico totalmente gratis.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center min-w-[160px]">
              <p className="text-4xl font-bold text-white mb-1">30</p>
              <p className="text-sm text-slate-400">días Pro Gratis</p>
            </div>
            <span className="text-slate-500 text-2xl hidden sm:block">+</span>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center min-w-[160px]">
              <p className="text-4xl font-bold text-white mb-1">6</p>
              <p className="text-sm text-slate-400">meses Básico Gratis</p>
            </div>
            <span className="text-slate-500 text-2xl hidden sm:block">=</span>
            <div className="bg-emerald-500/20 backdrop-blur border border-emerald-500/30 rounded-2xl p-6 text-center min-w-[160px]">
              <p className="text-4xl font-bold text-emerald-400 mb-1">$0</p>
              <p className="text-sm text-emerald-200/70">Inversión inicial</p>
            </div>
          </div>

          <Link
            to="/beta-registro"
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-emerald-50 transition shadow-xl hover:shadow-emerald-500/20"
          >
            Solicitar acceso beta <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── PRECIOS ─── */}
      <section id="precios" className="py-24 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Precios simples, sin sorpresas
            </h2>
            <p className="text-slate-500 text-lg">
              Elige el plan que se ajuste a tu negocio. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {planes.map((plan) => (
              <div
                key={plan.nombre}
                className={`relative rounded-3xl p-8 flex flex-col ${
                  plan.popular
                    ? "bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-100/50"
                    : "bg-white border border-stone-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                    Más Popular
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.nombre}</h3>
                    <p className="text-sm text-slate-500">
                      {plan.popular ? "Para crecer" : "Para empezar"}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      ${plan.precioMensual.toLocaleString("es-CL")}
                    </span>
                    <span className="text-slate-500">/mes</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    o ${plan.precioAnual.toLocaleString("es-CL")}/año (ahorras 2 meses)
                  </p>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check size={18} className={`shrink-0 mt-0.5 ${plan.popular ? "text-emerald-500" : "text-slate-400"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/beta-registro"
                  className={`block w-full text-center py-3.5 rounded-full font-semibold transition ${
                    plan.popular
                      ? "bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl"
                      : "bg-stone-100 hover:bg-stone-200 text-slate-700"
                  }`}
                >
                  {plan.popular ? "Empezar con Pro" : "Empezar con Básico"}
                </Link>
              </div>
            ))}
          </div>
          
          <p className="text-center text-sm text-slate-400 mt-8">
            🔒 Pago seguro. Sin contratos de permanencia.
          </p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 bg-white border-t border-stone-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Preguntas frecuentes</h2>
            <p className="text-slate-500">Todo lo que necesitas saber antes de empezar.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden">
                <button
                  onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-stone-100/50 transition"
                >
                  <span className="font-semibold text-slate-800 pr-4">{faq.pregunta}</span>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 shrink-0 transition-transform duration-300 ${faqAbierta === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${faqAbierta === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed border-t border-stone-200/50 pt-4">
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
      <section className="py-24 bg-stone-50 border-t border-stone-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            ¿Listo para modernizar tu almacén?
          </h2>
          <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
            Únete al programa beta y empieza a vender mejor hoy mismo. 
            Sin tarjeta de crédito, sin compromiso.
          </p>
          <Link
            to="/beta-registro"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-bold transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Crear cuenta gratis <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-slate-400 mt-6">
            Programa beta limitado. Solicita tu código de invitación.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Loventa</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                El punto de venta diseñado para almacenes de barrio en Chile. 
                Simple, offline y elegante.
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
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © 2026 Loventa. Hecho con ❤️ en Chile.
            </p>
            <p className="text-xs text-slate-500">
              POS Almacén de Barrio — Tu celular, tu caja registradora.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}