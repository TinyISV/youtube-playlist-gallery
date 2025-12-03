import { useState, useMemo } from 'react';
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
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('views');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAndSortedVideos = useMemo(() => {
    let result = [...data.videos];

    // Filter by playlist
    if (selectedPlaylist !== 'all') {
      result = result.filter((video) => video.playlistId === selectedPlaylist);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.channelTitle.toLowerCase().includes(query) ||
          video.playlistTitle.toLowerCase().includes(query)
      );
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
  }, [selectedPlaylist, sortBy, sortDirection, searchQuery]);

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
      <Header lastUpdated={data.lastUpdated} />
      
      <FilterBar
        playlists={data.playlists}
        selectedPlaylist={selectedPlaylist}
        onPlaylistChange={setSelectedPlaylist}
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
