"use client";

import { useState } from "react";
import { useProductivityData } from "../../hooks";
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

export default function ProductivityPanel() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");
  const [selectedOperator, setSelectedOperator] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");

  // Hook que calcula dados de produtividade baseados na agenda do operador
  const { productivityData, operatorRankings, periodStats, currentUserStats } =
    useProductivityData();

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

        {currentUserStats && (
          <UserStatsCard
            currentUserStats={currentUserStats}
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
