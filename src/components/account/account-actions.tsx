"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { useI18n } from "@/lib/i18n/provider"
import { Button } from "@/components/ui/button"

export function AccountActions() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        className="justify-start"
        onClick={async () => {
          setIsPending(true)
          try {
            await authClient.$fetch("/sign-out", {
              method: "POST",
              body: {},
            })
            router.replace("/")
            router.refresh()
          } finally {
            setIsPending(false)
          }
        }}
        disabled={isPending}
      >
        <LogOut className="size-4" />
        {isPending ? t("dashboard.userMenu.signingOut") : t("dashboard.userMenu.signOut")}
      </Button>
    </div>
  )
}
