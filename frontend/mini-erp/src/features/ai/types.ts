export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  type: "text" | "image" | "voice";
  metadata?: {
    imageUrl?: string;
    voiceUrl?: string;
    isProcessing?: boolean;
    extractedData?: any;
  };
}

export interface AIState {
  messages: ChatMessage[];
  isTyping: boolean;
  isRecording: boolean;
}
