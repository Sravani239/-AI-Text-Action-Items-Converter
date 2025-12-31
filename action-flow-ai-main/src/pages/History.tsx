import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ActionItemsTable } from '@/components/ActionItemsTable';
import { useExtractions, Extraction } from '@/hooks/useExtractions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Trash2, Eye, FileText, Video, Clock } from 'lucide-react';

export default function History() {
  const { extractions, deleteExtraction } = useExtractions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtraction, setSelectedExtraction] = useState<Extraction | null>(null);
  const { toast } = useToast();

  const filteredExtractions = extractions.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.rawText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteExtraction(id);
    toast({
      title: 'Deleted',
      description: 'Extraction removed from history',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">History</h1>
            <p className="mt-1 text-muted-foreground">
              View and manage your past extractions
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search extractions..."
              className="pl-9"
            />
          </div>
        </div>

        {/* List */}
        {filteredExtractions.length > 0 ? (
          <div className="space-y-3">
            {filteredExtractions.map((extraction) => (
              <div
                key={extraction.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {extraction.source === 'zoom' ? (
                      <Video className="h-5 w-5 text-accent" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{extraction.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(extraction.createdAt).toLocaleDateString()}
                      </span>
                      <span>{extraction.actionItems.length} items</span>
                      <span className="capitalize">{extraction.source}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedExtraction(extraction)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(extraction.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {searchQuery ? 'No results found' : 'No extractions yet'}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Your saved extractions will appear here'}
            </p>
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedExtraction} onOpenChange={() => setSelectedExtraction(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedExtraction?.title}</DialogTitle>
            </DialogHeader>
            {selectedExtraction && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(selectedExtraction.createdAt).toLocaleString()}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                    {selectedExtraction.source}
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Action Items ({selectedExtraction.actionItems.length})
                  </h4>
                  <ActionItemsTable items={selectedExtraction.actionItems} />
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Original Text</h4>
                  <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedExtraction.rawText}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
