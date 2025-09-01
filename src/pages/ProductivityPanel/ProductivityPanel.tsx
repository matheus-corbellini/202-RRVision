"use client";

import { useState, useEffect } from "react";
import { useProductivityData } from "../../hooks";
import { getAllOperatorsWithUsers } from "../../services/authService";
import {
  ProductivityHeader,
  UserStatsCard,
  PeriodOverview,
  FiltersSection,
  PerformanceTable,
  RankingsSection,
  ChartsSection,
} from "../../components/ProductivityPanelComponents/index";
import "./ProductivityPanel.css";
import { FaChartLine, FaChartBar, FaArrowRight } from "react-icons/fa";
import React from "react";

interface OperatorWithUser {
  operator: {
    id: string;
    code: string;
    status: string;
  };
  user: {
    name?: string;
    email: string;
  };
}

export default function ProductivityPanel() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");
  const [selectedOperator, setSelectedOperator] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedOperatorForStats, setSelectedOperatorForStats] = useState<string>("");
  const [availableOperators, setAvailableOperators] = useState<OperatorWithUser[]>([]);

  // Hook que calcula dados de produtividade baseados na agenda do operador
  const { productivityData, operatorRankings, periodStats, currentUserStats } =
    useProductivityData();

  // Carregar operadores reais do sistema
  useEffect(() => {
    const loadOperators = async () => {
      try {
        const operatorsData = await getAllOperatorsWithUsers();
        if (Array.isArray(operatorsData)) {
          setAvailableOperators(operatorsData);
          // Definir operador padrão para stats se não houver seleção
          if (operatorsData.length > 0 && !selectedOperatorForStats) {
            setSelectedOperatorForStats(operatorsData[0].operator.id);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar operadores:", error);
        setAvailableOperators([]);
      }
    };

    loadOperators();
  }, []);

  // Definir operador padrão para stats se não houver seleção
  React.useEffect(() => {
    if (operatorRankings.length > 0 && !selectedOperatorForStats) {
      setSelectedOperatorForStats(operatorRankings[0].operatorId);
    }
  }, [operatorRankings, selectedOperatorForStats]);

  // Obter stats do operador selecionado
  const getSelectedOperatorStats = () => {
    if (!selectedOperatorForStats) return currentUserStats;
    
    // Buscar nos operadores reais primeiro
    const realOperator = availableOperators.find(op => op.operator.id === selectedOperatorForStats);
    if (realOperator) {
      // Criar stats básicos para o operador real
      return {
        operatorId: realOperator.operator.id,
        operatorName: realOperator.user.name || realOperator.operator.code,
        totalTasks: 0, // Será calculado quando implementar integração com agenda
        averageEfficiency: 85, // Valor padrão
        totalProductivity: 80, // Valor padrão
        onTimeCompletion: 90, // Valor padrão
        rank: 1, // Será calculado quando implementar ranking
        trend: "stable" as const,
      };
    }
    
    // Fallback para operatorRankings se não encontrar nos operadores reais
    return operatorRankings.find(op => op.operatorId === selectedOperatorForStats) || currentUserStats;
  };

  const selectedOperatorStats = getSelectedOperatorStats();

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 105) return "#48bb78";
    if (efficiency >= 95) return "#fbb040";
    if (efficiency >= 85) return "#f6ad55";
    return "#f56565";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <FaChartLine />;
      case "down":
        return <FaChartBar />;
      default:
        return <FaArrowRight />;
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const filteredData = productivityData.filter((item) => {
    if (selectedOperator !== "all" && item.operatorId !== selectedOperator)
      return false;
    if (selectedSector !== "all" && item.sector !== selectedSector)
      return false;
    return true;
  });

  const currentPeriodStats = periodStats.find((stat) => {
    switch (selectedPeriod) {
      case "today":
        return stat.period === "Hoje";
      case "week":
        return stat.period === "Esta Semana";
      case "month":
        return stat.period === "Este Mês";
      default:
        return stat.period === "Hoje";
    }
  });

  return (
    <div className="productivity-page">
      <div className="productivity-container">
        <ProductivityHeader
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />

        {selectedOperatorStats && (
          <UserStatsCard
            currentUserStats={selectedOperatorStats}
            getEfficiencyColor={getEfficiencyColor}
            getTrendIcon={getTrendIcon}
          />
        )}

        {currentPeriodStats && (
          <PeriodOverview
            currentPeriodStats={currentPeriodStats}
            getEfficiencyColor={getEfficiencyColor}
            formatTime={formatTime}
          />
        )}

        <div className="productivity-content">
          <FiltersSection
            selectedOperator={selectedOperator}
            setSelectedOperator={setSelectedOperator}
            selectedSector={selectedSector}
            setSelectedSector={setSelectedSector}
            availableOperators={availableOperators}
          />

          <PerformanceTable
            filteredData={filteredData}
            getEfficiencyColor={getEfficiencyColor}
            formatTime={formatTime}
          />

          <RankingsSection
            operatorRankings={operatorRankings}
            getEfficiencyColor={getEfficiencyColor}
            getTrendIcon={getTrendIcon}
          />

          <ChartsSection productivityData={filteredData} />
        </div>
      </div>
    </div>
  );
}
