import type { FaqItem } from "@/content/site"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type FaqListProps = {
  items: FaqItem[]
}

export function FaqList({ items }: FaqListProps) {
  return (
    <Accordion multiple className="rounded-xl border px-4 py-2">
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`faq-${index}`} className="py-1">
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
