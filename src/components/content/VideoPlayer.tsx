import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  type?: 'youtube' | 'bunny' | 'vimeo' | 'hls' | 'dash';
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
}

export function VideoPlayer({
  src,
  poster,
  title,
  type = 'youtube',
  autoPlay = false,
  muted = false,
  controls = true,
  className
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(1);
  const [mutedState, setMutedState] = useState(muted);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // YouTube iframe handling
  const isYouTube = type === 'youtube' || src.includes('youtube.com') || src.includes('youtu.be');
  const isExternal = isYouTube || type === 'bunny' || type === 'vimeo';

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isExternal) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const handleEnded = () => setPlaying(false);
    const handleWaiting = () => { /* show loading */ };
    const handleCanPlay = () => { /* hide loading */ };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    if (autoPlay) {
      video.play().catch(() => { /* autoplay blocked */ });
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [autoPlay, isExternal]);

  // Auto-hide controls
  useEffect(() => {
    if (!controls || !playing) return;

    const resetTimeout = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    resetTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [controls, playing]);

  // Fullscreen handling
  const toggleFullscreen = async () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!fullscreen) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        } else if ((container as any).msRequestFullscreen) {
          (container as any).msRequestFullscreen();
        }
        setFullscreen(true);
      } catch (e) {
        console.warn('Fullscreen request failed:', e);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
        setFullscreen(false);
      } catch (e) {
        console.warn('Exit fullscreen failed:', e);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current || isExternal) return;
      const video = videoRef.current;

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'Digit0':
          video.currentTime = 0;
          break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          video.currentTime = video.duration * (parseInt(e.code.slice(-1)) / 10);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExternal, volume]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || isExternal) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video || isExternal) return;
    setMutedState(!mutedState);
    video.muted = !mutedState;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (video && !isExternal) {
      video.volume = newVolume;
      video.muted = newVolume === 0;
      setMutedState(newVolume === 0);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || isExternal) return;
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video || isExternal) return;
    setPlaybackRate(rate);
    video.playbackRate = rate;
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // YouTube embed
  if (isExternal && type === 'youtube') {
    const videoId = src.includes('youtube') ? new URL(src).searchParams.get('v') || src.split('/').pop() : src;
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;

    return (
      <div className={cn('relative aspect-video rounded-xl overflow-hidden bg-panel', className)}>
        <iframe
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // Native video player
  return (
    <div
      className={cn('relative rounded-xl overflow-hidden bg-black', className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => { if (playing) setShowControls(false); }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        title={title}
        playsInline
        autoPlay={autoPlay}
        muted={muted}
        className="w-full h-full"
        onClick={togglePlay}
      />

      {/* Buffering indicator */}
      {controls && showControls && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(to right, #b89b5e ${(buffered / duration) * 100}%, transparent 0%)` }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold/30" />
        </div>
      )}

      {/* Controls overlay */}
      {controls && showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/10 to-transparent">
          {/* Progress bar */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1 appearance-none bg-gold/30 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Postęp odtwarzania"
            />
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between gap-4">
            {/* Left controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label={playing ? 'Pauza' : 'Odtwórz'}
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 10); }}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="Cofnij 10 sekund"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.min(v.duration, v.currentTime + 10); }}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="Przewiń 10 sekund"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                  aria-label={mutedState ? 'Włącz dźwięk' : 'Wycisz'}
                >
                  {mutedState || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={mutedState ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 appearance-none bg-gold/30 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold"
                  aria-label="Głośność"
                />
              </div>

              {/* Playback rate */}
              <select
                value={playbackRate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="px-2 py-1 bg-black/50 rounded text-white text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-gold"
                aria-label="Prędkość odtwarzania"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              {/* Picture in Picture */}
              <button
                onClick={async () => {
                  const video = videoRef.current;
                  if (video && document.pictureInPictureEnabled) {
                    try {
                      if (document.pictureInPictureElement) {
                        await document.exitPictureInPicture();
                      } else {
                        await video.requestPictureInPicture();
                      }
                    } catch (e) {
                      console.warn('PiP failed:', e);
                    }
                  }
                }}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="Tryb Picture-in-Picture"
              >
                <Monitor className="w-5 h-5" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label={fullscreen ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran'}
              >
                {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Play button overlay when paused */}
      {controls && !playing && !isExternal && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
          aria-label="Odtwórz"
        >
          <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-xl">
            <Play className="w-8 h-8 text-bg ml-1" />
          </div>
        </button>
      )}

      {/* Loading placeholder */}
      {controls && !poster && !isExternal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center text-muted">
            <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
            <p>Ładowanie wideo...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// HLS.js wrapper for HLS streams (would need hls.js dependency)
export function HLSPlayer({ src, poster, title, ...props }: VideoPlayerProps) {
  return <VideoPlayer src={src} poster={poster} title={title} type="hls" {...props} />;
}