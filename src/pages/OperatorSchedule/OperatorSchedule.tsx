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
	WorkTimeRecords,
} from "../../components/OperatorScheduleComponents";
import { 
	getUserAgendaByDate, 
	updateAgendaItemStatus,
	addBreakToAgendaItem,
	endBreakInAgendaItem,
	agendaItemToTask,
	saveWorkShift,
	getTodayWorkShifts,
	saveOrUpdateWorkTimeRecord,
	getTodayWorkTimeRecord,
	updateWorkTimeRecordDuration,
	type WorkShift,
	type WorkTimeRecord
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
	const [shiftStartTimestamp, setShiftStartTimestamp] = useState<number | null>(null);
	const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
	const [workTimeRecords, setWorkTimeRecords] = useState<WorkTimeRecord[]>([]);

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
				
				// Inicializar com dados zerados
				setTasks(agendaTasks);
				setFilteredTasks(agendaTasks);
				setStats({
					tasksCompleted: 0,
					averageEfficiency: 0,
					totalWorkTime: 0, // Iniciar zerado
					onTimeCompletion: 0,
					ranking: 0,
					dailyTarget: agendaTasks.length,
					totalBreaks: 0,
					totalBreakTime: 0,
					qualityScore: 0,
					productivityIndex: 0,
				});
				setCurrentTask(null);
				
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
			await loadWorkTimeRecords();
		};

		loadInitialData();
	}, [user?.id]);

	// Verificar se a jornada já foi iniciada ao carregar a página
	useEffect(() => {
		const checkExistingWorkRecord = async () => {
			if (!user?.id) return;

			try {
				// Verificar se existe um registro de tempo trabalhado para hoje
				const existingRecord = await getTodayWorkTimeRecord(user.id);
				
				if (existingRecord) {
					console.log("Registro de tempo trabalhado encontrado:", existingRecord);
					
					// Se o status for "active", significa que a jornada ainda está ativa
					if (existingRecord.status === "active") {
						setIsShiftStarted(true);
						setShiftStartTime(existingRecord.startTime);
						
						// Calcular tempo decorrido baseado no horário de início
						const [startHour, startMin] = existingRecord.startTime.split(":").map(Number);
						const startTimestamp = new Date();
						startTimestamp.setHours(startHour, startMin, 0, 0);
						
						setShiftStartTimestamp(startTimestamp.getTime());
						setElapsedTime(existingRecord.duration);
						
						// Atualizar localStorage
						localStorage.setItem("shiftStarted", "true");
						localStorage.setItem("shiftStartTime", existingRecord.startTime);
						localStorage.setItem("shiftStartTimestamp", startTimestamp.getTime().toString());
						localStorage.setItem("shiftStartDate", new Date().toDateString());
						
						console.log("Jornada ativa restaurada do documento existente");
					} else {
						// Jornada já finalizada, apenas carregar os dados para exibição
						console.log("Jornada já finalizada, carregando dados para exibição");
						// Carregar registros para exibição
						await loadWorkTimeRecords();
					}
				} else {
					// Verificar localStorage como fallback
					const savedShiftStarted = localStorage.getItem("shiftStarted");
					const savedShiftStartTime = localStorage.getItem("shiftStartTime");
					const savedShiftStartDate = localStorage.getItem("shiftStartDate");
					const savedShiftStartTimestamp = localStorage.getItem("shiftStartTimestamp");
					
					const today = new Date().toDateString();
					if (savedShiftStarted === "true" && savedShiftStartDate === today && savedShiftStartTime && savedShiftStartTimestamp) {
						setIsShiftStarted(true);
						setShiftStartTime(savedShiftStartTime);
						setShiftStartTimestamp(parseInt(savedShiftStartTimestamp));
						setElapsedTime(calculateElapsedTime(parseInt(savedShiftStartTimestamp)));
					} else {
						// Limpar dados antigos se não for hoje
						localStorage.removeItem("shiftStarted");
						localStorage.removeItem("shiftStartTime");
						localStorage.removeItem("shiftStartTimestamp");
						localStorage.removeItem("shiftStartDate");
					}
				}
			} catch (error) {
				console.error("Erro ao verificar registro de tempo trabalhado:", error);
			}
		};

		checkExistingWorkRecord();
	}, [user?.id]);

	// Update current time and elapsed time every second
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
			
			// Atualizar tempo decorrido se a jornada estiver ativa
			if (isShiftStarted && shiftStartTimestamp) {
				setElapsedTime(calculateElapsedTime(shiftStartTimestamp));
			}
		}, 1000);
		return () => clearInterval(timer);
	}, [isShiftStarted, shiftStartTimestamp]);

	// Calcular tempo trabalhado dinamicamente baseado no tempo de início da jornada
	useEffect(() => {
		if (isShiftStarted && shiftStartTime && elapsedTime) {
			// Converter tempo decorrido para minutos
			const [hours, minutes, seconds] = elapsedTime.split(":").map(Number);
			const totalMinutes = hours * 60 + minutes + seconds / 60;
			
			// Atualizar estatísticas com tempo trabalhado atual
			setStats(prev => ({
				...prev,
				totalWorkTime: Math.round(totalMinutes)
			}));
		} else if (!isShiftStarted && workTimeRecords.length > 0) {
			// Se a jornada não estiver ativa, usar dados do documento existente
			const todayRecord = workTimeRecords[0];
			if (todayRecord && todayRecord.status === "completed") {
				setStats(prev => ({
					...prev,
					totalWorkTime: todayRecord.totalMinutes
				}));
				console.log(`Tempo trabalhado carregado do documento: ${todayRecord.duration} (${todayRecord.totalMinutes} min)`);
			}
		} else if (!isShiftStarted) {
			// Se não há jornada ativa e não há registros, manter tempo zerado
			setStats(prev => ({
				...prev,
				totalWorkTime: 0
			}));
		}
	}, [isShiftStarted, shiftStartTime, elapsedTime, workTimeRecords]);

	// Atualizar documento de tempo trabalhado em tempo real
	useEffect(() => {
		if (isShiftStarted && elapsedTime && user?.id) {
			// Atualizar documento a cada 30 segundos para não sobrecarregar o Firestore
			const updateInterval = setInterval(async () => {
				try {
					const [hours, minutes, seconds] = elapsedTime.split(":").map(Number);
					const totalMinutes = hours * 60 + minutes + seconds / 60;
					
					await updateWorkTimeRecordDuration(
						user.id,
						elapsedTime,
						Math.round(totalMinutes)
					);
				} catch (error) {
					console.error("Erro ao atualizar duração do registro:", error);
				}
			}, 30000); // Atualizar a cada 30 segundos

			return () => clearInterval(updateInterval);
		}
	}, [isShiftStarted, elapsedTime, user?.id]);

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

		// Calcular total de pausas e tempo de pausas
		const totalBreaks = tasks.reduce((total, task) => total + task.breaks.length, 0);
		const totalBreakTime = tasks.reduce((total, task) => 
			total + task.breaks.reduce((breakTotal, breakItem) => 
				breakTotal + (breakItem.duration || 0), 0
			), 0
		);

		setStats((prev) => ({
			...prev,
			tasksCompleted: completedTasks,
			averageEfficiency: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
			onTimeCompletion: totalTasks > 0 ? (onTime / totalTasks) * 100 : 0,
			dailyTarget: totalTasks,
			totalBreaks,
			totalBreakTime,
			// Não alterar totalWorkTime aqui - será calculado dinamicamente pelo tempo de jornada
		}));
	}, [tasks]);

	// Função para calcular tempo decorrido usando timestamp
	const calculateElapsedTime = (startTimestamp: number): string => {
		const now = Date.now();
		const diffMs = now - startTimestamp;
		
		// Se a diferença for negativa, retornar 00:00:00
		if (diffMs < 0) {
			return "00:00:00";
		}
		
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
		
		return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
	};

	// Função para iniciar jornada de trabalho
	const handleStartShift = async () => {
		if (!user?.id) return;

		try {
			const now = new Date();
			const timeString = now.toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
			});
			const timestamp = now.getTime();
			
			// Verificar se já existe um registro para hoje
			const existingRecord = await getTodayWorkTimeRecord(user.id);
			
			if (!existingRecord) {
				// Criar documento inicial para o dia
				await saveOrUpdateWorkTimeRecord(
					user.id,
					user.id,
					timeString,
					timeString, // Mesmo horário inicialmente
					"00:00:00",
					0,
					"Jornada iniciada - documento criado"
				);
				console.log("Documento de tempo trabalhado criado para hoje");
			}
			
			// Inicializar com tempo zerado e timestamp preciso
			setElapsedTime("00:00:00");
			setShiftStartTimestamp(timestamp);
			setIsShiftStarted(true);
			setShiftStartTime(timeString);
			
			// Salvar no localStorage para persistir entre sessões
			localStorage.setItem("shiftStarted", "true");
			localStorage.setItem("shiftStartTime", timeString);
			localStorage.setItem("shiftStartTimestamp", timestamp.toString());
			localStorage.setItem("shiftStartDate", now.toDateString());
			
			// Recarregar registros para mostrar o documento criado
			await loadWorkTimeRecords();
			
			console.log(`Jornada iniciada às ${timeString}`);
		} catch (error) {
			console.error("Erro ao iniciar jornada:", error);
			alert("Erro ao iniciar jornada. Tente novamente.");
		}
	};

	// Função para parar jornada de trabalho
	const handleStopShift = async () => {
		if (!user?.id || !shiftStartTime || !elapsedTime) return;

		try {
			// Salvar o tempo decorrido antes de zerar os estados
			const finalElapsedTime = elapsedTime;
			const now = new Date();
			const endTimeString = now.toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
			
			// Calcular tempo total em minutos usando o tempo salvo
			const [hours, minutes, seconds] = finalElapsedTime.split(":").map(Number);
			const totalMinutes = hours * 60 + minutes + seconds / 60;
			
			console.log(`Finalizando jornada - Tempo decorrido: ${finalElapsedTime}, Total minutos: ${Math.round(totalMinutes)}`);
			
			// Salvar jornada no Firestore
			const shiftId = await saveWorkShift(
				user.id,
				shiftStartTime,
				endTimeString,
				finalElapsedTime,
				Math.round(totalMinutes),
				"Jornada finalizada pelo operador"
			);
			
			console.log(`Jornada salva com ID: ${shiftId}`);
			
			// Atualizar registro de tempo trabalhado existente
			const workTimeRecordId = await saveOrUpdateWorkTimeRecord(
				user.id, // userId
				user.id, // operatorId (usando o mesmo ID do usuário como UUID do operador)
				shiftStartTime,
				endTimeString,
				finalElapsedTime,
				Math.round(totalMinutes),
				`Jornada finalizada - Jornada ID: ${shiftId}`
			);
			
			console.log(`Registro de tempo trabalhado atualizado com ID: ${workTimeRecordId}`);
			
			// Atualizar estado local APÓS salvar os dados
			setIsShiftStarted(false);
			setShiftStartTime(null);
			setShiftStartTimestamp(null);
			setElapsedTime(null);
			
			// Limpar localStorage
			localStorage.removeItem("shiftStarted");
			localStorage.removeItem("shiftStartTime");
			localStorage.removeItem("shiftStartTimestamp");
			localStorage.removeItem("shiftStartDate");
			
			// Recarregar jornadas do dia e registros de tempo
			await loadTodayWorkShifts();
			await loadWorkTimeRecords();
			
			console.log(`Jornada finalizada às ${endTimeString}. Tempo total: ${finalElapsedTime}`);
			
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

	// Função para carregar registro de tempo trabalhado do dia atual
	const loadWorkTimeRecords = async () => {
		if (!user?.id) return;

		try {
			const record = await getTodayWorkTimeRecord(user.id);
			if (record) {
				setWorkTimeRecords([record]);
				console.log(`Carregado registro de tempo trabalhado de hoje: ${record.duration}`);
			} else {
				setWorkTimeRecords([]);
				console.log("Nenhum registro de tempo trabalhado encontrado para hoje");
			}
		} catch (error) {
			console.error("Erro ao carregar registro de tempo trabalhado:", error);
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
			
			// Recalcular estatísticas com dados zerados
			const completedTasks = agendaTasks.filter(t => t.status === "completed").length;
			const totalTasks = agendaTasks.length;
			const onTime = agendaTasks.filter(t => 
				t.status === "completed" && 
				t.actualTime && 
				t.actualTime <= t.estimatedTime + t.setupTime
			).length;

			const totalBreaks = agendaTasks.reduce((total, task) => total + task.breaks.length, 0);
			const totalBreakTime = agendaTasks.reduce((total, task) => 
				total + task.breaks.reduce((breakTotal, breakItem) => 
					breakTotal + (breakItem.duration || 0), 0
				), 0
			);

			setStats(prev => ({
				...prev,
				tasksCompleted: completedTasks,
				averageEfficiency: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
				totalWorkTime: 0, // Iniciar zerado - será calculado pelo tempo de jornada
				onTimeCompletion: totalTasks > 0 ? (onTime / totalTasks) * 100 : 0,
				dailyTarget: totalTasks,
				totalBreaks,
				totalBreakTime,
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
				task.id === taskId ? { ...task, status: "pending" as const } : task
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
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			createdBy: user.id,
			updatedBy: user.id,
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
			case "active":
				return "#fbb040";
			case "completed":
				return "#c6f6d5";
			case "overdue":
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
					hasActiveWorkRecord={workTimeRecords.length > 0}
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
				
				{/* Registros de Tempo Trabalhado */}
				<WorkTimeRecords workTimeRecords={workTimeRecords} />
			</div>
		</div>
	);
}
