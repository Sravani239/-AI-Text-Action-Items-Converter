import { ActionItem } from '@/hooks/useExtractions';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { User, Calendar, Flag } from 'lucide-react';

interface ActionItemsTableProps {
  items: ActionItem[];
  compact?: boolean;
}

export function ActionItemsTable({ items, compact }: ActionItemsTableProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'low':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-muted-foreground';
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <Flag className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">No action items found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
            <TableHead className="text-muted-foreground font-medium">Task</TableHead>
            {!compact && <TableHead className="text-muted-foreground font-medium">Owner</TableHead>}
            <TableHead className="text-muted-foreground font-medium">Deadline</TableHead>
            <TableHead className="text-muted-foreground font-medium">Priority</TableHead>
            {!compact && <TableHead className="text-muted-foreground font-medium text-right">Confidence</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="border-border hover:bg-muted/30">
              <TableCell className={cn('font-medium', compact && 'max-w-[200px] truncate')}>
                {item.task}
              </TableCell>
              {!compact && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{item.owner}</span>
                  </div>
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">{item.deadline}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('capitalize', getPriorityColor(item.priority))}>
                  {item.priority}
                </Badge>
              </TableCell>
              {!compact && (
                <TableCell className="text-right">
                  <span className={cn('text-sm font-mono', getConfidenceColor(item.confidence))}>
                    {Math.round(item.confidence * 100)}%
                  </span>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
