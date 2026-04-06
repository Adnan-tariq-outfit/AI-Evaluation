import axios from 'axios';
import { AuthService } from './auth.service';
import { AgentsResponse, AgentWizardPayload } from '../types/agent.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function authHeaders() {
  const token = AuthService.getAccessToken();
  if (!token) {
    throw new Error('You must be logged in to manage agents.');
  }
  return { Authorization: `Bearer ${token}` };
}

export class AgentService {
  static async getAgents(): Promise<AgentsResponse> {
    const response = await axios.get<AgentsResponse>(`${API_URL}/agents`, {
      headers: authHeaders(),
    });
    return response.data;
  }

  static async validateStep(step: number, data: Record<string, unknown>) {
    const response = await axios.post<{ valid: boolean }>(
      `${API_URL}/agents/validate-step`,
      { step, data },
      { headers: authHeaders() },
    );
    return response.data;
  }

  static async createAgent(payload: AgentWizardPayload) {
    const response = await axios.post(`${API_URL}/agents`, payload, {
      headers: authHeaders(),
    });
    return response.data;
  }
}
