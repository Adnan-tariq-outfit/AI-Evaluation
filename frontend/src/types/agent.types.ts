export interface AgentStep1 {
  name: string;
  description: string;
  category: string;
}

export interface AgentStep2 {
  purpose: string;
  primaryGoal: string;
}

export interface AgentStep3 {
  systemPrompt: string;
}

export interface AgentStep4 {
  modelId: string;
  tools: string[];
}

export interface AgentStep5 {
  shortTermWindow: number;
  longTermMemory: boolean;
  memorySummary: boolean;
}

export interface AgentStep6 {
  temperature: number;
  maxTokens: number;
  timeoutSeconds: number;
  fallbackBehavior: string;
}

export interface AgentWizardPayload {
  step1: AgentStep1;
  step2: AgentStep2;
  step3: AgentStep3;
  step4: AgentStep4;
  step5: AgentStep5;
  step6: AgentStep6;
}

export interface CreatedAgent {
  _id: string;
  name: string;
  description: string;
  category: string;
  status: 'draft' | 'active';
  config: {
    modelId: string;
    modelName: string;
    modelProvider: string;
    tools: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentsResponse {
  data: CreatedAgent[];
}
