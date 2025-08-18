"use client";
import { useState } from "react";
import type React from "react";

import Button from "../Button/Button";
import Input from "../Input/Input";
import "./Contact.css";

export default function Contact() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		company: "",
		message: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Contact form:", formData);
	};

	return (
		<section id="contact" className="contact">
			<div className="container">
				<div className="section-header">
					<h2>Entre em Contato</h2>
					<p>Fale conosco para saber mais sobre o RR Vision Brazil</p>
				</div>

				<div className="contact-content">
					<div className="contact-info">
						<div className="contact-item">
							<div className="contact-icon">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M22 6L12 13L2 6"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
							<div>
								<h4>E-mail</h4>
								<p>contato@rrvisionbrazil.com</p>
							</div>
						</div>

						<div className="contact-item">
							<div className="contact-icon">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2136 21.3521 21.4019C21.1469 21.5902 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0973 21.9454 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3146 6.72533 15.2661 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09456 3.90347 2.12787 3.62461 2.21649 3.36152C2.30512 3.09843 2.44756 2.85687 2.63483 2.65231C2.8221 2.44775 3.0498 2.28477 3.30349 2.17351C3.55718 2.06225 3.83148 2.00489 4.10999 2.00001H7.10999C7.59522 1.99522 8.06569 2.16708 8.43373 2.48353C8.80177 2.79999 9.04201 3.23945 9.10999 3.72001C9.23662 4.68007 9.47144 5.62273 9.80999 6.53001C9.94454 6.88792 9.97348 7.27675 9.89382 7.65369C9.81416 8.03063 9.62884 8.38332 9.35999 8.67001L8.08999 9.94001C9.51355 12.5795 11.4205 14.4865 14.06 15.91L15.33 14.64C15.6167 14.3712 15.9694 14.1858 16.3463 14.1062C16.7233 14.0265 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
							<div>
								<h4>Telefone</h4>
								<p>(11) 9999-9999</p>
							</div>
						</div>

						<div className="contact-item">
							<div className="contact-icon">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
							<div>
								<h4>Endereço</h4>
								<p>São Paulo, SP - Brasil</p>
							</div>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="contact-form">
						<div className="form-row">
							<Input
								type="text"
								name="name"
								placeholder="Seu nome"
								value={formData.name}
								onChange={handleChange}
								required
							/>
							<Input
								type="email"
								name="email"
								placeholder="Seu e-mail"
								value={formData.email}
								onChange={handleChange}
								required
							/>
						</div>

						<Input
							type="text"
							name="company"
							placeholder="Empresa"
							value={formData.company}
							onChange={handleChange}
							required
						/>

						<textarea
							name="message"
							placeholder="Sua mensagem"
							value={formData.message}
							onChange={handleChange}
							className="contact-textarea"
							rows={5}
							required
						/>

						<Button type="submit" variant="primary" fullWidth>
							Enviar Mensagem
						</Button>
					</form>
				</div>
			</div>
		</section>
	);
}
