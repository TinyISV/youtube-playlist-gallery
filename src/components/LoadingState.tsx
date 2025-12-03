import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  progress: string;
}

export function LoadingState({ progress }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Animated glow */}
        <div className="absolute inset-0 blur-3xl bg-primary/20 animate-pulse rounded-full" />
        
        {/* Spinner */}
        <div className="relative bg-card border border-border rounded-2xl p-12 text-center space-y-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          
          <div className="space-y-2">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Loading Videos
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              {progress || 'Fetching data from YouTube...'}
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="w-64 h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent animate-shimmer w-1/2 bg-[length:200%_100%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
