import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react';
import Script from 'next/script';

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL!;

type YTPlayer = {
  playVideo: () => void,
  pauseVideo: () => void,
  stopVideo: () => void,
  loadVideoById: (videoId: string, startAt?: number) => void,
  cueVideoById: (videoId: string, startAt?: number) => void,
  seekTo: (seconds: number, allowSeekAhead: boolean) => void,
  getPlayerState: () => number,
  getCurrentTime: () => number,
  getDuration: () => number,
  addEventListener: (event: string, listener: any) => void,
  removeEventListener: (event: string, listener: any) => void,
  destroy: () => void,
};

export type IPlayer = {
  play: (id: string, time?: number, loadOnly?: boolean) => Promise<void>,
  pause: () => void,
  toggle: () => void,
  seek: (seconds: number) => void,
  getCurrentTime: () => number,
  getDuration: () => number,
  getState: () => PlayerState,
  getPlayingSrc: () => string | null | undefined,
  forward: (seconds: number) => void,
  changePlaybackRate: (forward: boolean) => void,
}

type PlayerState = 'playing' | 'pause' | 'waiting' | 'error';

const mockYTPlayer: YTPlayer = {
  playVideo: () => {},
  pauseVideo: () => {},
  stopVideo: () => {},
  loadVideoById: () => {},
  cueVideoById: () => {},
  seekTo: () => {},
  getPlayerState: () => -1,
  getCurrentTime: () => 0,
  getDuration: () => NaN,
  addEventListener: () => {},
  removeEventListener: () => {},
  destroy: () => {},
};

const YTPlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

export default forwardRef(function YouTubeEmbedPlayer({
  className,
  onStateChange,
  onSeeked,
  onTimeUpdate,
}: {
  className?: string,
  onStateChange?: (state: PlayerState) => void,
  onSeeked?: (time: number) => void,
  onTimeUpdate?: (time: number) => void,
}, ref: React.Ref<IPlayer>) {
  const currentVideoIdRef = useRef<string | null>(null);
  const playerInstanceRef = useRef<YTPlayer | null>(null);
  const timeUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    return () => {
      playerInstanceRef.current?.destroy();
    };
  }, []);

  const initPlayerInstance = useCallback(async (videoId: string, startAt?: number) => {
    if (playerInstanceRef.current === mockYTPlayer) {
      return;
    }
    if (playerInstanceRef.current != null) {
      return;
    }
    playerInstanceRef.current = mockYTPlayer;
    const playerInstance = await new Promise<YTPlayer>((resolve) => {
      const onYouTubeIframeAPIReady = () => {
        const player = new window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId,
          playerVars: {
            autoplay: 1,
            enablejsapi: 1,
            disablekb: 1,
            origin: ORIGIN,
            start: startAt,
          },
          events: {
            onReady: () => {
              resolve(player);
            },
            onStateChange: (event: any) => {
              console.debug('YTPlayer state change:', event.data);
              switch (event.data) {
                case 0:
                  onStateChange?.('pause');
                  break;
                case 1:
                  onStateChange?.('playing');
                  break;
                case 2:
                  onStateChange?.('pause');
                  break;
                case 3:
                  onStateChange?.('waiting');
                  break;
                default:
                  onStateChange?.('pause');
              }
              if (event.data === YTPlayerState.PLAYING) {
                if (timeUpdateTimerRef.current == null && onTimeUpdate != null) {
                  timeUpdateTimerRef.current = setInterval(() => {
                    onTimeUpdate?.(player.getCurrentTime());
                  }, 1000);
                }
              } else {
                if (timeUpdateTimerRef.current != null) {
                  clearInterval(timeUpdateTimerRef.current);
                  timeUpdateTimerRef.current = null;
                }
              }
            },
            onError: onStateChange == null ? undefined : (event: any) => {
              console.debug('YTPlayer error:', event.data);
              onStateChange('error');
            },
          },
        });
      };
      if (window.YT?.Player == null) {
        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
      } else {
        onYouTubeIframeAPIReady();
      }
    });
    playerInstanceRef.current = playerInstance;
    currentVideoIdRef.current = videoId;
  // 只执行一次
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const player: IPlayer = useMemo(() => {
    const _play = async (id: string, time?: number, loadOnly?: boolean) => {
      const videoId = id;
      if (playerInstanceRef.current == null) {
        onStateChange?.('waiting');
        await initPlayerInstance(videoId, time);
        onStateChange?.('pause');
      } else {
        const playerInstance = playerInstanceRef.current!;
        if (videoId === currentVideoIdRef.current) {
          if (time != null) {
            playerInstance.seekTo(time, true);
          }
        } else {
          playerInstance.cueVideoById(videoId, time ?? 0);
          currentVideoIdRef.current = videoId;
        }
      }
      if (time != null && time != 0) {
        onSeeked?.(time);
      }
      const playerInstance = playerInstanceRef.current!;
      if (loadOnly) {
        playerInstance.pauseVideo();
      } else {
        playerInstance.playVideo();
      }
    };

    return {
      play: _play,
      pause: () => {
        playerInstanceRef.current?.pauseVideo();
      },
      toggle: () => {
        const playerInstance = playerInstanceRef.current;
        if (playerInstance == null) {
          return;
        }
        if (playerInstance.getPlayerState() === YTPlayerState.PLAYING) {
          playerInstance.pauseVideo();
        } else {
          playerInstance.playVideo();
        }
      },
      seek: (seconds: number) => {
        playerInstanceRef.current?.seekTo(seconds, true);
        onSeeked?.(seconds);
      },
      getCurrentTime: () => {
        return playerInstanceRef.current?.getCurrentTime() ?? 0;
      },
      getDuration: () => {
        return playerInstanceRef.current?.getDuration() ?? NaN;
      },
      getState: () => {
        switch (playerInstanceRef.current?.getPlayerState()) {
          case 1:
            return 'playing';
          case 2:
            return 'pause';
          case 3:
            return 'waiting';
          default:
            return 'pause';
        }
      },
      getPlayingSrc: () => {
        return currentVideoIdRef.current;
      },
      forward: (seconds: number) => {
        const playerInstance = playerInstanceRef.current;
        if (playerInstance == null) {
          return;
        }
        playerInstance.seekTo(playerInstance.getCurrentTime() + seconds, true);
      },
      changePlaybackRate: (forward: boolean) => {
        // not supported yet
      },
    };
  // 只执行一次
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => player, [player]);

  return (
    <>
      <Script
        src='https://www.youtube.com/iframe_api'
      />
      <div ref={playerContainerRef} className={className}>
        <div id='youtube-player'/>
      </div>
    </>
  );
});
