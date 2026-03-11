import { ButtonLink } from "@/components/button-link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl justify-center px-6 py-16 lg:px-10">
      <Card className="w-full max-w-lg border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle>That page is not in the gallery yet.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <p className="text-sm leading-7 text-muted-foreground">
            The route exists for the product structure, but this specific item
            was not found in the current mock dataset.
          </p>
          <ButtonLink href="/projects">
            Return to the gallery
          </ButtonLink>
        </CardContent>
      </Card>
    </div>
  )
}
