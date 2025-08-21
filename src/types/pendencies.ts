// Tipos para pendências
export interface Pendency {
	id: string;
	title: string;
	description: string;
	priority: "low" | "medium" | "high" | "urgent";
	status: "pending" | "in_progress" | "completed" | "overdue";
	category: string;
	location: {
		sector: string;
		station?: string;
		equipment?: string;
	};
	assignedTo: {
		id: string;
		name: string;
		role: string;
	};
	reportedBy: {
		id: string;
		name: string;
		role: string;
	};
	createdAt: string;
	updatedAt: string;
	dueDate: string;
	completedAt?: string;
	completedBy?: string;
	attachments: string[];
	tags?: string[];
	comments?: Array<{
		id: string;
		userId: string;
		userName: string;
		message: string;
		timestamp: string;
		type: "comment" | "status_change" | "completion";
	}>;
}
