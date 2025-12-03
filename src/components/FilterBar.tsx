import { useState } from 'react';
import { Playlist, SortOption, SortDirection } from '@/types/video';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X, Check } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  playlists: Playlist[];
  selectedPlaylists: string[];
  onPlaylistChange: (playlistIds: string[]) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  sortDirection: SortDirection;
  onDirectionChange: (direction: SortDirection) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalVideos: number;
  filteredCount: number;
  lastUpdated?: string | null;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'views', label: 'Views' },
  { value: 'likes', label: 'Likes' },
  { value: 'comments', label: 'Comments' },
  { value: 'date', label: 'Date' },
];

export function FilterBar({
  playlists,
  selectedPlaylists,
  onPlaylistChange,
  sortBy,
  onSortChange,
  sortDirection,
  onDirectionChange,
  searchQuery,
  onSearchChange,
  totalVideos,
  filteredCount,
  lastUpdated,
}: FilterBarProps) {
  const [playlistFilter, setPlaylistFilter] = useState('');
  
  // Get selected playlists that match filter
  const selectedPlaylistObjects = playlists.filter(p => selectedPlaylists.includes(p.id));
  
  // Get non-selected playlists that match filter
  const nonSelectedFiltered = playlists.filter(p => 
    !selectedPlaylists.includes(p.id) &&
    p.title.toLowerCase().includes(playlistFilter.toLowerCase())
  );
  
  // Combine: selected first (always visible), then filtered non-selected
  const displayedPlaylists = playlistFilter
    ? [...selectedPlaylistObjects, ...nonSelectedFiltered]
    : playlists;

  const togglePlaylist = (playlistId: string) => {
    if (selectedPlaylists.includes(playlistId)) {
      onPlaylistChange(selectedPlaylists.filter(id => id !== playlistId));
    } else {
      onPlaylistChange([...selectedPlaylists, playlistId]);
    }
  };

  const getPlaylistLabel = () => {
    if (selectedPlaylists.length === 0) return 'All Playlists';
    if (selectedPlaylists.length === 1) {
      const playlist = playlists.find(p => p.id === selectedPlaylists[0]);
      return playlist?.title || 'Select Playlists';
    }
    return `${selectedPlaylists.length} playlists`;
  };

  return (
    <div className="sticky top-0 z-10 glass border-b border-border/50 py-4">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            {/* Playlist Filter - Multi-select */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[200px] justify-between bg-secondary/50 border-border/50"
                >
                  <span className="truncate">{getPlaylistLabel()}</span>
                  {selectedPlaylists.length > 0 && (
                    <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                      {selectedPlaylists.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-2" align="start">
                <div className="space-y-1">
                  <Input
                    placeholder="Filter playlists..."
                    value={playlistFilter}
                    onChange={(e) => setPlaylistFilter(e.target.value)}
                    className="h-8 mb-2"
                  />
                  <div className="max-h-[200px] overflow-y-auto space-y-1">
                    <button
                      onClick={() => onPlaylistChange([])}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors text-left",
                        selectedPlaylists.length === 0 && "bg-accent"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 border rounded flex items-center justify-center",
                        selectedPlaylists.length === 0 ? "bg-primary border-primary" : "border-muted-foreground"
                      )}>
                        {selectedPlaylists.length === 0 && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      All Playlists
                    </button>
                    <TooltipProvider delayDuration={300}>
                      {displayedPlaylists.map((playlist) => (
                        <Tooltip key={playlist.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => togglePlaylist(playlist.id)}
                              className={cn(
                                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors text-left",
                                selectedPlaylists.includes(playlist.id) && "bg-accent"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 border rounded flex items-center justify-center flex-shrink-0",
                                selectedPlaylists.includes(playlist.id) ? "bg-primary border-primary" : "border-muted-foreground"
                              )}>
                                {selectedPlaylists.includes(playlist.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                              </div>
                              <span className="truncate">{playlist.title}</span>
                              <span className="ml-auto text-muted-foreground text-xs flex-shrink-0">({playlist.videoCount})</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[300px]">
                            <p>{playlist.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
                <SelectTrigger className="w-[130px] bg-secondary/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDirectionChange(sortDirection === 'desc' ? 'asc' : 'desc')}
                className="bg-secondary/50 border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                {sortDirection === 'desc' ? (
                  <ArrowDown className="w-4 h-4" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Count & Last Indexed */}
            <div className="text-sm text-muted-foreground ml-auto lg:ml-0 text-right">
              <div>
                {filteredCount === totalVideos ? (
                  <span>{totalVideos} videos</span>
                ) : (
                  <span>{filteredCount} of {totalVideos} videos</span>
                )}
              </div>
              {lastUpdated && (
                <div className="text-xs text-muted-foreground/60">
                  indexed {formatRelativeTime(lastUpdated)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
