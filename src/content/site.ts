import type { Locale } from "@/lib/i18n"

export type NavItem = {
  href:
    | "/"
    | "/research"
    | "/radar"
    | "/maps"
    | "/opportunities"
    | "/pulse"
    | "/pricing"
    | "/about"
    | "/contact"
  label: string
}

export type FeatureStep = {
  title: string
  description: string
  detail: string
}

export type PreviewApp = {
  name: string
  tagline: string
  productionUrl: string
  category: string
  models: string[]
  platforms: string[]
  captureStyle: string
  statusLabel: string
  curatorNote: string
}

export type PricingTier = {
  name: string
  priceLabel: string
  cadence: string
  summary: string
  features: string[]
  cta: string
  footnote: string
}

export type FaqItem = {
  question: string
  answer: string
}

export type ContactField = {
  id: string
  label: string
  type: "text" | "email" | "url" | "textarea"
  required?: boolean
}

export type ContactChannel = {
  title: string
  value: string
  href?: string
  description: string
}

const siteContentByLocale = {
  en: {
    brand: {
      name: "AI Project Gallery",
      summary: "Curated directory of live AI products.",
    },
    navItems: [
      { href: "/", label: "Home" },
      { href: "/research", label: "Research" },
      { href: "/radar", label: "Radar" },
      { href: "/maps", label: "Maps" },
      { href: "/opportunities", label: "Opportunities" },
      { href: "/pulse", label: "Pulse" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ] satisfies NavItem[],
    home: {
      heroTitle: "Discover polished AI products with the context behind how they were built.",
      heroDescription:
        "AI Project Gallery curates live AI-native products with the details people actually want to compare: what the product does, who it is for, which models power it, and the stack it runs on.",
      heroNote:
        "Each entry combines a public launch surface with useful technical context.",
      indexFields: [
        {
          title: "Production URL",
          description:
            "A direct path to the live product so every listing leads somewhere real.",
        },
        {
          title: "Landing capture",
          description:
            "A current screenshot of the public product so visitors can judge the product before clicking through.",
        },
        {
          title: "Models used",
          description:
            "The model stack behind text, image, voice, or multimodal features.",
        },
        {
          title: "Platforms",
          description:
            "Frameworks, hosting, orchestration, data tooling, and deployment context in one readable layer.",
        },
        {
          title: "Category tags",
          description:
            "Searchable metadata that helps visitors browse by use case, industry, and product type.",
        },
        {
          title: "Curator note",
          description: "A short note on category, positioning, and execution.",
        },
      ],
      closingTitle: "A calmer way to browse products built with AI.",
      closingDescription:
        "AI Project Gallery brings launch quality, product clarity, and stack transparency into one place so strong AI products are easier to find and easier to understand.",
    },
    featureSteps: [
      {
        title: "Submit your product",
        description:
          "Share the live URL, a short description, the category, and the current stack.",
        detail:
          "Listings are reserved for public products with enough detail to be useful on first read.",
      },
      {
        title: "Capture the launch surface",
        description:
          "Each listing includes the page or app view that people will actually see first.",
        detail:
          "That gives visitors immediate context before they open the production URL.",
      },
      {
        title: "Publish stack-aware profiles",
        description:
          "Models, platforms, categories, and notes are stored in one consistent format.",
        detail:
          "The result is easier to compare than a launch feed or a screenshot-only directory.",
      },
    ] satisfies FeatureStep[],
    previewApps: [
      {
        name: "Patchbay AI",
        tagline: "Turns policy docs into operating checklists for lean teams.",
        productionUrl: "patchbay.so",
        category: "Operations",
        models: ["GPT-4.1", "Claude 3.7 Sonnet"],
        platforms: ["Next.js", "Supabase", "Vercel"],
        captureStyle: "Task-first launch page",
        statusLabel: "Featured",
        curatorNote:
          "A strong operations product with a landing page that explains the value in one pass.",
      },
      {
        name: "Loomforge",
        tagline: "Builds internal copilots from team playbooks and meeting residue.",
        productionUrl: "loomforge.app",
        category: "Knowledge",
        models: ["Gemini 2.5 Pro", "o3-mini"],
        platforms: ["Remix", "Cloudflare", "LangChain"],
        captureStyle: "Minimal launch narrative",
        statusLabel: "Featured",
        curatorNote:
          "A clear example of why technical provenance matters as much as visual polish.",
      },
      {
        name: "Driftkit",
        tagline: "Generates motion briefs and campaign variants from brand inputs.",
        productionUrl: "driftkit.ai",
        category: "Creative tooling",
        models: ["Flux Pro", "GPT-4o"],
        platforms: ["Next.js", "Replicate", "PostHog"],
        captureStyle: "Editorial showcase layout",
        statusLabel: "Featured",
        curatorNote:
          "A creative product that benefits from being seen as both a launch and a stack story.",
      },
    ] satisfies PreviewApp[],
    pricingTier: {
      name: "Free access",
      priceLabel: "$0",
      cadence: "/month",
      summary:
        "One plan for submissions, public listings, and updates while the catalog is growing.",
      features: [
        "Submit live AI products",
        "Public listing with product summary, models, and platform details",
        "Direct link to the production URL",
        "Contact channel for updates, corrections, and questions",
        "Category organization across the catalog",
      ],
      cta: "Talk to us",
      footnote:
        "Free access keeps submissions simple while the catalog is being built.",
    } satisfies PricingTier,
    faqs: [
      {
        question: "Can creators submit apps today?",
        answer:
          "AI Project Gallery is built for creators shipping real products with a production URL, a clear category, and enough stack detail to make the listing genuinely useful.",
      },
      {
        question: "Will listings only include a screenshot?",
        answer:
          "No. Each listing combines a visual launch capture with product context, model details, platform information, tags, and a curator note.",
      },
      {
        question: "Is this a Product Hunt clone for AI apps?",
        answer:
          "No. The gallery focuses on durable listings with screenshots, product summaries, model details, platform context, and category data.",
      },
      {
        question: "What makes this useful for teams?",
        answer:
          "It helps teams study how strong AI products are presented, what stacks they use, and where they sit in the broader product landscape.",
      },
    ] satisfies FaqItem[],
    about: {
      lead:
        "AI Project Gallery exists because the best AI-built products deserve more than a fast-moving launch feed. They deserve a place where presentation, product clarity, and technical provenance live together.",
      principles: [
        {
          title: "Editorial, not noisy",
          description:
            "Entries are reviewed and formatted to make the product legible quickly.",
        },
        {
          title: "Structured, not vague",
          description:
            "Every listing makes the stack legible: models, frameworks, hosting, and platform context.",
        },
        {
          title: "Built for real launches",
          description:
            "The gallery is designed around public-facing products with a clear story, not hype without substance.",
        },
      ],
      roadmap: [
        "Submissions from teams shipping live AI products",
        "Consistent landing captures for every listing",
        "Rich stack-aware profiles that support comparison and discovery",
      ],
    },
    contact: {
      intro:
        "Share your launch, partnership idea, or product link and we will point you to the right conversation.",
      fields: [
        {
          id: "name",
          label: "Your name",
          type: "text",
          required: true,
        },
        {
          id: "email",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          id: "url",
          label: "Production URL",
          type: "url",
        },
        {
          id: "note",
          label: "Tell us about your product",
          type: "textarea",
        },
      ] satisfies ContactField[],
      channels: [
        {
          title: "Curator inbox",
          value: "hello@aiproject.gallery",
          href: "mailto:hello@aiproject.gallery",
          description:
            "For partnerships, product launches, and featured listing conversations.",
        },
        {
          title: "Editorial standard",
          value: "Strong products, clear stories",
          description:
            "We look for live products, clear positioning, and enough technical detail to make the listing useful.",
        },
        {
          title: "Response style",
          value: "Async and founder-friendly",
          description:
            "A concise note, a link, and a bit of context are enough to start the conversation.",
        },
      ] satisfies ContactChannel[],
    },
  },
  es: {
    brand: {
      name: "AI Project Gallery",
      summary: "Directorio curado de productos de IA en producción.",
    },
    navItems: [
      { href: "/", label: "Inicio" },
      { href: "/research", label: "Research" },
      { href: "/radar", label: "Radar" },
      { href: "/maps", label: "Mapas" },
      { href: "/opportunities", label: "Oportunidades" },
      { href: "/pulse", label: "Pulse" },
      { href: "/pricing", label: "Precios" },
      { href: "/about", label: "Acerca" },
      { href: "/contact", label: "Contacto" },
    ] satisfies NavItem[],
    home: {
      heroTitle: "Descubrí productos de IA pulidos con el contexto de cómo fueron construidos.",
      heroDescription:
        "AI Project Gallery reúne productos IA nativos en producción con los detalles que la gente realmente quiere comparar: qué hace el producto, para quién está pensado, qué modelos lo impulsan y sobre qué stack corre.",
      heroNote:
        "Cada ficha combina la superficie pública de lanzamiento con contexto técnico útil.",
      indexFields: [
        {
          title: "URL de producción",
          description:
            "Un acceso directo al producto real para que cada ficha lleve a algo existente.",
        },
        {
          title: "Captura del landing",
          description:
            "Una captura actual del producto público para evaluar la propuesta antes de entrar.",
        },
        {
          title: "Modelos usados",
          description:
            "El stack de modelos detrás de funciones de texto, imagen, voz o multimodales.",
        },
        {
          title: "Plataformas",
          description:
            "Frameworks, hosting, orquestación, tooling de datos y contexto de despliegue en una sola capa legible.",
        },
        {
          title: "Etiquetas de categoría",
          description:
            "Metadatos buscables para navegar por caso de uso, industria y tipo de producto.",
        },
        {
          title: "Nota editorial",
          description: "Una nota breve sobre categoría, posicionamiento y ejecución.",
        },
      ],
      closingTitle: "Una forma más calma de explorar productos construidos con IA.",
      closingDescription:
        "AI Project Gallery reúne calidad de lanzamiento, claridad de producto y transparencia del stack en un solo lugar para que los buenos productos de IA sean más fáciles de encontrar y entender.",
    },
    featureSteps: [
      {
        title: "Envía tu producto",
        description:
          "Compartí la URL en vivo, una descripción corta, la categoría y el stack actual.",
        detail:
          "Las fichas están reservadas para productos públicos con suficiente detalle para ser útiles desde la primera lectura.",
      },
      {
        title: "Capturamos la superficie de lanzamiento",
        description:
          "Cada ficha incluye la página o vista de la app que la gente realmente verá primero.",
        detail:
          "Eso le da a los visitantes contexto inmediato antes de abrir la URL de producción.",
      },
      {
        title: "Publicamos perfiles orientados al stack",
        description:
          "Modelos, plataformas, categorías y notas se guardan en un formato consistente.",
        detail:
          "El resultado es más fácil de comparar que un feed de lanzamientos o un directorio de solo capturas.",
      },
    ] satisfies FeatureStep[],
    previewApps: [
      {
        name: "Patchbay AI",
        tagline: "Convierte documentación de políticas en checklists operativos para equipos lean.",
        productionUrl: "patchbay.so",
        category: "Operaciones",
        models: ["GPT-4.1", "Claude 3.7 Sonnet"],
        platforms: ["Next.js", "Supabase", "Vercel"],
        captureStyle: "Landing orientado a tareas",
        statusLabel: "Destacado",
        curatorNote:
          "Un producto fuerte de operaciones con una landing que explica el valor en una sola pasada.",
      },
      {
        name: "Loomforge",
        tagline: "Construye copilotos internos a partir de playbooks del equipo y residuos de reuniones.",
        productionUrl: "loomforge.app",
        category: "Conocimiento",
        models: ["Gemini 2.5 Pro", "o3-mini"],
        platforms: ["Remix", "Cloudflare", "LangChain"],
        captureStyle: "Narrativa de lanzamiento minimalista",
        statusLabel: "Destacado",
        curatorNote:
          "Un ejemplo claro de por qué la procedencia técnica importa tanto como el pulido visual.",
      },
      {
        name: "Driftkit",
        tagline: "Genera briefs de motion y variantes de campaña a partir de inputs de marca.",
        productionUrl: "driftkit.ai",
        category: "Herramientas creativas",
        models: ["Flux Pro", "GPT-4o"],
        platforms: ["Next.js", "Replicate", "PostHog"],
        captureStyle: "Layout editorial de showcase",
        statusLabel: "Destacado",
        curatorNote:
          "Un producto creativo que gana cuando se lo entiende tanto como lanzamiento como historia de stack.",
      },
    ] satisfies PreviewApp[],
    pricingTier: {
      name: "Acceso gratuito",
      priceLabel: "$0",
      cadence: "/mes",
      summary:
        "Un único plan para envíos, fichas públicas y actualizaciones mientras el catálogo sigue creciendo.",
      features: [
        "Enviar productos de IA en producción",
        "Ficha pública con resumen del producto, modelos y detalles de plataforma",
        "Enlace directo a la URL de producción",
        "Canal de contacto para actualizaciones, correcciones y consultas",
        "Organización por categorías dentro del catálogo",
      ],
      cta: "Hablar con nosotros",
      footnote:
        "El acceso gratuito mantiene los envíos simples mientras el catálogo se está construyendo.",
    } satisfies PricingTier,
    faqs: [
      {
        question: "¿Los creadores ya pueden enviar apps?",
        answer:
          "AI Project Gallery está pensado para creadores que lanzan productos reales con una URL de producción, una categoría clara y suficiente detalle de stack para que la ficha sea realmente útil.",
      },
      {
        question: "¿Las fichas solo incluyen una captura?",
        answer:
          "No. Cada ficha combina una captura visual del lanzamiento con contexto de producto, detalles de modelos, información de plataforma, etiquetas y una nota editorial.",
      },
      {
        question: "¿Es una copia de Product Hunt para apps de IA?",
        answer:
          "No. La galería se enfoca en fichas duraderas con capturas, resúmenes de producto, detalles de modelos, contexto de plataforma y datos de categoría.",
      },
      {
        question: "¿Qué la hace útil para equipos?",
        answer:
          "Ayuda a los equipos a estudiar cómo se presentan los buenos productos de IA, qué stacks usan y dónde se ubican dentro del paisaje general.",
      },
    ] satisfies FaqItem[],
    about: {
      lead:
        "AI Project Gallery existe porque los mejores productos construidos con IA merecen más que un feed de lanzamientos que pasa rápido. Merecen un lugar donde convivan presentación, claridad de producto y procedencia técnica.",
      principles: [
        {
          title: "Editorial, no ruidoso",
          description:
            "Las fichas se revisan y formatean para que el producto se entienda rápido.",
        },
        {
          title: "Estructurado, no vago",
          description:
            "Cada ficha vuelve legible el stack: modelos, frameworks, hosting y contexto de plataforma.",
        },
        {
          title: "Pensado para lanzamientos reales",
          description:
            "La galería está diseñada alrededor de productos públicos con una historia clara, no hype sin sustancia.",
        },
      ],
      roadmap: [
        "Envíos de equipos que lanzan productos de IA en producción",
        "Capturas consistentes del landing para cada ficha",
        "Perfiles ricos y orientados al stack que faciliten comparación y descubrimiento",
      ],
    },
    contact: {
      intro:
        "Compartí tu lanzamiento, idea de partnership o link de producto y te llevamos a la conversación correcta.",
      fields: [
        {
          id: "name",
          label: "Tu nombre",
          type: "text",
          required: true,
        },
        {
          id: "email",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          id: "url",
          label: "URL de producción",
          type: "url",
        },
        {
          id: "note",
          label: "Cuéntanos sobre tu producto",
          type: "textarea",
        },
      ] satisfies ContactField[],
      channels: [
        {
          title: "Inbox editorial",
          value: "hello@aiproject.gallery",
          href: "mailto:hello@aiproject.gallery",
          description:
            "Para partnerships, lanzamientos y conversaciones sobre fichas destacadas.",
        },
        {
          title: "Estándar editorial",
          value: "Productos sólidos, historias claras",
          description:
            "Buscamos productos en vivo, posicionamiento claro y suficiente detalle técnico para que la ficha sea útil.",
        },
        {
          title: "Estilo de respuesta",
          value: "Asíncrono y friendly con founders",
          description:
            "Una nota concisa, un link y un poco de contexto alcanzan para iniciar la conversación.",
        },
      ] satisfies ContactChannel[],
    },
  },
} as const

export type SiteContent = (typeof siteContentByLocale)[Locale]

export function getSiteContent(locale: Locale) {
  return siteContentByLocale[locale]
}

export const siteContent = siteContentByLocale.en
