"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import {
	listAllUsers,
	updateUserRecord,
	deleteUserRecord,
	createUserRecord,
} from "../../services/dataService";
import type { User, UserRole } from "../../types";
import "./Admin.css";

export default function Admin() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<User | null>(null);

	// Toasts
	const [toasts, setToasts] = useState<
		Array<{ id: number; type: "success" | "error"; message: string }>
	>([]);
	const showToast = (
		message: string,
		type: "success" | "error" = "success"
	) => {
		const id = Date.now();
		setToasts((prev) => [...prev, { id, type, message }]);
		setTimeout(
			() => setToasts((prev) => prev.filter((t) => t.id !== id)),
			3000
		);
	};

	// Virtualization
	const rowHeight = 56; // px
	const overscan = 6;
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const [scrollTop, setScrollTop] = useState(0);
	const [viewportHeight, setViewportHeight] = useState(480);

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		if (!term) return users;
		return users.filter(
			(u) =>
				u.email.toLowerCase().includes(term) ||
				(u.name || "").toLowerCase().includes(term) ||
				(u.company || "").toLowerCase().includes(term)
		);
	}, [users, search]);

	const totalRows = filtered.length;
	const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
	const endIndex = Math.min(
		totalRows,
		Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan
	);
	const visibleRows = filtered.slice(startIndex, endIndex);
	const offsetY = startIndex * rowHeight;

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const list = await listAllUsers();
			setUsers(list);
		} catch {
			setError("Falha ao carregar usuários");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	useEffect(() => {
		if (!viewportRef.current) return;
		const el = viewportRef.current;
		const resize = () => setViewportHeight(el.clientHeight || 480);
		resize();
		const onScroll = () => setScrollTop(el.scrollTop);
		el.addEventListener("scroll", onScroll);
		window.addEventListener("resize", resize);
		return () => {
			el.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", resize);
		};
	}, []);

	const handleSave = async (data: Partial<User>) => {
		try {
			setError(null);
			if (editing && editing.id) {
				await updateUserRecord(editing.id, data);
			} else {
				// cria apenas documento; criação de credencial deve ser feita fora (Firebase Auth)
				await createUserRecord({
					id: "", // Será gerado automaticamente
					email: data.email || "",
					name: data.name || "",
					company: data.company,
					phone: data.phone,
					displayName: data.displayName,
					photoURL: data.photoURL,
					emailVerified: false,
					userType: "user",
					role: (data.role as UserRole) || "operator",
					createdBy: "admin",
					updatedBy: "admin",
				});
			}
			setModalOpen(false);
			setEditing(null);
			await fetchUsers();
			showToast("Usuário salvo com sucesso", "success");
		} catch {
			setError("Falha ao salvar usuário");
			showToast("Falha ao salvar usuário", "error");
		}
	};

	const handleDelete = async (uid: string) => {
		if (!confirm("Remover este usuário?")) return;
		try {
			await deleteUserRecord(uid);
			await fetchUsers();
			showToast("Usuário removido", "success");
		} catch {
			setError("Falha ao remover usuário");
			showToast("Falha ao remover usuário", "error");
		}
	};

	return (
		<div className="admin-page">
				<div className="admin-header">
					<div>
						<h1>Gerenciar Usuários</h1>
						<p>Visualize, adicione, edite e remova usuários do sistema.</p>
					</div>
					<div className="admin-actions">
						<div className="admin-search">
							<Input
								type="text"
								name="search"
								placeholder="Buscar por nome, e-mail ou empresa"
								value={search}
								onChange={(e) =>
									setSearch((e.target as HTMLInputElement).value)
								}
							/>
						</div>
						<Button
							onClick={() => {
								setEditing(null);
								setModalOpen(true);
							}}
						>
							Adicionar Usuário
						</Button>
					</div>
				</div>

				{error && <div className="admin-error">{error}</div>}
				<div className="users-table">
					<div className="table-header">
						<div>Nome</div>
						<div>E-mail</div>
						<div>Empresa</div>
						<div>Telefone</div>
						<div>Papel</div>
						<div>Ações</div>
					</div>

					{loading ? (
						<div className="users-viewport">
							{Array.from({ length: 8 }).map((_, idx) => (
								<div key={idx} className="table-row skeleton-row">
									<div className="skeleton skeleton-text" />
									<div className="skeleton skeleton-text" />
									<div className="skeleton skeleton-text short" />
									<div className="skeleton skeleton-text short" />
									<div className="skeleton skeleton-badge" />
									<div className="skeleton skeleton-actions" />
								</div>
							))}
						</div>
					) : (
						<div className="users-viewport" ref={viewportRef}>
							<div
								style={{ height: totalRows * rowHeight, position: "relative" }}
							>
								<div style={{ transform: `translateY(${offsetY}px)` }}>
									{visibleRows.map((u) => (
										<div key={u.id} className="table-row">
											<div>{u.name || u.displayName || "—"}</div>
											<div>{u.email}</div>
											<div>{u.company || "—"}</div>
											<div>{u.phone || "—"}</div>
											<div>
												<span className={`badge role-${u.role || "user"}`}>
													{u.role || "user"}
												</span>
											</div>
											<div className="row-actions">
												<button
													className="link"
													onClick={() => {
														setEditing(u);
														setModalOpen(true);
													}}
												>
													Editar
												</button>
												<button
													className="link danger"
													onClick={() => handleDelete(u.id)}
												>
													Remover
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
							{filtered.length === 0 && (
								<div className="table-empty">Nenhum usuário encontrado.</div>
							)}
						</div>
					)}
				</div>

				{/* Toasts */}
				<div className="toasts">
					{toasts.map((t) => (
						<div key={t.id} className={`toast toast-${t.type}`}>
							{t.message}
						</div>
					))}
				</div>

				{modalOpen && (
					<UserModal
						initial={editing || undefined}
						onClose={() => {
							setModalOpen(false);
							setEditing(null);
						}}
						onSave={handleSave}
					/>
				)}
		</div>
	);
}

function UserModal({
	initial,
	onClose,
	onSave,
}: {
	initial?: User;
	onClose: () => void;
	onSave: (data: Partial<User>) => void | Promise<void>;
}) {
	const [form, setForm] = useState<Partial<User>>({
		email: initial?.email || "",
		name: initial?.name || initial?.displayName || "",
		company: initial?.company || "",
		phone: initial?.phone || "",
  role: initial?.role || "operator",
		displayName: initial?.displayName,
		photoURL: initial?.photoURL,
	});
	const [saving, setSaving] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const submit = async () => {
		setSaving(true);
		await onSave(form);
		setSaving(false);
	};

	return (
		<div className="modal-overlay">
			<div className="modal">
				<div className="modal-header">
					<h2>{initial ? "Editar Usuário" : "Adicionar Usuário"}</h2>
					<button className="close" onClick={onClose}>
						&times;
					</button>
				</div>
				<div className="modal-body">
					<div className="form-grid">
						<Input
							type="email"
							name="email"
							placeholder="E-mail"
							value={form.email || ""}
							onChange={(e) => handleChange(e)}
						/>
						<Input
							type="text"
							name="name"
							placeholder="Nome"
							value={form.name || ""}
							onChange={(e) => handleChange(e)}
						/>
						<Input
							type="text"
							name="company"
							placeholder="Empresa"
							value={form.company || ""}
							onChange={(e) => handleChange(e)}
						/>
						<Input
							type="text"
							name="phone"
							placeholder="Telefone"
							value={form.phone || ""}
							onChange={(e) => handleChange(e)}
						/>
						<div className="select-wrapper">
							<label>Papel</label>
							<select
								name="role"
								value={form.role as string}
								onChange={handleChange}
							>
								<option value="user">Usuário</option>
								<option value="admin">Administrador</option>
							</select>
						</div>
					</div>
				</div>
				<div className="modal-footer">
					<Button variant="outline" onClick={onClose} disabled={saving}>
						Cancelar
					</Button>
					<Button onClick={submit} disabled={saving}>
						{saving ? "Salvando..." : "Salvar"}
					</Button>
				</div>
			</div>
		</div>
	);
}
