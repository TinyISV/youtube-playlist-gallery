import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { VideoGrid } from '@/components/VideoGrid';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { SortOption, SortDirection } from '@/types/video';
import { useYouTubeData } from '@/hooks/useYouTubeData';

const Index = () => {
  const { data, isLoading, error, progress } = useYouTubeData();
  
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
  }, [data.videos, selectedPlaylist, sortBy, sortDirection, searchQuery]);

  if (isLoading) {
    return <LoadingState progress={progress} />;
  }

  if (error) {
    return <ErrorState message={error} />;
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
          <p>
            Built with React • Data fetched from YouTube API
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
