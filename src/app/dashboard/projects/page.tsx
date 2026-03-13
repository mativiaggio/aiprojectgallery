import type { Metadata } from 'next';

import { AnalysisQueuePanel } from '@/components/research/analysis-queue-panel';
import { DashboardProjectCard } from '@/components/projects/dashboard-project-card';
import { LinkButton } from '@/components/link-button';
import { getOrganizationProjects } from '@/lib/projects/service';
import { PROJECT_STATUS } from '@/lib/projects/types';
import { ArrowRightIcon } from 'lucide-react';
import { requireDashboardContext } from '@/lib/organizations/service';
import { getOrganizationAnalysisQueue } from '@/lib/research/service';

export const metadata: Metadata = {
  title: 'Projects',
};

export default async function DashboardProjectsPage() {
  const context = await requireDashboardContext('/dashboard/projects');
  const [projects, analysisQueue] = await Promise.all([
    getOrganizationProjects({
      organizationId: context.activeOrganization.id,
      userId: context.session.user.id,
      role: context.activeMember.role,
    }),
    getOrganizationAnalysisQueue(context.activeOrganization.id),
  ]);
  const counts = {
    published: projects.filter(
      (project) => project.status === PROJECT_STATUS.published,
    ).length,
    processing: projects.filter(
      (project) => project.status === PROJECT_STATUS.processing,
    ).length,
    failed: projects.filter(
      (project) => project.status === PROJECT_STATUS.failed,
    ).length,
  };

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">
            Projects
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Keep the dashboard focused on project state and jump into management
            only when you need to edit metadata, verify ownership, or delete a
            listing.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border bg-card sm:grid-cols-3 xl:grid-cols-1">
          <StatBlock label="Published" value={counts.published} />
          <StatBlock label="Processing" value={counts.processing} />
          <StatBlock label="Needs attention" value={counts.failed} />
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {projects.length} {projects.length === 1 ? 'project' : 'projects'} in
          {' '}{context.activeOrganization.name}
        </div>
        <LinkButton
          href="/dashboard/submissions"
          size="lg"
          animated
          animation="arrow">
          Submit another project
          <ArrowRightIcon data-icon="inline-end" />
        </LinkButton>
      </section>

      <AnalysisQueuePanel
        activeRuns={analysisQueue.activeRuns}
        upcomingProjects={analysisQueue.upcomingProjects}
      />

      {projects.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {projects.map((project) => (
            <DashboardProjectCard key={project.id} project={project} />
          ))}
        </section>
      ) : (
        <section className="rounded-[1.3rem] border border-dashed bg-muted/15 px-6 py-12">
          <h2 className="text-xl font-medium tracking-[-0.03em]">
            No projects yet
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            The dashboard is ready for your first listing. Create a submission
            and the project will appear here immediately, even while the
            screenshot is still processing.
          </p>
          <div className="mt-5">
            <LinkButton href="/dashboard/submissions" size="sm">
              Start your first submission
            </LinkButton>
          </div>
        </section>
      )}
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-b px-5 py-5 last:border-b-0 sm:border-r sm:last:border-r-0 xl:border-r-0 xl:last:border-b-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
        {value}
      </div>
    </div>
  );
}
