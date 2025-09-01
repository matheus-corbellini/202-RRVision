import "./DashboardHeader.css";

interface DashboardHeaderProps {
	userName: string;
	lastSync: Date;
	onImportBling: () => void;
	onLogout: () => void;
}

export default function DashboardHeader({
	userName,
}: DashboardHeaderProps) {
	return (
		<div className="dashboard-header">
			<div className="header-content">
				<div className="header-info">
					<h1>Dashboard</h1>
					<p>Bem-vindo, {userName}</p>
				</div>
			</div>
		</div>
	);
}
