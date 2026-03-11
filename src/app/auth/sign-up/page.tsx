import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-7xl justify-center px-6 py-16 lg:px-10">
      <Card className="w-full max-w-md border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle>Create your maker account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" className="h-10" />
          </div>
          <Button className="h-10 w-full">Create account</Button>
          <p className="text-sm text-muted-foreground">
            Already a member?{" "}
            <Link href="/auth/sign-in" className="text-foreground underline underline-offset-4">
              Sign in here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
