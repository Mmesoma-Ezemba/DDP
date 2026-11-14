export interface Simulation {
  id: string;
  name: string;
  status: SimulationStatus;
  vaultId: string;
  vaultName: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  currentStep: number;
  totalSteps: number;
  steps: SimulationStep[];
}

export type SimulationStatus = "pending" | "running" | "completed" | "failed"

export interface SimulationStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  duration: number; // in seconds
  progress: number; // 0-100
  details?: string[];
  transactionHash?: string;
  timestamp?: string;
}

export type StepStatus = "pending" | "in-progress" | "completed" | "failed"

export interface SimulationConfig {
  vaultId: string;
  timeAcceleration: number; // 1x, 10x, 100x, 1000x
  skipAnimations: boolean;
  autoTrigger: boolean;
  notifyBeneficiaries: boolean;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: string;
  steps: number;
  recommended: boolean;
}

