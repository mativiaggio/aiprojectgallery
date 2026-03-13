import type { SimpleIcon } from "simple-icons"
import {
  siAnthropic,
  siClaude,
  siElevenlabs,
  siGooglegemini,
  siHuggingface,
  siMeta,
  siMistralai,
  siOllama,
  siOpenrouter,
  siPerplexity,
  siReplicate,
} from "simple-icons"

export type DefaultAiToolOption = {
  id: string
  label: string
  accent: string
  icon?: SimpleIcon
  monogram?: string
}

export const DEFAULT_AI_TOOL_OPTIONS = [
  {
    id: "openai",
    label: "OpenAI",
    accent: "#10a37f",
    monogram: "OAI",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    accent: "#74aa9c",
    monogram: "GPT",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    accent: "#0f172a",
    monogram: "4o",
  },
  {
    id: "o3",
    label: "o3",
    accent: "#f97316",
    monogram: "o3",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    accent: `#${siAnthropic.hex}`,
    icon: siAnthropic,
  },
  {
    id: "claude",
    label: "Claude",
    accent: `#${siClaude.hex}`,
    icon: siClaude,
  },
  {
    id: "gemini",
    label: "Gemini",
    accent: `#${siGooglegemini.hex}`,
    icon: siGooglegemini,
  },
  {
    id: "mistral-ai",
    label: "Mistral AI",
    accent: `#${siMistralai.hex}`,
    icon: siMistralai,
  },
  {
    id: "perplexity",
    label: "Perplexity",
    accent: `#${siPerplexity.hex}`,
    icon: siPerplexity,
  },
  {
    id: "replicate",
    label: "Replicate",
    accent: `#${siReplicate.hex}`,
    icon: siReplicate,
  },
  {
    id: "elevenlabs",
    label: "ElevenLabs",
    accent: `#${siElevenlabs.hex}`,
    icon: siElevenlabs,
  },
  {
    id: "hugging-face",
    label: "Hugging Face",
    accent: `#${siHuggingface.hex}`,
    icon: siHuggingface,
  },
  {
    id: "ollama",
    label: "Ollama",
    accent: `#${siOllama.hex}`,
    icon: siOllama,
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    accent: `#${siOpenrouter.hex}`,
    icon: siOpenrouter,
  },
  {
    id: "meta-ai",
    label: "Meta AI",
    accent: `#${siMeta.hex}`,
    icon: siMeta,
  },
  {
    id: "groq",
    label: "Groq",
    accent: "#111827",
    monogram: "GRQ",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    accent: "#4f46e5",
    monogram: "DS",
  },
  {
    id: "cohere",
    label: "Cohere",
    accent: "#39594d",
    monogram: "CO",
  },
  {
    id: "runway",
    label: "Runway",
    accent: "#111111",
    monogram: "RW",
  },
  {
    id: "midjourney",
    label: "Midjourney",
    accent: "#0369a1",
    monogram: "MJ",
  },
  {
    id: "stability-ai",
    label: "Stability AI",
    accent: "#1f2937",
    monogram: "STB",
  },
  {
    id: "fireworks-ai",
    label: "Fireworks AI",
    accent: "#dc2626",
    monogram: "FW",
  },
  {
    id: "together-ai",
    label: "Together AI",
    accent: "#ea580c",
    monogram: "TG",
  },
  {
    id: "flux",
    label: "Flux",
    accent: "#7c3aed",
    monogram: "FX",
  },
] as const satisfies readonly DefaultAiToolOption[]

export const AI_TOOL_SUGGESTIONS = DEFAULT_AI_TOOL_OPTIONS.map((tool) => tool.label)
