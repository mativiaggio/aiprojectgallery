import { en } from "@/lib/i18n/messages-en"
import { es } from "@/lib/i18n/messages-es"

type WidenMessageShape<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly WidenMessageShape<Item>[]
    : T extends Record<string, unknown>
      ? { [Key in keyof T]: WidenMessageShape<T[Key]> }
      : T

export const dictionaries = {
  en,
  es,
} as const

export type Messages = WidenMessageShape<typeof en>
