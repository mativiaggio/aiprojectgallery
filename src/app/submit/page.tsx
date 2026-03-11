import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { submissionSteps } from "@/lib/data"

const tools = ["ChatGPT", "Codex", "Cursor", "Claude", "Bolt", "Lovable"]

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="max-w-3xl">
        <div className="mb-5 flex flex-wrap gap-2">
          {["Authenticated flow", "UploadThing-ready", "Screenshot pipeline"].map(
            (item) => (
              <Badge
                key={item}
                variant="outline"
                className="rounded-md bg-background px-2.5 py-1"
              >
                {item}
              </Badge>
            )
          )}
        </div>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Submit a product built with AI.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          This page is already shaped around the final MVP flow. The form asks
          for the fields that matter, and the right column explains how the
          screenshot and storage steps will plug in later.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-border/80 bg-card/90">
          <CardHeader className="border-b border-border/70 pb-4">
            <CardTitle>Project submission form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project name</Label>
                <Input
                  id="project-name"
                  placeholder="Signal Stack"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-url">Live website URL</Label>
                <Input
                  id="project-url"
                  placeholder="https://yourapp.com"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Explain what the product does, who it helps, and what part AI tools played in building it."
                className="min-h-36"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="github-url">GitHub repository</Label>
                <Input
                  id="github-url"
                  placeholder="https://github.com/..."
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="framework">Framework used</Label>
                <Input
                  id="framework"
                  placeholder="Next.js"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>AI tools used</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {tools.map((tool) => (
                  <div
                    key={tool}
                    className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/80 px-3 py-3"
                  >
                    <Checkbox defaultChecked={tool !== "Bolt"} />
                    <Label>{tool}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="SaaS, directory, education, portfolio"
                className="h-10"
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="h-10 px-4">Save draft submission</Button>
              <Button variant="outline" className="h-10 px-4">
                Preview final card
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80 bg-card/90">
            <CardHeader className="pb-2">
              <CardTitle>What happens after submit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submissionSteps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-lg border border-border/70 bg-background/80 p-4"
                >
                  <p className="font-medium">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/90">
            <CardHeader className="pb-2">
              <CardTitle>Submission guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Use a real product URL instead of a mocked screenshot upload.</p>
              <p>Keep descriptions clear and specific about what the product does.</p>
              <p>List the AI tools that genuinely shaped the workflow.</p>
              <p>GitHub is optional, but it helps other builders learn from the project.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
