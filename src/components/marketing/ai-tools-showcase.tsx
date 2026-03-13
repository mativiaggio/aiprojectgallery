import type { CSSProperties } from 'react';
import {
  DEFAULT_AI_TOOL_OPTIONS,
  type DefaultAiToolOption,
} from '@/lib/projects/ai-tools';
import { cn } from '@/lib/utils';
import { ProjectImage } from '../projects/project-image';
import { Badge } from '../ui/badge';

const TILE_HEIGHT = 98;
const TILE_GAP = 16;
const COLUMN_DIRECTIONS = ['up', 'down', 'up', 'down'] as const;
const COLUMN_VISIBILITY = [
  'block',
  'block',
  'hidden md:block',
  'hidden lg:block',
] as const;

type HomeLandingProps = {
  projects: Array<{
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    appUrl: string;
    screenshotUrl: string | null;
    aiTools: string[];
    tags: string[];
    authorName: string;
    verified: boolean;
  }>;
};

export function AiToolsShowcase({ projects }: HomeLandingProps) {
  const columns = distributeTools(
    DEFAULT_AI_TOOL_OPTIONS,
    COLUMN_DIRECTIONS.length,
  );
  const featuredProject = projects[0] ?? null;

  return (
    <section className="mx-auto mt-24 max-w-7xl overflow-hidden border bg-card rounded-2xl flex flex-col">
      <div className="flex">
        <div className="w-1/2 flex flex-col justify-between gap-8 border-b p-6 px-4 py-4 sm:px-6 sm:py-6 border-r">
          <div>
            {featuredProject ? (
              <>
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-sm">
                      <div className="text-sm font-medium">
                        Latest published entry
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        A real submission from the live catalog, complete with
                        generated preview and stack metadata.
                      </p>
                    </div>
                    <Badge variant="outline">Live</Badge>
                  </div>
                  <div className="mt-6 overflow-hidden rounded-[1.1rem] border bg-panel">
                    {featuredProject.screenshotUrl !== null ? (
                      <ProjectImage
                        src={featuredProject.screenshotUrl}
                        alt={`${featuredProject.name} screenshot`}
                        className="w-full object-cover"
                      />
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="max-w-lg">
                  <div className="text-sm font-medium">
                    The gallery is ready
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    The public grid turns on as soon as the first submission
                    finishes its screenshot pipeline. Submit a live product to
                    seed the catalog and define the early quality bar.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 relative overflow-hidden bg-panel border-b p-4 sm:p-6 lg:p-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-card via-card/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-card via-card/80 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-linear-to-b from-card via-card/78 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-linear-to-t from-card via-card/78 to-transparent" />

          <div
            className="grid h-120 grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
            style={fadeMaskStyle}>
            {columns.map((column, index) => (
              <AiToolColumn
                key={`column-${index}`}
                tools={column}
                direction={COLUMN_DIRECTIONS[index]}
                className={COLUMN_VISIBILITY[index]}
              />
            ))}
          </div>
        </div>
      </div>

      {featuredProject ? (
        <div className="col-span-2 flex w-full rounded-2xl border-none">
          <div className="w-1/2 p-5 sm:p-6">
            <div className="text-2xl font-semibold tracking-[-0.05em]">
              {featuredProject.name}
            </div>
            <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
              {featuredProject.shortDescription}
            </p>
            <div className="mt-6 flex flex-col gap-4">
              <DetailRow label="Production URL" value={featuredProject.appUrl} />
              <DetailRow
                label="AI tools"
                value={featuredProject.aiTools.join(' + ') || 'Stack pending'}
              />
              <DetailRow
                label="Tags"
                value={featuredProject.tags.join(' · ') || 'Gallery'}
              />
              <DetailRow label="Author" value={featuredProject.authorName} />
            </div>
          </div>

          <div className="w-1/2 p-5 sm:p-6">
            <div className="text-sm font-medium">Why it reads well</div>
            <div className="mt-5 space-y-5">
              <MetricBlock
                label="Preview first"
                value="Screenshot-led card"
                description="People can judge launch quality before they commit to another click."
              />
              <MetricBlock
                label="Context"
                value="Tools + tags"
                description="The technical layer stays attached to the project instead of buried in a detail drawer."
              />
              <MetricBlock
                label="Visibility"
                value="Published only"
                description="Processing and failed submissions stay out of public view until the listing is complete."
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="col-span-2 border-t p-5 sm:p-6">
          <div className="max-w-2xl">
            <div className="text-sm font-medium">No featured project yet</div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Once the first published submission clears screenshot processing,
              this section will expand with the live project profile and
              editorial breakdown.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function AiToolColumn({
  tools,
  direction,
  className,
}: {
  tools: DefaultAiToolOption[];
  direction: (typeof COLUMN_DIRECTIONS)[number];
  className?: string;
}) {
  const motionStyle = {
    '--column-duration': `${Math.max(18, tools.length * 4.2)}s`,
    '--column-gap': `${TILE_GAP}px`,
    '--column-shift': `${tools.length * (TILE_HEIGHT + TILE_GAP)}px`,
  } as CSSProperties;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[1.35rem] border border-border/70 bg-background/80 p-2',
        className,
      )}>
      <div
        className={cn(
          'ai-column-track',
          direction === 'up' ? 'ai-column-track--up' : 'ai-column-track--down',
        )}
        style={motionStyle}>
        {Array.from({ length: 2 }, (_, copyIndex) => (
          <div
            key={`copy-${copyIndex}`}
            className="flex flex-col"
            style={{ gap: `${TILE_GAP}px` }}>
            {tools.map((tool) => (
              <AiToolTile key={`${copyIndex}-${tool.id}`} tool={tool} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AiToolTile({ tool }: { tool: DefaultAiToolOption }) {
  const tileStyle = {
    background: `color-mix(in srgb, ${tool.accent} 8%, var(--card))`,
    borderColor: `color-mix(in srgb, ${tool.accent} 20%, var(--border))`,
  } as CSSProperties;

  const markStyle = {
    borderColor: `color-mix(in srgb, ${tool.accent} 24%, var(--border))`,
    background: tool.icon
      ? 'color-mix(in srgb, var(--card) 86%, transparent)'
      : `color-mix(in srgb, ${tool.accent} 84%, white 16%)`,
    color: tool.icon ? tool.accent : '#ffffff',
  } as CSSProperties;

  return (
    <div
      className="flex h-24.5 flex-col items-center justify-center rounded-[1.1rem] border px-3 text-center"
      style={tileStyle}>
      <div
        className="flex size-12 items-center justify-center rounded-full border"
        style={markStyle}
        aria-hidden="true">
        {tool.icon ? (
          <svg viewBox="0 0 24 24" className="size-5 fill-current">
            <path d={tool.icon.path} />
          </svg>
        ) : (
          <span className="text-[0.63rem] font-semibold tracking-[0.12em] uppercase">
            {tool.monogram}
          </span>
        )}
      </div>
      <div className="mt-3 max-w-[5.6rem] text-[0.7rem] font-medium leading-4 text-foreground/90">
        {tool.label}
      </div>
    </div>
  );
}

function distributeTools(tools: readonly DefaultAiToolOption[], count: number) {
  const columns = Array.from(
    { length: count },
    () => [] as DefaultAiToolOption[],
  );

  tools.forEach((tool, index) => {
    columns[index % count]?.push(tool);
  });

  return columns;
}

const fadeMaskStyle = {
  WebkitMaskImage:
    'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
  maskImage:
    'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
} as CSSProperties;

function MetricBlock({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="border-b pb-5 last:border-b-0 last:pb-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-base font-medium tracking-[-0.03em]">
        {value}
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-t pt-4 first:border-t-0 first:pt-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium leading-6">{value}</div>
    </div>
  );
}
