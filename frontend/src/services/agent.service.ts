import { AuthService } from './auth.service';
import {
  AgentsResponse,
  AgentWizardPayload,
  CreatedAgent,
} from '../types/agent.types';
import { ModelService } from './model.service';
import { apiClient } from '../lib/api';

export class AgentService {
  private static defaultModelIdPromise: Promise<string> | null = null;

  static async getAgents(): Promise<AgentsResponse> {
    const userId = this.getCurrentUserId();
    const response = await apiClient.get<AgentsResponse>('/agents', {
      params: { userId },
    });
    return response.data;
  }

  static async validateStep(step: number, data: Record<string, unknown>) {
    const response = await apiClient.post<{ valid: boolean }>('/agents/validate-step', {
      step,
      data,
    });
    return response.data;
  }

  static async createAgent(payload: AgentWizardPayload) {
    const userId = this.getCurrentUserId();
    const response = await apiClient.post('/agents', { userId, ...payload });
    return response.data;
  }

  /**
   * Backward-compatible API used by `app/agents/page.tsx`.
   */
  static async getMyAgents(): Promise<AgentRecord[]> {
    const response = await this.getAgents();
    return (response.data ?? []).map(mapCreatedAgentToRecord);
  }

  /**
   * Backward-compatible API used by `app/agents/page.tsx`.
   */
  static async create(payload: CreateAgentPayload): Promise<AgentRecord> {
    const modelId = await this.resolveDefaultModelId();
    const wizardPayload: AgentWizardPayload = {
      step1: {
        name: payload.agentName.trim(),
        description: payload.mainJob.trim(),
        category: payload.purposeType.trim(),
      },
      step2: {
        purpose: `${payload.purposeType} for ${payload.audience} (${payload.tone} tone)`,
        primaryGoal: payload.mainJob.trim(),
      },
      step3: {
        systemPrompt: payload.systemPrompt.trim(),
      },
      step4: {
        modelId,
        tools: payload.selectedTools ?? [],
      },
      step5: {
        shortTermWindow: toShortTermWindow(payload.memoryMode),
        longTermMemory: payload.memoryMode === 'Short + Long-term',
        memorySummary: payload.memoryMode !== 'No Memory',
      },
      step6: {
        temperature: 0.7,
        maxTokens: 1024,
        timeoutSeconds: 30,
        fallbackBehavior:
          'Apologize briefly, ask one clarifying question, and provide next best safe action.',
      },
    };

    const created = await this.createAgent(wizardPayload);
    return mapCreatedAgentToRecord(created);
  }

  private static async resolveDefaultModelId(): Promise<string> {
    if (!this.defaultModelIdPromise) {
      this.defaultModelIdPromise = (async () => {
        const models = await ModelService.getModels({ userId: this.getCurrentUserId() });
        const first = models.data?.[0];
        if (!first?._id) {
          throw new Error('No AI model available. Please add at least one model.');
        }
        return first._id;
      })();
    }
    return this.defaultModelIdPromise;
  }

  private static getCurrentUserId(): string {
    const userId = AuthService.getUser()?.id;
    if (!userId) {
      throw new Error('User ID is missing. Please log in again.');
    }
    return userId;
  }
}

export type MemoryMode = 'No Memory' | 'Short-term Only' | 'Short + Long-term';
export type DeploymentType =
  | 'API Endpoint'
  | 'Embed Widget'
  | 'Slack Bot'
  | 'WhatsApp / SMS';

export interface CreateAgentPayload {
  agentName: string;
  purposeType: string;
  mainJob: string;
  audience: string;
  tone: string;
  systemPrompt: string;
  selectedTools: string[];
  memoryMode: MemoryMode;
  testScenarios: string[];
  deploymentType: DeploymentType;
  status: 'Draft' | 'Live';
}

export interface AgentRecord {
  id: string;
  name: string;
  role: string;
  status: 'Draft' | 'Live';
  createdAt: string;
  description: string;
  modelId?: string;
  modelName?: string;
  modelProvider?: string;
  tools: string[];
}

function toShortTermWindow(mode: MemoryMode): number {
  if (mode === 'No Memory') return 1;
  if (mode === 'Short + Long-term') return 20;
  return 10;
}

function mapCreatedAgentToRecord(agent: CreatedAgent): AgentRecord {
  return {
    id: agent._id,
    name: agent.name,
    role: agent.category,
    status: agent.status === 'active' ? 'Live' : 'Draft',
    createdAt: agent.createdAt,
    description: agent.description,
    modelId: agent.config?.modelId,
    modelName: agent.config?.modelName,
    modelProvider: agent.config?.modelProvider,
    tools: agent.config?.tools ?? [],
  };
}
