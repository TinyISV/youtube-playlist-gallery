import { Playlist, SortOption, SortDirection } from '@/types/video';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FilterBarProps {
  playlists: Playlist[];
  selectedPlaylist: string;
  onPlaylistChange: (playlistId: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  sortDirection: SortDirection;
  onDirectionChange: (direction: SortDirection) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalVideos: number;
  filteredCount: number;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'views', label: 'Views' },
  { value: 'likes', label: 'Likes' },
  { value: 'comments', label: 'Comments' },
  { value: 'date', label: 'Date' },
];

export function FilterBar({
  playlists,
  selectedPlaylist,
  onPlaylistChange,
  sortBy,
  onSortChange,
  sortDirection,
  onDirectionChange,
  searchQuery,
  onSearchChange,
  totalVideos,
  filteredCount,
}: FilterBarProps) {
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
            {/* Playlist Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedPlaylist} onValueChange={onPlaylistChange}>
                <SelectTrigger className="w-[200px] bg-secondary/50 border-border/50">
                  <SelectValue placeholder="All Playlists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Playlists</SelectItem>
                  {playlists.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      {playlist.title} ({playlist.videoCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
            
            {/* Count */}
            <div className="text-sm text-muted-foreground ml-auto lg:ml-0">
              {filteredCount === totalVideos ? (
                <span>{totalVideos} videos</span>
              ) : (
                <span>{filteredCount} of {totalVideos} videos</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
