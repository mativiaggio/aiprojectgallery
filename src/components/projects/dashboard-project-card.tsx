import { ArrowRightIcon, ExternalLink, Github } from 'lucide-react';

import { ProjectImage } from '@/components/projects/project-image';
import { ProjectVerifiedBadge } from '@/components/projects/project-verified-badge';
import { SaveToCollectionMenu } from '@/components/research/save-to-collection-menu';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/link-button';
import { PROJECT_STATUS } from '@/lib/projects/types';

type DashboardProjectCardProps = {
  project: {
    id: string;
    slug: string;
    name: string;
    appUrl: string;
    repositoryUrl: string | null;
    status: string;
    screenshotUrl: string | null;
    verified: boolean;
    authorName: string;
    collectionCount: number;
    linkedCollections: Array<{
      id: string;
      name: string;
      containsProject: boolean;
    }>;
    featureGapCount: number;
    topFeatureGap: {
      title: string;
      impact: string;
      confidence: number;
    } | null;
    canManage: boolean;
  };
};

export function DashboardProjectCard({ project }: DashboardProjectCardProps) {
  const statusChip =
    project.status === PROJECT_STATUS.processing
      ? 'Processing'
      : project.status === PROJECT_STATUS.failed
        ? 'Needs attention'
        : null;

  return (
    <Card className="h-full py-0 shadow-none">
      <div className="relative border-b border-border/70">
        {project.screenshotUrl ? (
          <ProjectImage
            src={project.screenshotUrl}
            alt={`${project.name} screenshot`}
            className="w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video items-end bg-[linear-gradient(180deg,rgba(17,17,20,0),rgba(17,17,20,0.04))] p-4">
            <div className="rounded-md border border-border/70 bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
              Preview pending
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          {statusChip ? (
            <Badge
              variant="outline"
              className={
                project.status === PROJECT_STATUS.failed
                  ? 'border-amber-500/25 bg-background/95 text-amber-800 backdrop-blur dark:text-amber-300'
                  : 'bg-background/95 text-foreground backdrop-blur'
              }>
              {statusChip}
            </Badge>
          ) : (
            <span />
          )}

          {project.verified ? (
            <ProjectVerifiedBadge className="bg-background/95 backdrop-blur" />
          ) : null}
        </div>
      </div>

      <CardHeader className="py-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg tracking-[-0.03em]">
              {project.name}
            </CardTitle>
            {!project.verified && project.status === PROJECT_STATUS.published ? (
              <Badge variant="outline" className="text-muted-foreground">
                Live
              </Badge>
            ) : null}
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>Created by {project.authorName}</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {project.collectionCount} collection{project.collectionCount === 1 ? '' : 's'}
              </Badge>
              {project.topFeatureGap ? (
                <Badge variant="outline">
                  Next move: {project.topFeatureGap.title}
                </Badge>
              ) : null}
              {project.linkedCollections.slice(0, 2).map((collection) => (
                <Badge key={collection.id} variant="outline" className="text-muted-foreground">
                  {collection.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="flex flex-wrap items-center gap-2 border-t bg-card">
          <LinkButton
            href={`/dashboard/projects/${project.id}`}
            size="sm"
            animated
            animation="arrow">
            {project.canManage ? 'Manage' : 'Open'}
            <ArrowRightIcon data-icon="inline-end" />
          </LinkButton>
          <LinkButton
            href={project.appUrl}
            target="_blank"
            rel="noreferrer"
            variant="outline"
            size="sm"
            animated
            animation="border">
            Open app
            <ExternalLink data-icon="inline-end" />
          </LinkButton>
          {project.repositoryUrl ? (
            <LinkButton
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              variant="outline"
              size="sm"
              animated
              animation="border">
              Open repo
              <Github data-icon="inline-end" />
            </LinkButton>
          ) : null}
          <SaveToCollectionMenu projectId={project.id} />
          {project.status === PROJECT_STATUS.published ? (
            <LinkButton
              href={`/projects/${project.slug}`}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              size="sm"
              animated
              animation="underline">
              View listing
            </LinkButton>
          ) : (
            <span className="text-sm text-muted-foreground">
              {project.canManage
                ? 'Open details to manage this project.'
                : 'Open details to review this organization project.'}
            </span>
          )}
      </CardFooter>
    </Card>
  );
}
