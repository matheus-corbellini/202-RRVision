import React from "react";
import { useOperator } from "../../hooks/useOperator";
import "./OperatorProfile.css";

/**
 * Componente para exibir informações do perfil do operador
 * Demonstra como acessar e exibir dados de múltiplos setores/atividades
 */
const OperatorProfile: React.FC = () => {
	const {
		isOperator,
		getOperatorCode,
		getPrimarySector,
		getSecondarySectors,
		getAllSectors,
		getTrainedActivities,
		getStatus,
		isActive,
		getSupervisor,
		getTeam,
		getSkills,
		getCertifications,
		getTrainingInfo,
		getContractInfo,
		canExecuteActivity,
		canWorkInSector,
	} = useOperator();

	// Se não for operador, não renderizar nada
	if (!isOperator()) {
		return null;
	}

	const trainingInfo = getTrainingInfo();
	const contractInfo = getContractInfo();
	const supervisor = getSupervisor();
	const team = getTeam();

	return (
		<div className="operator-profile">
			<div className="profile-header">
				<h2>Perfil do Operador</h2>
				<div className={`status-badge ${isActive() ? "active" : "inactive"}`}>
					{getStatus()}
				</div>
			</div>

			<div className="profile-content">
				{/* Informações básicas */}
				<section className="profile-section">
					<h3>Informações Básicas</h3>
					<div className="info-grid">
						<div className="info-item">
							<label>Código:</label>
							<span>{getOperatorCode()}</span>
						</div>
						<div className="info-item">
							<label>Status:</label>
							<span className={isActive() ? "active" : "inactive"}>
								{getStatus()}
							</span>
						</div>
					</div>
				</section>

				{/* Setores e Atividades */}
				<section className="profile-section">
					<h3>Setores e Atividades</h3>
					
					<div className="sectors-info">
						<div className="sector-group">
							<h4>Setor Principal</h4>
							<div className="sector-item primary">
								{getPrimarySector()}
							</div>
						</div>

						{getSecondarySectors().length > 0 && (
							<div className="sector-group">
								<h4>Setores Secundários</h4>
								<div className="sectors-list">
									{getSecondarySectors().map((sector, index) => (
										<div key={index} className="sector-item secondary">
											{sector}
										</div>
									))}
								</div>
							</div>
						)}

						<div className="sector-group">
							<h4>Todos os Setores</h4>
							<div className="sectors-list">
								{getAllSectors().map((sector, index) => (
									<div 
										key={index} 
										className={`sector-item ${
											sector === getPrimarySector() ? "primary" : "secondary"
										}`}
									>
										{sector}
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="activities-info">
						<h4>Atividades Treinadas</h4>
						{getTrainedActivities().length > 0 ? (
							<div className="activities-list">
								{getTrainedActivities().map((activity, index) => (
									<div key={index} className="activity-item">
										{activity}
									</div>
								))}
							</div>
						) : (
							<p className="no-data">Nenhuma atividade treinada</p>
						)}
					</div>
				</section>

				{/* Habilidades e Certificações */}
				<section className="profile-section">
					<h3>Habilidades e Certificações</h3>
					
					<div className="skills-info">
						<h4>Habilidades</h4>
						{getSkills().length > 0 ? (
							<div className="skills-list">
								{getSkills().map((skill, index) => (
									<span key={index} className="skill-tag">
										{skill}
									</span>
								))}
							</div>
						) : (
							<p className="no-data">Nenhuma habilidade registrada</p>
						)}
					</div>

					<div className="certifications-info">
						<h4>Certificações</h4>
						{getCertifications().length > 0 ? (
							<div className="certifications-list">
								{getCertifications().map((cert, index) => (
									<div key={index} className="certification-item">
										<div className="cert-name">{cert.name}</div>
										<div className="cert-issuer">{cert.issuer}</div>
										<div className="cert-date">
											Emitida em: {new Date(cert.issuedDate).toLocaleDateString()}
										</div>
										{cert.expiryDate && (
											<div className="cert-expiry">
												Expira em: {new Date(cert.expiryDate).toLocaleDateString()}
											</div>
										)}
									</div>
								))}
							</div>
						) : (
							<p className="no-data">Nenhuma certificação registrada</p>
						)}
					</div>
				</section>

				{/* Informações de Treinamento */}
				<section className="profile-section">
					<h3>Informações de Treinamento</h3>
					<div className="info-grid">
						<div className="info-item">
							<label>Data de Admissão:</label>
							<span>
								{trainingInfo.admissionDate 
									? new Date(trainingInfo.admissionDate).toLocaleDateString()
									: "Não informado"
								}
							</span>
						</div>
						<div className="info-item">
							<label>Último Treinamento:</label>
							<span>
								{trainingInfo.lastTraining 
									? new Date(trainingInfo.lastTraining).toLocaleDateString()
									: "Nenhum"
								}
							</span>
						</div>
						<div className="info-item">
							<label>Próximo Treinamento:</label>
							<span>
								{trainingInfo.nextTraining 
									? new Date(trainingInfo.nextTraining).toLocaleDateString()
									: "Não agendado"
								}
							</span>
						</div>
					</div>
				</section>

				{/* Informações Contratuais */}
				<section className="profile-section">
					<h3>Informações Contratuais</h3>
					<div className="info-grid">
						<div className="info-item">
							<label>Tipo de Contrato:</label>
							<span>{contractInfo.type}</span>
						</div>
						<div className="info-item">
							<label>Jornada de Trabalho:</label>
							<span>{contractInfo.workSchedule}</span>
						</div>
						<div className="info-item">
							<label>Horas Semanais:</label>
							<span>{contractInfo.weeklyHours}h</span>
						</div>
					</div>
				</section>

				{/* Relacionamentos */}
				<section className="profile-section">
					<h3>Relacionamentos</h3>
					<div className="info-grid">
						<div className="info-item">
							<label>Supervisor:</label>
							<span>
								{supervisor.name || "Não atribuído"}
								{supervisor.id && ` (ID: ${supervisor.id})`}
							</span>
						</div>
						<div className="info-item">
							<label>Equipe:</label>
							<span>
								{team.name || "Não atribuído"}
								{team.id && ` (ID: ${team.id})`}
							</span>
						</div>
					</div>
				</section>

				{/* Demonstração de Funcionalidades */}
				<section className="profile-section">
					<h3>Funcionalidades de Verificação</h3>
					<div className="verification-demo">
						<div className="demo-item">
							<label>Pode trabalhar no setor "Produção":</label>
							<span className={canWorkInSector("Produção") ? "yes" : "no"}>
								{canWorkInSector("Produção") ? "Sim" : "Não"}
							</span>
						</div>
						<div className="demo-item">
							<label>Pode executar atividade "Soldagem":</label>
							<span className={canExecuteActivity("Soldagem") ? "yes" : "no"}>
								{canExecuteActivity("Soldagem") ? "Sim" : "Não"}
							</span>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default OperatorProfile;
