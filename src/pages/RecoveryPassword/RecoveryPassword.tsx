"use client";
import "./RecoveryPassword.css";
import { useState } from "react";
import type React from "react";
import { HiMail, HiArrowLeft, HiCheckCircle } from "react-icons/hi";

import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { useNavigation } from "../../hooks/useNavigation";
import { path } from "../../routes/path";

export default function RecoveryPassword() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const { goTo } = useNavigation();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (error) setError("");
		setEmail(e.target.value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim()) {
			setError("Por favor, insira seu e-mail");
			return;
		}

		setLoading(true);
		setError("");

		try {
			// Simular envio de e-mail de recuperação
			await new Promise((resolve) => setTimeout(resolve, 2000));

			setSuccess(true);
			setLoading(false);
		} catch (err) {
			setError("Erro ao enviar e-mail de recuperação. Tente novamente.");
			setLoading(false);
		}
	};

	const handleBackToLogin = () => {
		goTo(path.login);
	};

	const handleBackToLanding = () => {
		goTo(path.landing);
	};

	if (success) {
		return (
			<div className="recovery-page">
				<button
					className="back-to-landing-btn"
					onClick={handleBackToLanding}
					disabled={loading}
					title="Voltar à página inicial"
				>
					<HiArrowLeft />
				</button>
				<div className="recovery-container">
					<div className="recovery-card">
						<div className="recovery-header">
							<div className="success-icon">
								<HiCheckCircle />
							</div>
							<h1>E-mail Enviado!</h1>
							<p>Verifique sua caixa de entrada</p>
						</div>

						<div className="recovery-success-message">
							<p>
								Enviamos um link de recuperação para <strong>{email}</strong>
							</p>
							<p>
								Clique no link recebido para redefinir sua senha. O link expira
								em 1 hora.
							</p>
						</div>

						<div className="recovery-actions">
							<Button variant="secondary" fullWidth onClick={handleBackToLogin}>
								Voltar ao Login
							</Button>

							<Button
								variant="outline"
								fullWidth
								onClick={() => {
									setSuccess(false);
									setEmail("");
								}}
							>
								Enviar Novamente
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="recovery-page">
			<button
				className="back-to-landing-btn"
				onClick={handleBackToLanding}
				disabled={loading}
				title="Voltar à página inicial"
			>
				<HiArrowLeft />
			</button>
			<div className="recovery-container">
				<div className="recovery-card">
					<div className="recovery-header">
						<h1>Recuperar Senha</h1>
						<p>Digite seu e-mail para receber o link de recuperação</p>
					</div>

					<form onSubmit={handleSubmit} className="recovery-form">
						{error && (
							<div
								className="error-message"
								style={{
									color: "#e53e3e",
									backgroundColor: "#fed7d7",
									padding: "0.75rem",
									borderRadius: "0.375rem",
									marginBottom: "1rem",
									fontSize: "0.875rem",
								}}
							>
								{error}
							</div>
						)}

						<Input
							type="email"
							name="email"
							placeholder="Digite seu e-mail"
							value={email}
							onChange={handleChange}
							required
							disabled={loading}
							icon={<HiMail />}
						/>

						<Button
							type="submit"
							variant="primary"
							fullWidth
							disabled={loading || !email.trim()}
						>
							{loading ? "Enviando..." : "Enviar Link de Recuperação"}
						</Button>
					</form>

					<div className="recovery-footer">
						<button
							className="back-button"
							onClick={handleBackToLogin}
							disabled={loading}
							style={{
								cursor: loading ? "not-allowed" : "pointer",
								opacity: loading ? 0.6 : 1,
							}}
						>
							<HiArrowLeft />
							Voltar ao Login
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
