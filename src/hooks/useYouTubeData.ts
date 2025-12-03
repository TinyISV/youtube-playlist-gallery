import { useState, useEffect } from 'react';
import { Video, Playlist } from '@/types/video';
import staticData from '@/data/videos.json';

const GOOGLE_API_KEY = 'AIzaSyCTeMAiva670SvVTN0YGJzxPZiCIJpyYY0';
const PLAYLIST_IDS = [
  'PLe6FX2SlkJdQ8jcbDZSFJWG7CPXMWi_yf',
  'PLRsbF2sD7JVpFS401AnYmuIXqI6v-VS1C',
  'PLf38f5LhQtheyZH8n2lQcwr-c7RYPFGQc',
  'PLj6h78yzYM2MP0QhYFK8HOb8UqgbIkLMc',
  'PLf38f5LhQthf6Xv_6wWHR7H4oXabSgvhC',
  'PLX8CzqL3ArzVV1xRJkRbcM2tOgVwytJAi',
  'PLj6h78yzYM2OAwmXucz-MoggvBuwOPkqN',
  'PLj6h78yzYM2N6QjKFVmcxJtHLjhlB453X',
  'PLj6h78yzYM2O7PaLWCNCE5wKhzmzF4b6A',
  'PLj6h78yzYM2P1xtALqTcCmRAa6142uERl',
  'PLAdzTan_eSPSX8CLTSRXq62l8i7pRGtF4',
  'PLj6h78yzYM2On4kCcnWjlO2lpHq-etZ1d',
  'PLRsbF2sD7JVrgzHNkX4wUHmoGICMaE446',
  'PL2yQDdvlhXf9gdFFBcDPUHAJS7kkIkIet',
];

interface YouTubeData {
  videos: Video[];
  playlists: Playlist[];
  lastUpdated: string | null;
}

function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function fetchPlaylistInfo(playlistIds: string[]): Promise<Map<string, any>> {
  const map = new Map();
  
  for (let i = 0; i < playlistIds.length; i += 50) {
    const batch = playlistIds.slice(i, i + 50);
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${batch.join(',')}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items) {
      for (const item of data.items) {
        map.set(item.id, item);
      }
    }
  }
  
  return map;
}

async function fetchPlaylistItems(playlistId: string): Promise<any[]> {
  const items: any[] = [];
  let nextPageToken: string | undefined;
  
  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${GOOGLE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items) {
      items.push(...data.items);
    }
    
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);
  
  return items;
}

async function fetchVideoStats(videoIds: string[]): Promise<Map<string, any>> {
  const map = new Map();
  
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${batch.join(',')}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items) {
      for (const item of data.items) {
        map.set(item.id, item);
      }
    }
  }
  
  return map;
}

export function useYouTubeData() {
  const [data, setData] = useState<YouTubeData>({
    videos: [],
    playlists: [],
    lastUpdated: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  useEffect(() => {
    // Check if we have static data
    const typedStaticData = staticData as YouTubeData;
    if (typedStaticData.videos && typedStaticData.videos.length > 0) {
      setData(typedStaticData);
      setIsLoading(false);
      return;
    }

    // Fetch from YouTube API
    async function fetchData() {
      try {
        setProgress('Fetching playlist information...');
        const playlistInfoMap = await fetchPlaylistInfo(PLAYLIST_IDS);
        
        const playlists: Playlist[] = [];
        for (const [id, info] of playlistInfoMap) {
          playlists.push({
            id,
            title: info.snippet.title,
            channelTitle: info.snippet.channelTitle,
            videoCount: info.contentDetails.itemCount,
          });
        }

        setProgress('Fetching videos from playlists...');
        const allItems: { item: any; playlistId: string }[] = [];
        
        for (let i = 0; i < PLAYLIST_IDS.length; i++) {
          const playlistId = PLAYLIST_IDS[i];
          setProgress(`Fetching playlist ${i + 1}/${PLAYLIST_IDS.length}...`);
          const items = await fetchPlaylistItems(playlistId);
          for (const item of items) {
            allItems.push({ item, playlistId });
          }
        }

        const videoIds = [...new Set(allItems.map(({ item }) => item.snippet?.resourceId?.videoId).filter(Boolean))];
        
        setProgress('Fetching video statistics...');
        const statsMap = await fetchVideoStats(videoIds);

        const videos: Video[] = [];
        const seenIds = new Set<string>();
        
        for (const { item, playlistId } of allItems) {
          const videoId = item.snippet?.resourceId?.videoId;
          if (!videoId || seenIds.has(videoId)) continue;
          seenIds.add(videoId);
          
          const stats = statsMap.get(videoId);
          const playlistInfo = playlistInfoMap.get(playlistId);
          
          if (!stats) continue;
          
          videos.push({
            id: videoId,
            title: item.snippet.title,
            description: item.snippet.description || '',
            thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
            thumbnailHigh: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            publishedAt: item.snippet.publishedAt,
            channelTitle: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            playlistId,
            playlistTitle: playlistInfo?.snippet?.title || 'Unknown Playlist',
            viewCount: parseInt(stats.statistics?.viewCount || '0'),
            likeCount: parseInt(stats.statistics?.likeCount || '0'),
            commentCount: parseInt(stats.statistics?.commentCount || '0'),
            duration: parseDuration(stats.contentDetails?.duration || ''),
          });
        }

        videos.sort((a, b) => b.viewCount - a.viewCount);

        setData({
          videos,
          playlists,
          lastUpdated: new Date().toISOString(),
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch YouTube data:', err);
        setError('Failed to load video data. Please try again later.');
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, isLoading, error, progress };
}
