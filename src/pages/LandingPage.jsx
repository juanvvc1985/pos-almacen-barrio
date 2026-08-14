import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Store, WifiOff, Smartphone, BarChart3, Shield, Zap,
  Users, Package, CreditCard, Check, ArrowRight, Menu, X,
  Clock, Gift, Crown, Star, ChevronDown
} from "lucide-react";

export default function LandingPage() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [faqAbierta, setFaqAbierta] = useState(null);

  const caracteristicas = [
    {
      icon: <WifiOff className="w-8 h-8 text-blue-600" />,
      titulo: "100% Offline",
      desc: "Vende sin internet. Todo se guarda localmente y se sincroniza cuando vuelvas a conectar.",
    },
    {
      icon: <Smartphone className="w-8 h-8 text-green-600" />,
      titulo: "Desde tu celular",
      desc: "No necesitas computador ni caja registradora. Tu celular es tu POS.",
    },
    {
      icon: <Package className="w-8 h-8 text-purple-600" />,
      titulo: "Control de stock",
      desc: "Sabe exactamente qué tienes, qué se vende más y qué está por agotarse.",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      titulo: "Reportes claros",
      desc: "Ventas por día, producto, vendedor. Toma decisiones con datos reales.",
    },
    {
      icon: <Users className="w-8 h-8 text-pink-600" />,
      titulo: "Multi-vendedor",
      desc: "Cada vendedor con su usuario. Controla quién puede vender, editar o ver reportes.",
    },
    {
      icon: <Shield className="w-8 h-8 text-teal-600" />,
      titulo: "Fiados seguros",
      desc: "Registra deudas de clientes con nombre, teléfono y dirección. Nunca pierdas una cuenta.",
    },
  ];

  const planes = [
    {
      nombre: "Básico",
      precioMensual: 5990,
      precioAnual: 59900,
      icon: <Zap className="w-6 h-6" />,
      color: "blue",
      popular: false,
      features: [
        "Hasta 500 productos",
        "1 vendedor",
        "POS 100% offline",
        "Control de stock",
        "Ventas y fiados",
        "Reportes básicos",
        "Soporte por email",
      ],
    },
    {
      nombre: "Pro",
      precioMensual: 11990,
      precioAnual: 119900,
      icon: <Crown className="w-6 h-6" />,
      color: "purple",
      popular: true,
      features: [
        "Productos ilimitados",
        "Vendedores ilimitados",
        "POS 100% offline",
        "Reportes avanzados",
        "Multi-sucursal",
        "Ofertas y promociones",
        "Soporte prioritario",
        "Exportar datos",
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
    <div className="min-h-screen bg-white">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loventa
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#caracteristicas" className="text-sm text-gray-600 hover:text-gray-900 transition">Características</a>
            <a href="#precios" className="text-sm text-gray-600 hover:text-gray-900 transition">Precios</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition">FAQ</a>
            <Link
              to="/beta-registro"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Registrarme
            </Link>
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {menuAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuAbierto && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <a href="#caracteristicas" onClick={() => setMenuAbierto(false)} className="block text-gray-600 py-2">Características</a>
            <a href="#precios" onClick={() => setMenuAbierto(false)} className="block text-gray-600 py-2">Precios</a>
            <a href="#faq" onClick={() => setMenuAbierto(false)} className="block text-gray-600 py-2">FAQ</a>
            <Link to="/beta-registro" onClick={() => setMenuAbierto(false)} className="block bg-blue-600 text-white text-center py-2.5 rounded-lg font-medium">Registrarme</Link>
            <Link to="/login" onClick={() => setMenuAbierto(false)} className="block text-center text-blue-600 py-2 font-medium">Iniciar sesión</Link>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Gift size={14} />
            Programa beta abierto — 30 días de prueba + 6 meses gratis
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            El POS que tu almacén
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              de barrio necesita
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8">
            Vende sin internet. Controla tu stock. Registra fiados. Todo desde tu celular.
            <strong className="text-gray-700"> Sin computador, sin caja registradora, sin complicaciones.</strong>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/beta-registro"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              Empezar gratis <ArrowRight size={20} />
            </Link>
            <a
              href="#caracteristicas"
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-medium transition flex items-center justify-center gap-2"
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 pt-8 border-t border-gray-100">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">100%</p>
              <p className="text-sm text-gray-500">Offline</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">$5.990</p>
              <p className="text-sm text-gray-500">Desde /mes</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">0</p>
              <p className="text-sm text-gray-500">Complicaciones</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CARACTERÍSTICAS ─── */}
      <section id="caracteristicas" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para vender mejor
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Diseñado específicamente para almacenes de barrio, ferias libres y negocios pequeños de Chile.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caracteristicas.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition group">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  {c.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{c.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANNER BETA ─── */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Star size={14} />
            Programa Beta Exclusivo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Únete ahora y vende gratis por 6 meses y medio
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Los primeros usuarios beta obtienen acceso completo al Plan Pro por 30 días,
            y luego 6 meses adicionales completamente gratis como agradecimiento.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center text-white min-w-[140px]">
              <p className="text-3xl font-bold">30</p>
              <p className="text-sm text-blue-100">días de prueba Pro</p>
            </div>
            <span className="text-white/50 text-2xl hidden sm:block">+</span>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center text-white min-w-[140px]">
              <p className="text-3xl font-bold">6</p>
              <p className="text-sm text-blue-100">meses gratis</p>
            </div>
            <span className="text-white/50 text-2xl hidden sm:block">=</span>
            <div className="bg-white rounded-xl p-4 text-center min-w-[140px]">
              <p className="text-3xl font-bold text-blue-600">$0</p>
              <p className="text-sm text-gray-500">Por más de 7 meses</p>
            </div>
          </div>
          <Link
            to="/beta-registro"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold mt-8 hover:bg-blue-50 transition shadow-xl"
          >
            Solicitar acceso beta <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── PRECIOS ─── */}
      <section id="precios" className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Precios simples, sin sorpresas
            </h2>
            <p className="text-gray-500 text-lg">
              Elige el plan que se ajuste a tu negocio. Paga mensual o anual y ahorra 2 meses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {planes.map((plan) => (
              <div
                key={plan.nombre}
                className={`relative rounded-2xl border-2 p-8 ${
                  plan.popular
                    ? "border-purple-500 shadow-xl shadow-purple-100"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    Más popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{plan.nombre}</h3>
                    <p className="text-sm text-gray-500">
                      {plan.popular ? "Para negocios en crecimiento" : "Para empezar"}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.precioMensual.toLocaleString("es-CL")}
                    </span>
                    <span className="text-gray-500">/mes</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    o ${plan.precioAnual.toLocaleString("es-CL")}/año (ahorras 2 meses)
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/beta-registro"
                  className={`block w-full text-center py-3 rounded-xl font-bold transition ${
                    plan.popular
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                >
                  {plan.popular ? "Empezar con Pro" : "Empezar con Básico"}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            🔒 Pago seguro. Cancela cuando quieras. Sin contratos de permanencia.
          </p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Preguntas frecuentes</h2>
            <p className="text-gray-500">Todo lo que necesitas saber antes de empezar.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-800">{faq.pregunta}</span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${faqAbierta === i ? "rotate-180" : ""}`}
                  />
                </button>
                {faqAbierta === i && (
                  <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">
                    {faq.respuesta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Listo para modernizar tu almacén?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Únete al programa beta y empieza a vender mejor hoy mismo.
            Sin tarjeta de crédito, sin compromiso.
          </p>
          <Link
            to="/beta-registro"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition shadow-lg shadow-blue-200"
          >
            Crear cuenta gratis <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-gray-400 mt-4">
            Programa beta limitado. Solicita tu código de invitación.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Loventa</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                El punto de venta diseñado para almacenes de barrio en Chile.
                Vende offline, controla tu stock y haz crecer tu negocio.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#caracteristicas" className="hover:text-white transition">Características</a></li>
                <li><a href="#precios" className="hover:text-white transition">Precios</a></li>
                <li><Link to="/beta-registro" className="hover:text-white transition">Programa Beta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Cuenta</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition">Iniciar sesión</Link></li>
                <li><Link to="/beta-registro" className="hover:text-white transition">Registrarme</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © 2026 Loventa. Hecho con ❤️ en Chile.
            </p>
            <p className="text-xs text-gray-500">
              POS Almacén de Barrio — Tu celular, tu caja registradora.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
