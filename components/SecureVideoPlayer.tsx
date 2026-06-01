'use client';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Watermark from './Watermark';

interface SecureVideoPlayerProps {
  videoUrl: string;
  userName: string;
  userPhone: string;
  courseTitle?: string;
}

export default function SecureVideoPlayer({
  videoUrl,
  userName,
  userPhone,
  courseTitle
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play();
      });

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = videoUrl;
    }
  }, [videoUrl]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
      <Watermark userName={userName} userPhone={userPhone} />
      
      <video
        ref={videoRef}
        controls
        controlsList="nodownload nofullscreen"
        className="w-full h-auto"
        poster="/video-poster.png"
      />

      {courseTitle && (
        <div className="absolute top-4 left-4 bg-black/60 px-4 py-2 rounded">
          <p className="text-white text-sm">{courseTitle}</p>
        </div>
      )}

      <style>{`
        video::-webkit-media-controls-panel {
          background-color: rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
}
