export * from "./authService";
export * from "./dataService";
export * from "./blingService";

// Re-export operational routes service types with aliases to avoid conflicts
export type { 
  Product,
  Step,
  OperationalRoute
} from "./operationalRoutesService";

// Re-export functions from operational routes service
export { 
  createOperationalRoute,
  updateOperationalRoute,
  deleteOperationalRoute,
  getOperationalRouteById,
  listAllOperationalRoutes,
  searchOperationalRoutes,
  getRoutesByProduct,
  getRoutesByStatus,
  getActiveRoutes,
  checkRouteExists,
  getRoutesStats
} from "./operationalRoutesService";
