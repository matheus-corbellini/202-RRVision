"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
	OperatorScheduleHeader,
	OperatorStatsGrid,
	CurrentTaskPanel,
	TasksSection,
	QuickActionsPanel,
	WorkShiftsHistory,
} from "../../components/OperatorScheduleComponents";
import { 
	getUserAgendaByDate, 
	updateAgendaItemStatus,
	addBreakToAgendaItem,
	endBreakInAgendaItem,
	agendaItemToTask,
	createDefaultAgendaItem,
	saveWorkShift,
	getTodayWorkShifts,
	type WorkShift
} from "../../services/agendaService";
import "./OperatorSchedule.css";

import type { Task } from "../../types/operatorSchedule";

import type { Break } from "../../types/operatorSchedule";

import type { OperatorStats } from "../../types/operatorSchedule";

export default function OperatorSchedule() {
	const { user } = useAuth();
	const [currentDate, setCurrentDate] = useState(new Date());
	const [viewMode, setViewMode] = useState<"day" | "week">("day");
	const [tasks, setTasks] = useState<Task[]>([]);
	const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
	const [currentTask, setCurrentTask] = useState<Task | null>(null);
	const [activeBreak, setActiveBreak] = useState<Break | null>(null);
	const [stats, setStats] = useState<OperatorStats>({
		tasksCompleted: 0,
		averageEfficiency: 0,
		totalWorkTime: 0,
		onTimeCompletion: 0,
		ranking: 0,
		dailyTarget: 0,
		totalBreaks: 0,
		totalBreakTime: 0,
		qualityScore: 0,
		productivityIndex: 0,
	});
	const [currentTime, setCurrentTime] = useState(new Date());
	const [isShiftStarted, setIsShiftStarted] = useState(false);
	const [shiftStartTime, setShiftStartTime] = useState<string | null>(null);
	const [elapsedTime, setElapsedTime] = useState<string | null>(null);
	const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);

	// Buscar dados reais da coleção Agenda
	useEffect(() => {
		const fetchAgendaData = async () => {
			if (!user?.id) return;

			try {
				// Formatar data atual para o formato esperado pela API
				const today = new Date();
				const dateString = today.toISOString().split('T')[0]; // formato: "YYYY-MM-DD"
				
				// Buscar agenda do dia atual
				const agendaItems = await getUserAgendaByDate(user.id, dateString);
				
				// Converter AgendaItem para Task para compatibilidade com componentes existentes
				const agendaTasks = agendaItems.map(agendaItemToTask);
				
				// Se não houver dados na agenda, criar um documento padrão
				if (agendaTasks.length === 0) {
					console.log("Nenhum item encontrado na agenda para hoje. Criando tarefa padrão...");
					
					try {
						// Criar uma tarefa padrão para o dia
						const defaultAgendaItem = await createDefaultAgendaItem(user.id, dateString);
						const defaultTask = agendaItemToTask(defaultAgendaItem);
						
						setTasks([defaultTask]);
						setFilteredTasks([defaultTask]);
						setStats({
							tasksCompleted: 0,
							averageEfficiency: 0,
							totalWorkTime: defaultTask.estimatedTime + defaultTask.setupTime,
							onTimeCompletion: 0,
							ranking: 0,
							dailyTarget: 1,
							totalBreaks: 0,
							totalBreakTime: 0,
							qualityScore: 0,
							productivityIndex: 0,
						});
						setCurrentTask(null);
						return;
					} catch (error) {
						console.error("Erro ao criar tarefa padrão:", error);
						// Em caso de erro, usar dados vazios
						setTasks([]);
						setFilteredTasks([]);
						setStats({
							tasksCompleted: 0,
							averageEfficiency: 0,
							totalWorkTime: 0,
							onTimeCompletion: 0,
							ranking: 0,
							dailyTarget: 0,
							totalBreaks: 0,
							totalBreakTime: 0,
							qualityScore: 0,
							productivityIndex: 0,
						});
						setCurrentTask(null);
						return;
					}
				}

				// Calcular estatísticas baseadas nos dados reais
				const completedTasks = agendaTasks.filter(t => t.status === "completed").length;
				const totalTasks = agendaTasks.length;
				const onTime = agendaTasks.filter(t => 
					t.status === "completed" && 
					t.actualTime && 
					t.actualTime <= t.estimatedTime + t.setupTime
				).length;

				const calculatedStats: OperatorStats = {
					tasksCompleted: completedTasks,
					averageEfficiency: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
					totalWorkTime: agendaTasks.reduce((total, task) => {
						if (task.actualTime) return total + task.actualTime;
						return total + task.estimatedTime + task.setupTime;
					}, 0),
					onTimeCompletion: totalTasks > 0 ? (onTime / totalTasks) * 100 : 0,
					ranking: 0, // Será calculado pelo sistema
					dailyTarget: totalTasks,
					totalBreaks: agendaTasks.reduce((total, task) => total + task.breaks.length, 0),
					totalBreakTime: agendaTasks.reduce((total, task) => 
						total + task.breaks.reduce((breakTotal, breakItem) => 
							breakTotal + (breakItem.duration || 0), 0
						), 0
					),
					qualityScore: 0, // Será calculado pelo sistema
					productivityIndex: 0, // Será calculado pelo sistema
				};

				setTasks(agendaTasks);
				setFilteredTasks(agendaTasks);
				setStats(calculatedStats);
				setCurrentTask(agendaTasks.find(t => t.status === "in_progress") || null);
				
			} catch (error) {
				console.error("Erro ao buscar dados da agenda:", error);
				// Em caso de erro, usar dados vazios
				setTasks([]);
				setFilteredTasks([]);
				setStats({
					tasksCompleted: 0,
					averageEfficiency: 0,
					totalWorkTime: 0,
					onTimeCompletion: 0,
					ranking: 0,
					dailyTarget: 0,
					totalBreaks: 0,
					totalBreakTime: 0,
					qualityScore: 0,
					productivityIndex: 0,
				});
				setCurrentTask(null);
			}
		};

		const loadInitialData = async () => {
			await fetchAgendaData();
			await loadTodayWorkShifts();
		};

		loadInitialData();
	}, [user?.id]);

	// Verificar se a jornada já foi iniciada ao carregar a página
	useEffect(() => {
		const savedShiftStarted = localStorage.getItem("shiftStarted");
		const savedShiftStartTime = localStorage.getItem("shiftStartTime");
		const savedShiftStartDate = localStorage.getItem("shiftStartDate");
		
		// Verificar se a jornada foi iniciada hoje
		const today = new Date().toDateString();
		if (savedShiftStarted === "true" && savedShiftStartDate === today && savedShiftStartTime) {
			setIsShiftStarted(true);
			setShiftStartTime(savedShiftStartTime);
			// Calcular tempo decorrido inicial
			setElapsedTime(calculateElapsedTime(savedShiftStartTime));
		} else {
			// Limpar dados antigos se não for hoje
			localStorage.removeItem("shiftStarted");
			localStorage.removeItem("shiftStartTime");
			localStorage.removeItem("shiftStartDate");
		}
	}, []);

	// Update current time and elapsed time every second
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
			
			// Atualizar tempo decorrido se a jornada estiver ativa
			if (isShiftStarted && shiftStartTime) {
				setElapsedTime(calculateElapsedTime(shiftStartTime));
			}
		}, 1000);
		return () => clearInterval(timer);
	}, [isShiftStarted, shiftStartTime]);

	// Atualizar estatísticas quando tarefas mudarem
	useEffect(() => {
		const completedTasks = tasks.filter((t) => t.status === "completed").length;
		const totalTasks = tasks.length;
		const onTime = tasks.filter(
			(t) =>
				t.status === "completed" &&
				t.actualTime &&
				t.actualTime <= t.estimatedTime + t.setupTime
		).length;

		setStats((prev) => ({
			...prev,
			tasksCompleted: completedTasks,
			onTimeCompletion: totalTasks > 0 ? (onTime / totalTasks) * 100 : 0,
		}));
	}, [tasks]);

	// Função para calcular tempo decorrido
	const calculateElapsedTime = (startTime: string): string => {
		const now = new Date();
		const [startHour, startMin] = startTime.split(":").map(Number);
		
		const startDate = new Date();
		startDate.setHours(startHour, startMin, 0, 0);
		
		const diffMs = now.getTime() - startDate.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
		
		return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
	};

	// Função para iniciar jornada de trabalho
	const handleStartShift = () => {
		const now = new Date();
		const timeString = now.toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});
		
		setIsShiftStarted(true);
		setShiftStartTime(timeString);
		setElapsedTime("00:00:00");
		
		// Salvar no localStorage para persistir entre sessões
		localStorage.setItem("shiftStarted", "true");
		localStorage.setItem("shiftStartTime", timeString);
		localStorage.setItem("shiftStartDate", now.toDateString());
		
		console.log(`Jornada iniciada às ${timeString}`);
	};

	// Função para parar jornada de trabalho
	const handleStopShift = async () => {
		if (!user?.id || !shiftStartTime || !elapsedTime) return;

		try {
			const now = new Date();
			const endTimeString = now.toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
			});
			
			// Calcular tempo total em minutos
			const [hours, minutes, seconds] = elapsedTime.split(":").map(Number);
			const totalMinutes = hours * 60 + minutes + seconds / 60;
			
			// Salvar jornada no Firestore
			const shiftId = await saveWorkShift(
				user.id,
				shiftStartTime,
				endTimeString,
				elapsedTime,
				Math.round(totalMinutes),
				"Jornada finalizada pelo operador"
			);
			
			console.log(`Jornada salva com ID: ${shiftId}`);
			
			// Atualizar estado local
			setIsShiftStarted(false);
			setShiftStartTime(null);
			setElapsedTime(null);
			
			// Limpar localStorage
			localStorage.removeItem("shiftStarted");
			localStorage.removeItem("shiftStartTime");
			localStorage.removeItem("shiftStartDate");
			
			// Recarregar jornadas do dia
			await loadTodayWorkShifts();
			
			console.log(`Jornada finalizada às ${endTimeString}. Tempo total: ${elapsedTime}`);
			
		} catch (error) {
			console.error("Erro ao salvar jornada:", error);
			// Em caso de erro, manter jornada ativa
			alert("Erro ao salvar jornada. Tente novamente.");
		}
	};

	// Função para carregar jornadas do dia
	const loadTodayWorkShifts = async () => {
		if (!user?.id) return;

		try {
			const shifts = await getTodayWorkShifts(user.id);
			setWorkShifts(shifts);
		} catch (error) {
			console.error("Erro ao carregar jornadas do dia:", error);
		}
	};

	// Função para buscar dados da agenda por data
	const fetchAgendaByDate = async (date: Date) => {
		if (!user?.id) return;

		try {
			const dateString = date.toISOString().split('T')[0];
			const agendaItems = await getUserAgendaByDate(user.id, dateString);
			const agendaTasks = agendaItems.map(agendaItemToTask);
			
			setTasks(agendaTasks);
			setFilteredTasks(agendaTasks);
			setCurrentTask(agendaTasks.find(t => t.status === "in_progress") || null);
			
			// Recalcular estatísticas
			const completedTasks = agendaTasks.filter(t => t.status === "completed").length;
			const totalTasks = agendaTasks.length;
			const onTime = agendaTasks.filter(t => 
				t.status === "completed" && 
				t.actualTime && 
				t.actualTime <= t.estimatedTime + t.setupTime
			).length;

							setStats(prev => ({
					...prev,
					tasksCompleted: completedTasks,
					averageEfficiency: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
					totalWorkTime: agendaTasks.reduce((total, task) => {
						if (task.actualTime) return total + task.actualTime;
						return total + task.estimatedTime + task.setupTime;
					}, 0),
					onTimeCompletion: totalTasks > 0 ? (onTime / totalTasks) * 100 : 0,
					dailyTarget: totalTasks,
					totalBreaks: agendaTasks.reduce((total, task) => total + task.breaks.length, 0),
					totalBreakTime: agendaTasks.reduce((total, task) => 
						total + task.breaks.reduce((breakTotal, breakItem) => 
							breakTotal + (breakItem.duration || 0), 0
						), 0
					),
				}));
		} catch (error) {
			console.error("Erro ao buscar agenda por data:", error);
		}
	};

	const handleStartTask = async (taskId: string) => {
		if (!user?.id) return;

		try {
		// Pausar tarefa atual se existir
		if (currentTask) {
				await handlePauseTask(currentTask.id);
		}

			// Atualizar status na coleção Agenda
			await updateAgendaItemStatus(taskId, "in_progress");

			// Atualizar estado local
		setTasks((prev) =>
			prev.map((task) =>
				task.id === taskId
					? {
							...task,
							status: "in_progress" as const,
							actualStartTime: new Date().toLocaleTimeString("pt-BR", {
								hour: "2-digit",
								minute: "2-digit",
							}),
					  }
					: task
			)
		);
			
		const task = tasks.find((t) => t.id === taskId);
		if (task) setCurrentTask({ ...task, status: "in_progress" });
		} catch (error) {
			console.error("Erro ao iniciar tarefa:", error);
		}
	};

	const handleCompleteTask = async (taskId: string) => {
		if (!user?.id) return;

		try {
		const now = new Date().toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});

			// Atualizar status na coleção Agenda
			await updateAgendaItemStatus(taskId, "completed");

			// Atualizar estado local
		setTasks((prev) =>
			prev.map((task) =>
				task.id === taskId
					? {
							...task,
							status: "completed" as const,
							actualEndTime: now,
							actualTime: task.actualStartTime
								? calculateActualTime(task.actualStartTime, now)
								: task.estimatedTime,
					  }
					: task
			)
		);
		setCurrentTask(null);
		} catch (error) {
			console.error("Erro ao completar tarefa:", error);
		}
	};

	const handlePauseTask = async (taskId: string) => {
		if (!user?.id) return;

		try {
			// Atualizar status na coleção Agenda
			await updateAgendaItemStatus(taskId, "paused");

			// Atualizar estado local
		setTasks((prev) =>
			prev.map((task) =>
				task.id === taskId ? { ...task, status: "paused" as const } : task
			)
		);
		if (currentTask?.id === taskId) {
			setCurrentTask(null);
			}
		} catch (error) {
			console.error("Erro ao pausar tarefa:", error);
		}
	};

	const handleStartBreak = async (type: Break["type"]) => {
		if (!currentTask?.id || !user?.id) return;

		try {
		const breakItem: Break = {
			id: `break-${Date.now()}`,
			type,
			startTime: new Date().toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		};

			// Adicionar pausa na coleção Agenda
			await addBreakToAgendaItem(currentTask.id, breakItem);

			// Atualizar estado local
		setActiveBreak(breakItem);
		} catch (error) {
			console.error("Erro ao iniciar pausa:", error);
		}
	};

	const handleEndBreak = async () => {
		if (!activeBreak?.id || !currentTask?.id || !user?.id) return;

		try {
			// Finalizar pausa na coleção Agenda
			await endBreakInAgendaItem(currentTask.id, activeBreak.id);

			// Atualizar estado local
			const endTime = new Date().toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
			});
			const duration = calculateActualTime(activeBreak.startTime, endTime);

			const completedBreak = {
				...activeBreak,
				endTime,
				duration,
			};

			setTasks((prev) =>
				prev.map((task) =>
					task.id === currentTask.id
						? { ...task, breaks: [...task.breaks, completedBreak] }
						: task
				)
			);
		} catch (error) {
			console.error("Erro ao finalizar pausa:", error);
		} finally {
			setActiveBreak(null);
		}
	};

	// Handler para ações rápidas
	const handleQuickAction = async (action: string) => {
		switch (action) {
			case "start-next": {
				const nextTask = tasks.find((t) => t.status === "pending");
				if (nextTask) {
					await handleStartTask(nextTask.id);
				}
				break;
			}
			case "pause-current":
				if (currentTask) {
					await handlePauseTask(currentTask.id);
				}
				break;
			case "complete-current":
				if (currentTask) {
					await handleCompleteTask(currentTask.id);
				}
				break;
			case "emergency-break":
				if (currentTask) {
					await handlePauseTask(currentTask.id);
					await handleStartBreak("other");
				}
				break;
		}
	};

	const calculateActualTime = (startTime: string, endTime: string): number => {
		const [startHour, startMin] = startTime.split(":").map(Number);
		const [endHour, endMin] = endTime.split(":").map(Number);
		return endHour * 60 + endMin - (startHour * 60 + startMin);
	};

	const getTaskStatusColor = (status: Task["status"]) => {
		switch (status) {
			case "pending":
				return "#e2e8f0";
			case "in_progress":
				return "#bee3f8";
			case "paused":
				return "#fbb040";
			case "completed":
				return "#c6f6d5";
			case "delayed":
				return "#fed7d7";
			default:
				return "#e2e8f0";
		}
	};

	const getPriorityColor = (priority: Task["priority"]) => {
		switch (priority) {
			case "low":
				return "#48bb78";
			case "medium":
				return "#fbb040";
			case "high":
				return "#f56565";
			case "urgent":
				return "#e53e3e";
			default:
				return "#4a5568";
		}
	};

	const getEfficiencyColor = (efficiency: number) => {
		if (efficiency >= 95) return "#48bb78";
		if (efficiency >= 85) return "#fbb040";
		return "#f56565";
	};

	const formatTime = (minutes: number): string => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}m`;
	};

	const calculateProgress = (task: Task): number => {
		if (task.status === "completed") return 100;
		if (task.status === "pending") return 0;

		const now = new Date();
		const [startHour, startMin] = task.startTime.split(":").map(Number);
		const [endHour, endMin] = task.endTime.split(":").map(Number);

		const startTime = new Date();
		startTime.setHours(startHour, startMin, 0, 0);

		const endTime = new Date();
		endTime.setHours(endHour, endMin, 0, 0);

		const totalTime = endTime.getTime() - startTime.getTime();
		const elapsedTime = now.getTime() - startTime.getTime();

		return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
	};

	return (
		<div className="schedule-page">
			<div className="schedule-container">
				<OperatorScheduleHeader
					user={user}
					viewMode={viewMode}
					setViewMode={setViewMode}
					currentTime={currentTime}
					onStartShift={handleStartShift}
					onStopShift={handleStopShift}
					isShiftStarted={isShiftStarted}
					shiftStartTime={shiftStartTime}
					elapsedTime={elapsedTime}
				/>

				<OperatorStatsGrid
					stats={stats}
					getEfficiencyColor={getEfficiencyColor}
					formatTime={formatTime}
				/>

				{/* Painel de Ações Rápidas */}
				<QuickActionsPanel
					tasks={tasks}
					currentTask={currentTask}
					onFilterChange={setFilteredTasks}
					onSortChange={(sortedTasks) => {
						setTasks(sortedTasks);
						setFilteredTasks(sortedTasks);
					}}
					onQuickAction={handleQuickAction}
				/>

				<div className="schedule-content">
					<CurrentTaskPanel
						currentTask={currentTask}
						activeBreak={activeBreak}
						currentTime={currentTime}
						handlePauseTask={handlePauseTask}
						handleCompleteTask={handleCompleteTask}
						handleStartBreak={handleStartBreak}
						handleEndBreak={handleEndBreak}
						calculateProgress={calculateProgress}
						calculateActualTime={calculateActualTime}
					/>

					<TasksSection
						tasks={filteredTasks}
						currentDate={currentDate}
						setCurrentDate={setCurrentDate}
						handleStartTask={handleStartTask}
						getTaskStatusColor={getTaskStatusColor}
						getPriorityColor={getPriorityColor}
						getEfficiencyColor={getEfficiencyColor}
						formatTime={formatTime}
						onDateChange={fetchAgendaByDate}
					/>
				</div>
				
				{/* Histórico de Jornadas */}
				<WorkShiftsHistory workShifts={workShifts} />
			</div>
		</div>
	);
}
