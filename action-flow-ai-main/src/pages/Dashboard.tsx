import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { ActionItemsTable } from '@/components/ActionItemsTable';
import { useExtractions } from '@/hooks/useExtractions';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, TrendingUp, Plus, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { extractions } = useExtractions();

  const totalItems = extractions.reduce((acc, e) => acc + e.actionItems.length, 0);
  const highPriorityItems = extractions.reduce(
    (acc, e) => acc + e.actionItems.filter(i => i.priority === 'high').length,
    0
  );
  const recentExtraction = extractions[0];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Overview of your extracted action items
            </p>
          </div>
          <Link to="/extract">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Extraction
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Extractions"
            value={extractions.length}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            title="Action Items"
            value={totalItems}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <StatCard
            title="High Priority"
            value={highPriorityItems}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="This Week"
            value={extractions.filter(e => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(e.createdAt) > weekAgo;
            }).length}
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Link
            to="/extract"
            className="group flex items-center justify-between rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:glow"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Paste Meeting Notes</h3>
                <p className="text-sm text-muted-foreground">Extract action items from text</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </Link>

          <Link
            to="/extract?tab=zoom"
            className="group flex items-center justify-between rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v12h16V6H4zm12 2.5l4-2.5v10l-4-2.5V8.5z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Import from Zoom</h3>
                <p className="text-sm text-muted-foreground">Extract from cloud recordings</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
        </div>

        {/* Recent extraction */}
        {recentExtraction && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Recent Extraction</h2>
              <Link to="/history">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{recentExtraction.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(recentExtraction.createdAt).toLocaleDateString()} • {recentExtraction.actionItems.length} items
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                  {recentExtraction.source}
                </span>
              </div>
              <ActionItemsTable items={recentExtraction.actionItems.slice(0, 5)} compact />
            </div>
          </div>
        )}

        {/* Empty state */}
        {extractions.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No extractions yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Start by pasting meeting notes or importing from Zoom to extract action items
            </p>
            <Link to="/extract" className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create your first extraction
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
