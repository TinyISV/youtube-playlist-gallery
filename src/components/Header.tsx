import { Play, RefreshCw } from 'lucide-react';

interface HeaderProps {
  lastUpdated: string | null;
}

export function Header({ lastUpdated }: HeaderProps) {
  const formattedDate = lastUpdated 
    ? new Date(lastUpdated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <header className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      <div className="container relative py-12 lg:py-16">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Play className="w-8 h-8 text-primary fill-primary" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight">
            <span className="text-gradient">Video</span>{' '}
            <span className="text-foreground">Gallery</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-muted-foreground max-w-xl">
            Explore curated video collections. Sort by popularity, filter by playlist, 
            and discover great content.
          </p>
          
          {/* Last updated */}
          {formattedDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground/70 mt-4">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Last updated: {formattedDate}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
