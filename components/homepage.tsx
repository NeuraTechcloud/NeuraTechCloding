"use client"

import { useState } from "react"
import { MapPin, Clock, Bell, Shield, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface HomepageProps {
  onGoToLogin: () => void
}

export default function Homepage({ onGoToLogin }: HomepageProps) {
  const [showVideoModal, setShowVideoModal] = useState(false)

  const features = [
    {
      icon: MapPin,
      title: "Localização em Tempo Real",
      description: "Acompanhe seus veículos em tempo real, 24/7, de qualquer dispositivo.",
    },
    {
      icon: Clock,
      title: "Histórico de Rotas",
      description: "Acesse o histórico detalhado de percursos, paradas e velocidades.",
    },
    {
      icon: Bell,
      title: "Alertas Inteligentes",
      description: "Receba notificações de ignição, excesso de velocidade, cercas virtuais e mais.",
    },
    {
      icon: Shield,
      title: "Bloqueio Remoto",
      description: "Em caso de roubo ou furto, bloqueie o veículo com apenas um clique.",
    },
  ]

  const plans = [
    {
      name: "Particular",
      description: "Proteção essencial para seu carro ou moto.",
      price: "R$ 49,90/mês",
      features: ["Localização em tempo real", "Histórico de 30 dias", "Alertas de ignição e cerca"],
      popular: false,
    },
    {
      name: "Frota Essencial",
      description: "Gestão completa para pequenas e médias frotas.",
      price: "R$ 69,90/mês",
      features: ["Todos os recursos do Particular", "Histórico de 90 dias", "Bloqueio Remoto", "Relatórios de paradas"],
      popular: true,
    },
    {
      name: "Corporativo",
      description: "Soluções avançadas para grandes operações.",
      price: "Sob Consulta",
      features: ["Todos os recursos do Frota", "Telemetria avançada", "API para integração", "Suporte dedicado"],
      popular: false,
    },
  ]

  const testimonials = [
    {
      text: "Desde que instalei o RastreRamos na minha frota, a economia de combustível e a otimização das rotas foram notáveis. Plataforma excelente e fácil de usar!",
      author: "João D.",
      role: "Gerente de Logística",
    },
    {
      text: "A segurança do meu carro é prioridade. Com o alerta de ignição e o bloqueio remoto, fico muito mais tranquilo. Recomendo a todos.",
      author: "Mariana S.",
      role: "Cliente Particular",
    },
    {
      text: "O suporte técnico é incrível. Tive uma dúvida sobre relatórios e fui atendido rapidamente. A parceria com a RastreRamos foi um divisor de águas para nossa empresa.",
      author: "Carlos Andrade",
      role: "Diretor, Andrade Transportes",
    },
  ]

  const faqs = [
    {
      question: "A instalação danifica meu veículo?",
      answer:
        "Não. Nossos técnicos são altamente qualificados e a instalação é feita de forma segura, sem alterar a originalidade ou garantia do seu veículo.",
    },
    {
      question: "O rastreador consome a bateria do veículo?",
      answer:
        "O consumo é mínimo. Nossos dispositivos possuem um modo de hibernação inteligente que economiza energia quando o veículo está desligado, não afetando a vida útil da bateria.",
    },
    {
      question: "Posso acessar a localização pelo celular?",
      answer:
        "Sim! Nossa plataforma é totalmente responsiva e pode ser acessada por qualquer navegador de celular. Também oferecemos aplicativos dedicados para Android e iOS.",
    },
    {
      question: "Como funciona o bloqueio em caso de roubo?",
      answer:
        "Através da nossa central de emergência 24h ou pelo seu próprio aplicativo, você pode solicitar o bloqueio. O comando é enviado ao veículo, que interrompe a alimentação de combustível de forma segura, imobilizando-o.",
    },
  ]

  return (
    <div className="bg-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm fixed w-full z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            <a href="#hero" className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-amber-500" />
              <span>RastreRamos</span>
            </a>
          </div>
          <ul className="hidden md:flex items-center space-x-8 text-gray-300">
            <li>
              <a href="#features" className="hover:text-white transition-colors">
                Recursos
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                Como Funciona
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-white transition-colors">
                Planos
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
            </li>
            <li>
              <a href="#quote" className="hover:text-white transition-colors">
                Orçamento
              </a>
            </li>
          </ul>
          <Button onClick={onGoToLogin} className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
            Login
          </Button>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section
          id="hero"
          className="min-h-screen flex items-center bg-gradient-to-r from-black/85 to-black/85 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center"
        >
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Controle Total da Sua Frota na Palma da Sua Mão
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Tecnologia de ponta em rastreamento veicular para garantir a segurança do seu patrimônio e a eficiência da
              sua operação. 24 horas por dia.
            </p>
            <Button className="bg-amber-500 text-black font-bold py-3 px-8 text-lg hover:bg-amber-600 transition-transform transform hover:scale-105">
              <a href="#pricing">Conheça Nossos Planos</a>
            </Button>
          </div>
        </section>

        {/* Video Section */}
        <section id="video-section" className="py-20 bg-black">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Conheça a RastreRamos em Ação</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Veja como nossa plataforma é simples e poderosa. Assista ao vídeo e descubra como podemos transformar a
              gestão da sua frota.
            </p>
            <div
              onClick={() => setShowVideoModal(true)}
              className="relative max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl cursor-pointer group"
            >
              <img
                src="/placeholder.svg?height=400&width=800"
                alt="Vídeo de apresentação da plataforma RastreRamos"
                className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="bg-white/30 backdrop-blur-sm p-6 rounded-full group-hover:bg-white/40 transition-all duration-300">
                  <Play className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Recursos que Fazem a Diferença</h2>
              <p className="text-gray-400 mt-2">Tudo o que você precisa para uma gestão completa e segura.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-8 rounded-xl shadow-lg text-center transition-transform transform hover:-translate-y-2"
                >
                  <div className="bg-amber-900/50 text-amber-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Simples, Rápido e Eficiente</h2>
              <p className="text-gray-400 mt-2">Comece a rastrear em apenas 3 passos.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="text-5xl font-extrabold text-amber-500 mb-2">1</div>
                <h3 className="text-xl font-bold mb-2">Instalação Profissional</h3>
                <p className="text-gray-400">
                  Nossos técnicos instalam o dispositivo de forma rápida e segura no seu veículo.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-extrabold text-amber-500 mb-2">2</div>
                <h3 className="text-xl font-bold mb-2">Acesso à Plataforma</h3>
                <p className="text-gray-400">
                  Você recebe seu login e senha para acessar nosso sistema via web ou app.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-extrabold text-amber-500 mb-2">3</div>
                <h3 className="text-xl font-bold mb-2">Monitore 24/7</h3>
                <p className="text-gray-400">Pronto! Acompanhe tudo em tempo real e tenha controle total.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Planos Flexíveis para Você</h2>
              <p className="text-gray-400 mt-2">Escolha o plano que melhor se adapta à sua necessidade.</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-gray-800 rounded-xl p-8 flex flex-col hover:shadow-xl transition-shadow ${plan.popular ? "border-2 border-amber-500 relative shadow-2xl transform hover:scale-105" : "border border-gray-700"}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 -translate-y-1/2 bg-amber-500 text-black px-4 py-1 text-sm font-bold rounded-full">
                      MAIS POPULAR
                    </div>
                  )}
                  <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-amber-500" : ""}`}>{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="my-4">
                    <span className="text-4xl font-extrabold">{plan.price.split("/")[0]}</span>
                    {plan.price.includes("/") && <span className="text-gray-500">/{plan.price.split("/")[1]}</span>}
                  </div>
                  <ul className="space-y-3 text-gray-300 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`mt-8 w-full font-bold py-3 px-6 transition-colors ${plan.popular ? "bg-amber-500 hover:bg-amber-600 text-black" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                  >
                    {plan.name === "Corporativo" ? "Fale Conosco" : "Contratar Agora"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">O que Nossos Clientes Dizem</h2>
              <p className="text-gray-400 mt-2">A confiança de quem usa e aprova nossos serviços.</p>
            </div>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-900 p-8 rounded-xl shadow-lg">
                  <p className="text-gray-300 mb-4">"{testimonial.text}"</p>
                  <div className="font-bold">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-gray-900">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Perguntas Frequentes</h2>
              <p className="text-gray-400 mt-2">Tire suas dúvidas sobre nossos serviços.</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-gray-800 p-6 rounded-lg group">
                  <summary className="font-semibold cursor-pointer flex justify-between items-center">
                    {faq.question}
                    <span className="transform transition-transform duration-300 group-open:rotate-180">+</span>
                  </summary>
                  <p className="mt-4 text-gray-400">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section id="quote" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="bg-gray-900 p-8 md:p-12 rounded-2xl shadow-xl">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold">Solicite um Orçamento</h2>
                  <p className="text-gray-400 mt-2 mb-6">
                    Fale com nossos especialistas e descubra a solução ideal para você ou sua empresa. Sem compromisso.
                  </p>
                  <form className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Seu nome completo"
                      className="bg-gray-800 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <Input
                      type="email"
                      placeholder="Seu melhor e-mail"
                      className="bg-gray-800 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <Input
                      type="tel"
                      placeholder="Telefone / WhatsApp"
                      className="bg-gray-800 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <Textarea
                      placeholder="Como podemos ajudar? (Ex: Quantidade de veículos...)"
                      rows={4}
                      className="bg-gray-800 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <Button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6"
                    >
                      Enviar Solicitação
                    </Button>
                  </form>
                </div>
                <div className="hidden md:block text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-48 h-48 mx-auto text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="mt-4 text-gray-400">Nossa equipe entrará em contato em breve!</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black text-gray-400 py-8 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2024 RastreRamos. Todos os direitos reservados.</p>
          <p className="text-sm text-gray-500 mt-1">Segurança e tecnologia para o seu caminho.</p>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 transition-opacity duration-300">
          <button
            onClick={() => setShowVideoModal(false)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
          >
            &times;
          </button>
          <div className="w-full max-w-4xl aspect-video p-4">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/JAUGTeG1nJs?autoplay=1&rel=0"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}
