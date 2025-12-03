import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-muted-foreground text-sm">
            {message}
          </p>
        </div>
        
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
