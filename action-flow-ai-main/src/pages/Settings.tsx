import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useExtractions } from '@/hooks/useExtractions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Trash2, LogOut } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const { extractions, clearAll } = useExtractions();
  const { toast } = useToast();

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to delete all extractions? This cannot be undone.')) {
      clearAll();
      toast({
        title: 'History cleared',
        description: 'All extractions have been deleted',
      });
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Clear History</p>
                <p className="text-sm text-muted-foreground">
                  Delete all {extractions.length} extractions
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearHistory}
                disabled={extractions.length === 0}
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sign out */}
        <Button variant="outline" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </AppLayout>
  );
}
