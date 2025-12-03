/**
 * YouTube Data Fetcher Script
 * 
 * Run this script before building to fetch fresh data from YouTube API:
 * npx tsx scripts/fetch-youtube-data.ts
 * 
 * Environment variables required:
 * - GOOGLE_API_KEY: Your YouTube Data API key
 * - PLAYLIST_IDS: Comma-separated list of playlist IDs
 */

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCTeMAiva670SvVTN0YGJzxPZiCIJpyYY0';
const PLAYLIST_IDS = (process.env.PLAYLIST_IDS || 'PLe6FX2SlkJdQ8jcbDZSFJWG7CPXMWi_yf,PLRsbF2sD7JVpFS401AnYmuIXqI6v-VS1C,PLf38f5LhQtheyZH8n2lQcwr-c7RYPFGQc,PLj6h78yzYM2MP0QhYFK8HOb8UqgbIkLMc,PLf38f5LhQthf6Xv_6wWHR7H4oXabSgvhC,PLX8CzqL3ArzVV1xRJkRbcM2tOgVwytJAi,PLj6h78yzYM2OAwmXucz-MoggvBuwOPkqN,PLj6h78yzYM2N6QjKFVmcxJtHLjhlB453X,PLj6h78yzYM2O7PaLWCNCE5wKhzmzF4b6A,PLj6h78yzYM2P1xtALqTcCmRAa6142uERl,PLAdzTan_eSPSX8CLTSRXq62l8i7pRGtF4,PLj6h78yzYM2On4kCcnWjlO2lpHq-etZ1d,PLRsbF2sD7JVrgzHNkX4wUHmoGICMaE446,PL2yQDdvlhXf9gdFFBcDPUHAJS7kkIkIet').split(',');

interface YouTubePlaylistItem {
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
      maxres?: { url: string };
    };
    publishedAt: string;
    channelTitle: string;
    channelId: string;
    resourceId: {
      videoId: string;
    };
  };
}

interface YouTubeVideoStats {
  id: string;
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  contentDetails: {
    duration: string;
  };
}

interface YouTubePlaylist {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
  };
  contentDetails: {
    itemCount: number;
  };
}

interface Video {
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

interface Playlist {
  id: string;
  title: string;
  channelTitle: string;
  videoCount: number;
}

async function fetchPlaylistInfo(playlistIds: string[]): Promise<Map<string, YouTubePlaylist>> {
  const map = new Map<string, YouTubePlaylist>();
  
  // Batch in groups of 50
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

async function fetchPlaylistItems(playlistId: string): Promise<YouTubePlaylistItem[]> {
  const items: YouTubePlaylistItem[] = [];
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

async function fetchVideoStats(videoIds: string[]): Promise<Map<string, YouTubeVideoStats>> {
  const map = new Map<string, YouTubeVideoStats>();
  
  // Batch in groups of 50
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

async function main() {
  console.log('🎬 Fetching YouTube data...\n');
  
  // Fetch playlist info
  console.log('📋 Fetching playlist information...');
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
  console.log(`   Found ${playlists.length} playlists\n`);
  
  // Fetch all playlist items
  console.log('📺 Fetching videos from playlists...');
  const allItems: { item: YouTubePlaylistItem; playlistId: string }[] = [];
  
  for (const playlistId of PLAYLIST_IDS) {
    const items = await fetchPlaylistItems(playlistId);
    for (const item of items) {
      allItems.push({ item, playlistId });
    }
    console.log(`   ${playlistId}: ${items.length} videos`);
  }
  console.log(`   Total: ${allItems.length} videos\n`);
  
  // Get unique video IDs
  const videoIds = [...new Set(allItems.map(({ item }) => item.snippet.resourceId.videoId))];
  
  // Fetch video statistics
  console.log('📊 Fetching video statistics...');
  const statsMap = await fetchVideoStats(videoIds);
  console.log(`   Got stats for ${statsMap.size} videos\n`);
  
  // Build final video list
  const videos: Video[] = [];
  const seenIds = new Set<string>();
  
  for (const { item, playlistId } of allItems) {
    const videoId = item.snippet.resourceId.videoId;
    
    // Skip duplicates (same video in multiple playlists - keep first occurrence)
    if (seenIds.has(videoId)) continue;
    seenIds.add(videoId);
    
    const stats = statsMap.get(videoId);
    const playlistInfo = playlistInfoMap.get(playlistId);
    
    if (!stats) continue; // Skip if no stats available (private/deleted video)
    
    videos.push({
      id: videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      thumbnailHigh: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      playlistId,
      playlistTitle: playlistInfo?.snippet.title || 'Unknown Playlist',
      viewCount: parseInt(stats.statistics.viewCount || '0'),
      likeCount: parseInt(stats.statistics.likeCount || '0'),
      commentCount: parseInt(stats.statistics.commentCount || '0'),
      duration: parseDuration(stats.contentDetails.duration),
    });
  }
  
  // Sort by views by default
  videos.sort((a, b) => b.viewCount - a.viewCount);
  
  const output = {
    videos,
    playlists,
    lastUpdated: new Date().toISOString(),
  };
  
  // Write to file
  const fs = await import('fs');
  const path = await import('path');
  
  const outputPath = path.join(process.cwd(), 'src/data/videos.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log('✅ Done!');
  console.log(`   ${videos.length} unique videos saved to src/data/videos.json`);
  console.log(`   ${playlists.length} playlists indexed`);
}

main().catch(console.error);
