export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailHigh: string;
  videoUrl: string;
  publishedAt: string;
  channelTitle: string;
  channelId: string;
  playlistId: string;
  playlistTitle: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
}

export interface Playlist {
  id: string;
  title: string;
  channelTitle: string;
  videoCount: number;
}

export type SortOption = 'views' | 'likes' | 'comments' | 'date';
export type SortDirection = 'asc' | 'desc';
