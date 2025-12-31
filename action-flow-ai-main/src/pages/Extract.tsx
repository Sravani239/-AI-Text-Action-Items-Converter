import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ActionItemsTable } from '@/components/ActionItemsTable';
import { useExtractions, extractActionItems, ActionItem } from '@/hooks/useExtractions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Video, Loader2, Sparkles, Save, RotateCcw } from 'lucide-react';

const SAMPLE_TEXT = `Team Sync Meeting - December 27, 2024

[00:00] Sarah: Good morning everyone. Let's go through our updates and next steps.

[00:15] John: I've completed the initial design mockups. Sarah will need to review them by Friday.

[00:45] Mike: The API integration is almost done. I'll finish it by end of day tomorrow and then Lisa should test it.

[01:30] Lisa: Sounds good. I also need to update the documentation - that's high priority and should be done by Monday.

[02:00] Sarah: Great progress! David, can you follow up with the client about the timeline? They need an update by next Wednesday.

[02:30] David: Will do. Also, John needs to send me the latest assets ASAP for the presentation.

[03:00] Sarah: One more thing - Mike, please schedule a code review session with Alex by end of week. It's critical for the launch.

[03:30] John: I'll also create the user guide. It should be ready by January 5th.`;

export default function Extract() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'text');
  const [text, setText] = useState('');
  const [zoomUrl, setZoomUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [title, setTitle] = useState('');
  const { saveExtraction } = useExtractions();
  const { toast } = useToast();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'zoom') {
      setActiveTab('zoom');
    }
  }, [searchParams]);

  const handleExtractFromText = async () => {
    if (!text.trim()) {
      toast({
        title: 'No text provided',
        description: 'Please paste some meeting notes to extract action items',
        variant: 'destructive',
      });
      return;
    }

    setIsExtracting(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const items = extractActionItems(text);
      setActionItems(items);
      
      if (items.length === 0) {
        toast({
          title: 'No action items found',
          description: 'Try adding clearer action statements with owners and deadlines',
        });
      } else {
        toast({
          title: 'Extraction complete',
          description: `Found ${items.length} action items`,
        });
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleImportFromZoom = async () => {
    if (!zoomUrl.trim()) {
      toast({
        title: 'No URL provided',
        description: 'Please enter a Zoom cloud recording URL',
        variant: 'destructive',
      });
      return;
    }

    if (!zoomUrl.includes('zoom.us')) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid Zoom URL',
        variant: 'destructive',
      });
      return;
    }


    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('zoom-transcript', {
        body: { zoomUrl },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to import transcript');
      }

      setText(data.transcript);
      setActiveTab('text');
      
      // Auto-extract
      const items = extractActionItems(data.transcript);
      setActionItems(items);
      
      toast({
        title: 'Import successful',
        description: `Imported transcript and found ${items.length} action items`,
      });
    } catch (error) {
      console.error('Zoom import error:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import from Zoom',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSave = () => {
    if (actionItems.length === 0) {
      toast({
        title: 'No items to save',
        description: 'Extract action items first before saving',
        variant: 'destructive',
      });
      return;
    }

    const extractionTitle = title.trim() || `Extraction ${new Date().toLocaleDateString()}`;
    
    saveExtraction({
      title: extractionTitle,
      source: activeTab === 'zoom' ? 'zoom' : 'text',
      sourceUrl: activeTab === 'zoom' ? zoomUrl : undefined,
      rawText: text,
      actionItems,
    });

    toast({
      title: 'Saved successfully',
      description: 'Your extraction has been saved to history',
    });

    navigate('/history');
  };

  const handleReset = () => {
    setText('');
    setZoomUrl('');
    setActionItems([]);
    setTitle('');
  };

  const loadSample = () => {
    setText(SAMPLE_TEXT);
    toast({
      title: 'Sample loaded',
      description: 'Click "Extract Action Items" to process',
    });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Extract Action Items</h1>
          <p className="mt-1 text-muted-foreground">
            Paste meeting notes or import from Zoom
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="text" className="gap-2">
              <FileText className="h-4 w-4" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="zoom" className="gap-2">
              <Video className="h-4 w-4" />
              Zoom Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Meeting Notes</h2>
                <Button variant="ghost" size="sm" onClick={loadSample}>
                  Load Sample
                </Button>
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your meeting notes, transcript, or any text containing action items..."
                className="min-h-[250px] resize-none"
              />
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={handleExtractFromText}
                  disabled={isExtracting || !text.trim()}
                  className="gap-2"
                >
                  {isExtracting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Extract Action Items
                </Button>
                {text && (
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="zoom" className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Zoom Cloud Recording URL</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Paste a Zoom cloud recording URL to import the transcript and extract action items.
              </p>
              <Input
                value={zoomUrl}
                onChange={(e) => setZoomUrl(e.target.value)}
                placeholder="https://zoom.us/rec/share/..."
                className="mb-4"
              />
              <Button
                onClick={handleImportFromZoom}
                disabled={isImporting || !zoomUrl.trim()}
                className="gap-2"
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                Import & Extract
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Results */}
        {actionItems.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Extracted Action Items ({actionItems.length})
              </h2>
            </div>

            <ActionItemsTable items={actionItems} />

            {/* Save section */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Save Extraction</h3>
              <div className="flex gap-3">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Extraction title (optional)"
                  className="max-w-sm"
                />
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save to History
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
