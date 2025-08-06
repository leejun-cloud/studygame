"use client";

import { useEffect, useRef } from "react";

interface QuizSoundEffectsProps {
  playCorrect?: boolean;
  playIncorrect?: boolean;
  playTimeUp?: boolean;
  playGameStart?: boolean;
  playGameEnd?: boolean;
}

export function QuizSoundEffects({ 
  playCorrect, 
  playIncorrect, 
  playTimeUp, 
  playGameStart, 
  playGameEnd 
}: QuizSoundEffectsProps) {
  const correctSoundRef = useRef<HTMLAudioElement>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement>(null);
  const timeUpSoundRef = useRef<HTMLAudioElement>(null);
  const gameStartSoundRef = useRef<HTMLAudioElement>(null);
  const gameEndSoundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (playCorrect && correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch(console.error);
    }
  }, [playCorrect]);

  useEffect(() => {
    if (playIncorrect && incorrectSoundRef.current) {
      incorrectSoundRef.current.currentTime = 0;
      incorrectSoundRef.current.play().catch(console.error);
    }
  }, [playIncorrect]);

  useEffect(() => {
    if (playTimeUp && timeUpSoundRef.current) {
      timeUpSoundRef.current.currentTime = 0;
      timeUpSoundRef.current.play().catch(console.error);
    }
  }, [playTimeUp]);

  useEffect(() => {
    if (playGameStart && gameStartSoundRef.current) {
      gameStartSoundRef.current.currentTime = 0;
      gameStartSoundRef.current.play().catch(console.error);
    }
  }, [playGameStart]);

  useEffect(() => {
    if (playGameEnd && gameEndSoundRef.current) {
      gameEndSoundRef.current.currentTime = 0;
      gameEndSoundRef.current.play().catch(console.error);
    }
  }, [playGameEnd]);

  return (
    <>
      {/* 정답 효과음 */}
      <audio ref={correctSoundRef} preload="auto" className="hidden">
        <source src="/sounds/correct.mp3" type="audio/mpeg" />
        <source src="/sounds/correct.ogg" type="audio/ogg" />
      </audio>

      {/* 오답 효과음 */}
      <audio ref={incorrectSoundRef} preload="auto" className="hidden">
        <source src="/sounds/incorrect.mp3" type="audio/mpeg" />
        <source src="/sounds/incorrect.ogg" type="audio/ogg" />
      </audio>

      {/* 시간 초과 효과음 */}
      <audio ref={timeUpSoundRef} preload="auto" className="hidden">
        <source src="/sounds/timeup.mp3" type="audio/mpeg" />
        <source src="/sounds/timeup.ogg" type="audio/ogg" />
      </audio>

      {/* 게임 시작 효과음 */}
      <audio ref={gameStartSoundRef} preload="auto" className="hidden">
        <source src="/sounds/game-start.mp3" type="audio/mpeg" />
        <source src="/sounds/game-start.ogg" type="audio/ogg" />
      </audio>

      {/* 게임 종료 효과음 */}
      <audio ref={gameEndSoundRef} preload="auto" className="hidden">
        <source src="/sounds/game-end.mp3" type="audio/mpeg" />
        <source src="/sounds/game-end.ogg" type="audio/ogg" />
      </audio>
    </>
  );
}