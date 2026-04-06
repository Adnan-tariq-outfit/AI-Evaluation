import axios from 'axios';
import { AuthService } from './auth.service';
import { AgentsResponse, AgentWizardPayload } from '../types/agent.types';
import { ModelService } from './model.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = AuthService.getAccessToken();
  if (!token) {
    throw new Error('You must be logged in to manage agents.');
  }
  return { Authorization: `Bearer ${token}` };
}

export class AgentService {
  private static defaultModelIdPromise: Promise<string> | null = null;
  private static refreshingPromise: Promise<void> | null = null;

  private static async requestWithAuthRetry<T>(
    request: () => Promise<T>,
    retried = false,
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (
        !retried &&
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        AuthService.getRefreshToken()
      ) {
        if (!this.refreshingPromise) {
          this.refreshingPromise = AuthService.refreshTokens()
            .then(() => undefined)
            .finally(() => {
              this.refreshingPromise = null;
            });
        }
        await this.refreshingPromise;
        return this.requestWithAuthRetry(request, true);
      }
      throw error;
    }
  }

  static async getAgents(): Promise<AgentsResponse> {
    const response = await this.requestWithAuthRetry(() =>
      axios.get<AgentsResponse>(`${API_URL}/agents`, {
        headers: authHeaders(),
      }),
    );
    return response.data;
  }

  static async validateStep(step: number, data: Record<string, unknown>) {
    const response = await this.requestWithAuthRetry(() =>
      axios.post<{ valid: boolean }>(
        `${API_URL}/agents/validate-step`,
        { step, data },
        { headers: authHeaders() },
      ),
    );
    return response.data;
  }

  static async createAgent(payload: AgentWizardPayload) {
    const response = await this.requestWithAuthRetry(() =>
      axios.post(`${API_URL}/agents`, payload, {
        headers: authHeaders(),
      }),
    );
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
        const models = await ModelService.getModels();
        const first = models.data?.[0];
        if (!first?._id) {
          throw new Error('No AI model available. Please add at least one model.');
        }
        return first._id;
      })();
    }
    return this.defaultModelIdPromise;
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
}

type CreatedAgentCompat = {
  _id: string;
  name: string;
  category: string;
  status: 'draft' | 'active';
  createdAt: string;
};

function toShortTermWindow(mode: MemoryMode): number {
  if (mode === 'No Memory') return 1;
  if (mode === 'Short + Long-term') return 20;
  return 10;
}

function mapCreatedAgentToRecord(agent: CreatedAgentCompat): AgentRecord {
  return {
    id: agent._id,
    name: agent.name,
    role: agent.category,
    status: agent.status === 'active' ? 'Live' : 'Draft',
    createdAt: agent.createdAt,
  };
}
