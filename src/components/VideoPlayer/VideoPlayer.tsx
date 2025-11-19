import React, { useEffect, useRef } from 'react';
import Hls, { HlsConfig } from 'hls.js';

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  autoFullScreen?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
  authToken?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  autoPlay = false,
  autoFullScreen = false,
  controls = true,
  width = '100%',
  height = 'auto',
  authToken
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hls: Hls | null = null;

    const loadSource = () => {
      if (!videoRef.current) return;

      if (Hls.isSupported()) {
        const config: Partial<HlsConfig> = {};

        // Add custom loader for authentication
        if (authToken) {
          // Configure HLS to use our proxy
          config.xhrSetup = function(xhr, url) {
            xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
            //xhr.withCredentials = true;
          };
        }

        hls = new Hls(config);
        
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay && videoRef.current) {
            videoRef.current.play().then(() =>
            {
              if(autoFullScreen){
                if (videoRef.current?.requestFullscreen) {
                  videoRef.current.requestFullscreen().catch(e => {
                    console.log('Fullscreen request failed:', e);
                  });
                } else if ((videoRef.current as any).webkitRequestFullscreen) { // For Safari
                  (videoRef.current as any).webkitRequestFullscreen();
                } else if ((videoRef.current as any).msRequestFullscreen) { // For IE11
                  (videoRef.current as any).msRequestFullscreen();
                }
              }
            }).catch(e => {
              console.error('Auto-play failed:', e);
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Fatal network error, trying to recover...');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Fatal media error, trying to recover...');
                hls?.recoverMediaError();
                break;
              default:
                console.error('Unrecoverable error, destroying HLS instance');
                hls?.destroy();
                break;
            }
          }
        });
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        // For Safari - Note: Custom headers won't work with native HLS on Safari
        if (authToken) {
          console.warn('Custom headers are not supported with native HLS playback on Safari');
        }
        videoRef.current.src = src;
        if (autoPlay) {
          videoRef.current.play().catch(e => {
            console.error('Auto-play failed:', e);
          });
        }
      }
    };

    loadSource();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, autoPlay, authToken]);

  return (
    <video
      ref={videoRef}
      controls={controls}
      width={width}
      height={height}
      style={{ maxWidth: '100%' }}
    />
  );
};

export default VideoPlayer;