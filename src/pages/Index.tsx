import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { VideoGrid } from '@/components/VideoGrid';
import { Video, Playlist, SortOption, SortDirection } from '@/types/video';
import videoData from '@/data/videos.json';

// Type assertion for imported JSON
const data = videoData as {
  videos: Video[];
  playlists: Playlist[];
  lastUpdated: string | null;
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read state from URL params
  const selectedPlaylists = searchParams.get('playlists')?.split(',').filter(Boolean) || [];
  const sortBy = (searchParams.get('sort') as SortOption) || 'views';
  const sortDirection = (searchParams.get('dir') as SortDirection) || 'desc';
  const searchQuery = searchParams.get('q') || '';

  // Update URL params helper
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      return newParams;
    });
  }, [setSearchParams]);

  const setSelectedPlaylists = useCallback((playlists: string[]) => {
    updateParams({ playlists: playlists.length > 0 ? playlists.join(',') : null });
  }, [updateParams]);

  const setSortBy = useCallback((sort: SortOption) => {
    updateParams({ sort: sort === 'views' ? null : sort });
  }, [updateParams]);

  const setSortDirection = useCallback((dir: SortDirection) => {
    updateParams({ dir: dir === 'desc' ? null : dir });
  }, [updateParams]);

  const setSearchQuery = useCallback((query: string) => {
    updateParams({ q: query || null });
  }, [updateParams]);

  const filteredAndSortedVideos = useMemo(() => {
    let result = [...data.videos];

    // Filter by playlists (multiple selection)
    if (selectedPlaylists.length > 0) {
      result = result.filter((video) => selectedPlaylists.includes(video.playlistId));
    }

    // Filter by search query with AND/OR support
    if (searchQuery.trim()) {
      const searchText = searchQuery.trim();
      
      const matchesVideo = (video: Video, term: string) => {
        const t = term.toLowerCase().trim();
        return video.title.toLowerCase().includes(t) ||
               video.channelTitle.toLowerCase().includes(t) ||
               video.playlistTitle.toLowerCase().includes(t);
      };

      // Check for OR (case insensitive)
      if (searchText.toLowerCase().includes(' or ')) {
        const orTerms = searchText.split(/\s+or\s+/i).filter(Boolean);
        result = result.filter(video => 
          orTerms.some(term => matchesVideo(video, term))
        );
      }
      // Check for AND (case insensitive) 
      else if (searchText.toLowerCase().includes(' and ')) {
        const andTerms = searchText.split(/\s+and\s+/i).filter(Boolean);
        result = result.filter(video => 
          andTerms.every(term => matchesVideo(video, term))
        );
      }
      // Default: simple contains search
      else {
        const query = searchText.toLowerCase();
        result = result.filter(video => matchesVideo(video, query));
      }
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'views':
          comparison = a.viewCount - b.viewCount;
          break;
        case 'likes':
          comparison = a.likeCount - b.likeCount;
          break;
        case 'comments':
          comparison = a.commentCount - b.commentCount;
          break;
        case 'date':
          comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [selectedPlaylists, sortBy, sortDirection, searchQuery]);

  // Show message if no data
  if (data.videos.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-6">📺</div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-3">No Videos Yet</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          Run the build script to fetch videos from YouTube:
        </p>
        <code className="bg-secondary px-4 py-2 rounded-lg text-sm text-primary">
          GOOGLE_API_KEY=xxx PLAYLIST_IDS=xxx npx tsx scripts/fetch-youtube-data.ts
        </code>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <FilterBar
        playlists={data.playlists}
        selectedPlaylists={selectedPlaylists}
        onPlaylistChange={setSelectedPlaylists}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortDirection={sortDirection}
        onDirectionChange={setSortDirection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalVideos={data.videos.length}
        filteredCount={filteredAndSortedVideos.length}
      />

      <main className="container py-8">
        <VideoGrid videos={filteredAndSortedVideos} />
      </main>

      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Data refreshed daily • Built with React</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
