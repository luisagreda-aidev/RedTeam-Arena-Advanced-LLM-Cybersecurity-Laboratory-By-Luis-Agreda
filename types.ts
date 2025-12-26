
export enum AttackType {
  JAILBREAK = 'Jailbreaking',
  PROMPT_INJECTION = 'Prompt Injection',
  ROLE_PLAY = 'Character Role-play',
  DAN = 'DAN (Do Anything Now)',
  SEMANTIC_CONFUSION = 'Semantic Confusion',
  OBFUSCATION = 'Obfuscation (Base64/ROT13)',
  TOKEN_SMUGGLING = 'Token Smuggling',
  VIRTUALIZATION = 'Virtualization (Layered Simulation)',
  COGNITIVE_OVERLOAD = 'Cognitive Overload',
  LOGIC_COLLAPSE = 'Logic Collapse'
}

export enum SecurityLevel {
  LOW = 'Low (Standard Assistant)',
  MEDIUM = 'Medium (Basic Guardrails)',
  HIGH = 'High (Adversarial Robustness)',
}

export type SupportedModel = 'gemini-3-flash-preview' | 'gemini-3-pro-preview';

export interface Message {
  id: string;
  sender: 'ADVERSARY' | 'GUARDIAN' | 'SYSTEM' | 'EVALUATOR';
  text: string;
  timestamp: Date;
  metadata?: {
    type?: AttackType;
    isSuccessful?: boolean;
    severity?: number;
    thought?: string;
  };
}

export interface SessionStats {
  totalAttacks: number;
  successfulInjections: number;
  thwartedAttempts: number;
  averageRobustnessScore: number;
}
