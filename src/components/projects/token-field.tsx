"use client"

import { useState, type KeyboardEvent } from "react"
import { Plus, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type TokenFieldProps = {
  label: string
  description: string
  value: string[]
  onChange: (value: string[]) => void
  suggestions: readonly string[]
  error?: string
}

export function TokenField({
  label,
  description,
  value,
  onChange,
  suggestions,
  error,
}: TokenFieldProps) {
  const [draft, setDraft] = useState("")

  function commitToken(rawValue: string) {
    const token = rawValue.trim()

    if (!token) {
      return
    }

    if (value.some((item) => item.toLowerCase() === token.toLowerCase())) {
      setDraft("")
      return
    }

    onChange([...value, token].slice(0, 8))
    setDraft("")
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      commitToken(draft)
    }

    if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const availableSuggestions = suggestions.filter(
    (item) => !value.some((selected) => selected.toLowerCase() === item.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="text-sm font-medium">{label}</div>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <div
        className={cn(
          "rounded-[1rem] border bg-background p-3 transition-colors",
          error ? "border-destructive/60 ring-2 ring-destructive/10" : "border-border"
        )}
      >
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="h-7 gap-1 rounded-full px-3">
              {item}
              <button
                type="button"
                onClick={() => onChange(value.filter((current) => current !== item))}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Remove ${item}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}

          <div className="flex min-w-[14rem] flex-1 items-center gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type and press Enter"
              className="h-9 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => commitToken(draft)}
              disabled={!draft.trim()}
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableSuggestions.slice(0, 6).map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => commitToken(suggestion)}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/15 hover:text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
