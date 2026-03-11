import type { ContactField } from "@/content/site"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ContactFormProps = {
  fields: ContactField[]
}

export function ContactForm({ fields }: ContactFormProps) {
  return (
    <form className="rounded-xl border bg-card p-5">
      <FieldGroup>
        <Field>
          <FieldLabel>Send an inquiry</FieldLabel>
          <FieldDescription>
            Tell us what you are building, launching, or looking to feature.
          </FieldDescription>
        </Field>
        {fields.map((field) => (
          <Field key={field.id}>
            <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
            {field.type === "textarea" ? (
              <Textarea id={field.id} className="min-h-28" />
            ) : (
              <Input id={field.id} type={field.type} required={field.required} />
            )}
          </Field>
        ))}
        <Button type="button" size="lg">
          Send inquiry
        </Button>
      </FieldGroup>
    </form>
  )
}
