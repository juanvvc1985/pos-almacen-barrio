import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Store, WifiOff, Smartphone, BarChart3, ShieldCheck, Zap, 
  Users, Package, CreditCard, Check, ArrowRight, Menu, X, 
  Clock, Gift, Crown, Star, ChevronDown, Leaf, Snowflake,
  TrendingUp, AlertCircle, MousePointer2
} from "lucide-react";

export default function LandingPage() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [faqAbierta, setFaqAbierta] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const caracteristicas = [
    {
      icon: <WifiOff className="w-6 h-6" />,
      titulo: "Offline First Real",
      desc: "Vende sin internet. Tus datos se guardan localmente y se sincronizan mágicamente cuando recuperas conexión.",
      color: "emerald"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      titulo: "Tu Celular es tu Caja",
      desc: "Olvídate del hardware costoso. Funciona perfecto en cualquier smartphone Android o iPhone moderno.",
      color: "blue"
    },
    {
      icon: <Package className="w-6 h-6" />,
      titulo: "Stock Inteligente",
      desc: "Controla inventario, lotes y vencimientos con alertas automáticas antes de que falte producto.",
      color: "amber"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      titulo: "Reportes Claros",
      desc: "Visualiza ventas diarias, productos top y fiados pendientes en gráficos limpios y fáciles de leer.",
      color: "purple"
    },
    {
      icon: <Users className="w-6 h-6" />,
      titulo: "Multi-Vendedor",
      desc: "Crea usuarios para tu equipo con permisos granulares. Sabrás quién vendió qué y cuándo.",
      color: "pink"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      titulo: "Fiados Seguros",
      desc: "Registra deudas de clientes de confianza con historial de pagos y recordatorios automáticos.",
      color: "cyan"
    },
  ];

  const planes = [
    {
      nombre: "Básico",
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
      pregunta: "¿Realmente funciona sin internet?",
      respuesta: "Sí, absolutamente. La aplicación guarda todo localmente en tu dispositivo. Puedes vender, registrar fiados y agregar productos sin señal. Todo se sube a la nube en segundo plano cuando tengas WiFi o datos.",
    },
    {
      pregunta: "¿Puedo usarlo en mi computador?",
      respuesta: "Sí, Loventa es una aplicación web responsive. Funciona perfectamente en celulares, tablets y computadores. Solo necesitas un navegador moderno como Chrome o Safari.",
    },
    {
      pregunta: "¿Qué pasa si pierdo mi celular?",
      respuesta: "Tus datos están seguros en la nube de Firebase (Google). Solo inicia sesión desde otro dispositivo y recuperas toda tu información al instante.",
    },
    {
      pregunta: "¿Cómo funciona el programa beta?",
      respuesta: "Si tienes un código de invitación, obtienes 30 días de prueba completa del Plan Pro + 6 meses gratis del Plan Básico. Después eliges si quedarte pagando o no.",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* ─── NAVBAR FLOTANTE ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-3 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm" : "py-5 bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${scrolled ? "bg-slate-900" : "bg-white/10 backdrop-blur-sm border border-white/20"}`}>
              <Store className={`w-5 h-5 ${scrolled ? "text-emerald-400" : "text-white"}`} />
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? "text-slate-900" : "text-white"}`}>
              Loventa<span className="text-emerald-500">.</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#caracteristicas" className={`text-sm font-medium transition-colors hover:text-emerald-500 ${scrolled ? "text-slate-600" : "text-white/90"}`}>Características</a>
            <a href="#precios" className={`text-sm font-medium transition-colors hover:text-emerald-500 ${scrolled ? "text-slate-600" : "text-white/90"}`}>Precios</a>
            <a href="#faq" className={`text-sm font-medium transition-colors hover:text-emerald-500 ${scrolled ? "text-slate-600" : "text-white/90"}`}>FAQ</a>
            <Link
              to="/beta-registro"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              Empezar Gratis
            </Link>
            <Link
              to="/login"
              className={`text-sm font-medium transition-colors hover:text-emerald-500 ${scrolled ? "text-slate-900" : "text-white"}`}
            >
              Iniciar sesión
            </Link>
          </div>

          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
          >
            {menuAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuAbierto && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-stone-200 shadow-xl p-4 space-y-3 animate-in slide-in-from-top-5">
            <a href="#caracteristicas" onClick={() => setMenuAbierto(false)} className="block text-slate-600 py-2 font-medium hover:text-emerald-600">Características</a>
            <a href="#precios" onClick={() => setMenuAbierto(false)} className="block text-slate-600 py-2 font-medium hover:text-emerald-600">Precios</a>
            <a href="#faq" onClick={() => setMenuAbierto(false)} className="block text-slate-600 py-2 font-medium hover:text-emerald-600">FAQ</a>
            <Link to="/beta-registro" onClick={() => setMenuAbierto(false)} className="block bg-emerald-500 text-white text-center py-3 rounded-xl font-semibold">Empezar Gratis</Link>
            <Link to="/login" onClick={() => setMenuAbierto(false)} className="block text-center text-slate-900 py-2 font-medium border border-slate-200 rounded-xl">Iniciar sesión</Link>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden bg-slate-900">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Programa Beta Abierto — 7 meses gratis
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-8 tracking-tight animate-fade-in-up animation-delay-100">
            El POS que tu almacén <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400">
              realmente necesita
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
            Vende sin internet. Controla tu stock. Registra fiados. 
            Todo desde tu celular, con un diseño limpio, moderno y que inspira confianza.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
            <Link
              to="/beta-registro"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 flex items-center justify-center gap-2 group"
            >
              Empezar Gratis 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#caracteristicas"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-full text-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20 pt-10 border-t border-white/10 animate-fade-in-up animation-delay-500">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">100%</p>
              <p className="text-sm text-slate-400 mt-1">Offline</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">$5.990</p>
              <p className="text-sm text-slate-400 mt-1">Desde /mes</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">0</p>
              <p className="text-sm text-slate-400 mt-1">Complicaciones</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CARACTERÍSTICAS ─── */}
      <section id="caracteristicas" className="py-24 bg-stone-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
              <div key={i} className="group bg-white rounded-2xl p-8 border border-stone-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 bg-${c.color}-50 text-${c.color}-600`}>
                  {c.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{c.titulo}</h3>
                <p className="text-slate-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANNER BETA ─── */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-emerald-500/30">
            <Star size={14} className="fill-current" />
            Oferta Limitada Beta
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Únete ahora y vende gratis <br/>por más de 6 meses
          </h2>
          <p className="text-slate-300 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
            Los primeros usuarios obtienen acceso completo al Plan Pro por 30 días, 
            y luego 6 meses adicionales del Plan Básico totalmente gratis.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center min-w-[160px] w-full sm:w-auto">
              <p className="text-4xl font-bold text-white mb-1">30</p>
              <p className="text-sm text-slate-400">días Pro Gratis</p>
            </div>
            <span className="text-slate-500 text-2xl hidden sm:block">+</span>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center min-w-[160px] w-full sm:w-auto">
              <p className="text-4xl font-bold text-white mb-1">6</p>
              <p className="text-sm text-slate-400">meses Básico Gratis</p>
            </div>
            <span className="text-slate-500 text-2xl hidden sm:block">=</span>
            <div className="bg-emerald-500/20 backdrop-blur border border-emerald-500/30 rounded-2xl p-6 text-center min-w-[160px] w-full sm:w-auto">
              <p className="text-4xl font-bold text-emerald-400 mb-1">$0</p>
              <p className="text-sm text-emerald-200/70">Inversión inicial</p>
            </div>
          </div>

          <Link
            to="/beta-registro"
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-emerald-50 transition-all shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1"
          >
            Solicitar acceso beta <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── PRECIOS ─── */}
      <section id="precios" className="py-24 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Precios simples, sin sorpresas
            </h2>
            <p className="text-slate-500 text-lg">
              Elige el plan que se ajuste a tu negocio. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
            {planes.map((plan) => (
              <div
                key={plan.nombre}
                className={`relative rounded-3xl p-8 flex flex-col h-full ${
                  plan.popular
                    ? "bg-slate-900 text-white border-2 border-emerald-500 shadow-2xl shadow-emerald-900/20 scale-105 z-10"
                    : "bg-white text-slate-900 border border-stone-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                    Más Popular
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-100 text-slate-600"
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.nombre}</h3>
                    <p className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                      {plan.popular ? "Para crecer" : "Para empezar"}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
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
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check size={18} className={`shrink-0 mt-0.5 ${plan.popular ? "text-emerald-400" : "text-emerald-500"}`} />
                      <span className={plan.popular ? "text-slate-300" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/beta-registro"
                  className={`block w-full text-center py-3.5 rounded-xl font-bold transition-all ${
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {plan.popular ? "Empezar con Pro" : "Empezar con Básico"}
                </Link>
              </div>
            ))}
          </div>
          
          <p className="text-center text-sm text-slate-400 mt-8 flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> Pago seguro. Sin contratos de permanencia.
          </p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 bg-white border-t border-stone-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Preguntas frecuentes</h2>
            <p className="text-slate-500">Todo lo que necesitas saber antes de empezar.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden transition-all duration-300 hover:border-stone-200">
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
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-emerald-400" />
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
                <li><a href="#caracteristicas" className="hover:text-emerald-400 transition">Características</a></li>
                <li><a href="#precios" className="hover:text-emerald-400 transition">Precios</a></li>
                <li><Link to="/beta-registro" className="hover:text-emerald-400 transition">Programa Beta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Cuenta</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-emerald-400 transition">Iniciar sesión</Link></li>
                <li><Link to="/beta-registro" className="hover:text-emerald-400 transition">Registrarme</Link></li>
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