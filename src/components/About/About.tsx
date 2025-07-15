import "./About.css";

export default function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h2>Sobre o RR Vision Brazil</h2>
            <p>
              Nossa plataforma foi desenvolvida especificamente para atender às
              necessidades da indústria brasileira, oferecendo uma solução
              completa para automação do controle de produção.
            </p>
            <p>
              Com foco na integração de dados e otimização de processos, o RR
              Vision Brazil permite que gestores e operadores trabalhem de forma
              mais eficiente, reduzindo custos e aumentando a produtividade.
            </p>

            <div className="stats">
              <div className="stat">
                <div className="stat-number">500+</div>
                <div className="stat-label">Empresas Atendidas</div>
              </div>
              <div className="stat">
                <div className="stat-number">25%</div>
                <div className="stat-label">Aumento Médio de Eficiência</div>
              </div>
              <div className="stat">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Suporte Técnico</div>
              </div>
            </div>
          </div>

          <div className="about-image">
            <div className="process-flow">
              <div className="flow-step">
                <div className="step-number">1</div>
                <div className="step-title">Planejamento</div>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="step-number">2</div>
                <div className="step-title">Execução</div>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="step-number">3</div>
                <div className="step-title">Monitoramento</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
