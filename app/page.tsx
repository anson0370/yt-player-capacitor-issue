'use client';

import YouTubeEmbedPlayer, { IPlayer } from '@/components/youtube-player';
import { useEffect, useRef } from 'react';

export default function Homepage() {
  const ytPlayerRef = useRef<IPlayer>(null);

  useEffect(() => {
    ytPlayerRef.current?.play('WRP85-n8k3Q');

    setTimeout(() => {
      console.log('Read cookie', document.cookie);
    }, 5000);
  }, []);

  return (
    <div className='w-full h-full'>
      <YouTubeEmbedPlayer
        ref={ytPlayerRef}
        className='aspect-video w-full mx-auto max-h-[279px]'
      />
    </div>
  );
}
