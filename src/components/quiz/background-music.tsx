"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface BackgroundMusicProps {
  isPlaying: boolean;
  volume?: number;
}

export function BackgroundMusic({ isPlaying, volume = 0.3 }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    audio.addEventListener('canplay', handleCanPlay);
    
    // 음악 파일 로드
    audio.load();

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    if (isPlaying && !isMuted) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, isMuted, isLoaded]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        className="hidden"
      >
        {/* 여러 포맷의 음악 파일을 제공 */}
        <source src="/quiz-music.mp3" type="audio/mpeg" />
        <source src="/quiz-music.ogg" type="audio/ogg" />
        {/* 브라우저가 지원하지 않는 경우를 위한 대체 텍스트 */}
        Your browser does not support the audio element.
      </audio>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur hover:bg-white/90"
        title={isMuted ? "음악 켜기" : "음악 끄기"}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    </>
  );
}