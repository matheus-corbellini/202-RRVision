// Tipos para setores
import type { BaseEntity } from './base';

export interface Sector extends BaseEntity {
	name: string;
	code: string;
	description: string;
	isActive: boolean;
}