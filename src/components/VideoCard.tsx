import { Video } from '@/types/video';
import { Eye, ThumbsUp, MessageCircle, Clock, ExternalLink, Calendar } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

interface VideoCardProps {
  video: Video;
  index: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export function VideoCard({ video, index }: VideoCardProps) {
  return (
    <a
      href={video.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block card-hover"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <article className="relative overflow-hidden rounded-lg bg-card border border-border/50 animate-fade-in opacity-0">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnailHigh}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Duration badge */}
          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-background/90 text-foreground text-xs font-medium rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {video.duration}
          </span>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground p-3 rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <ExternalLink className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-display font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {video.title}
          </h3>
          
          {/* Channel & Playlist */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground truncate">
              {video.channelTitle}
            </p>
            <p className="text-xs text-muted-foreground/70 truncate">
              {video.playlistTitle}
            </p>
            <p className="text-xs text-muted-foreground/50 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatRelativeTime(video.publishedAt)}
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">{formatNumber(video.viewCount)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">{formatNumber(video.likeCount)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{formatNumber(video.commentCount)}</span>
            </div>
          </div>
        </div>
      </article>
    </a>
  );
}
