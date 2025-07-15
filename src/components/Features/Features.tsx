import "./Features.css";

export default function Features() {
  const features = [
    {
      icon: "🔄",
      title: "Integração ERP Bling",
      description:
        "Sincronização automática de dados do ERP para otimizar o planejamento de produção",
    },
    {
      icon: "👥",
      title: "Alocação Inteligente",
      description:
        "Distribuição de operadores baseada em habilidades e disponibilidade",
    },
    {
      icon: "📊",
      title: "Dashboards em Tempo Real",
      description:
        "Monitoramento da eficiência e produtividade com métricas atualizadas",
    },
    {
      icon: "⚡",
      title: "Execução Assistida",
      description:
        "Roteiros detalhados para guiar operadores durante a produção",
    },
    {
      icon: "🔍",
      title: "Controle de Qualidade",
      description: "Registro e acompanhamento de não conformidades",
    },
    {
      icon: "📱",
      title: "Alertas Automáticos",
      description: "Notificações inteligentes para otimizar o fluxo produtivo",
    },
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <div className="section-header">
          <h2>Recursos Principais</h2>
          <p>Tudo que você precisa para otimizar sua produção industrial</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
