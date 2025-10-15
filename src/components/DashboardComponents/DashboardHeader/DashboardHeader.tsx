import "./DashboardHeader.css";
import SectorStatusBell from "../../SectorStatusBell/SectorStatusBell";

interface DashboardHeaderProps {
	userName: string;
	lastSync: Date;
	onImportBling: () => void;
	onLogout: () => void;
	sectors: Array<{
		name: string;
		code: string;
		description: string;
		isActive: boolean;
	}>;
}

export default function DashboardHeader({
	userName,
	sectors,
}: DashboardHeaderProps) {
	return (
		<div className="dashboard-header">
			<div className="header-content">
				<div className="header-info">
					<h1>Dashboard</h1>
					<p>Bem-vindo, {userName}</p>
				</div>
				<div className="header-actions">
					<SectorStatusBell sectors={sectors} />
				</div>
			</div>
		</div>
	);
}
