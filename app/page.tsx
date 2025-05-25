'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [snakeParts, setSnakeParts] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15, points: 1, color: '#ff0000' });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isPaused, setIsPaused] = useState(false);

  const speeds = useMemo(() => ({
    easy: 150,
    medium: 100,
    hard: 70
  }), []);

  const getGameSpeed = useCallback(() => speeds[difficulty], [difficulty, speeds]);

  // Initialize canvas and start game loop
  useEffect(() => {
    if (!canvasRef.current || gameOver || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#333333';
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw snake
      ctx.fillStyle = '#00ff00';
      snakeParts.forEach(part => {
        ctx.fillRect(part.x * 20, part.y * 20, 18, 18);
      });

      // Draw food
      ctx.fillStyle = food.color;
      ctx.fillRect(food.x * 20, food.y * 20, 18, 18);

      // Draw score and game info
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.fillText(`Score: ${score} | High Score: ${highScore} | Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} | Press 'P' to ${isPaused ? 'Resume' : 'Pause'}`, 10, 30);
    };

    // Game loop
    const gameLoop = setInterval(() => {
      const head = { ...snakeParts[0] };

      // Move snake
      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check collisions
      if (
        head.x < 0 ||
        head.x >= canvas.width / 20 ||
        head.y < 0 ||
        head.y >= canvas.height / 20 ||
        snakeParts.some(part => part.x === head.x && part.y === head.y)
      ) {
        setGameOver(true);
        if (score > highScore) {
          setHighScore(score);
        }
        return;
      }

      // Check if food eaten
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + food.points);
        const newFood = {
          x: Math.floor(Math.random() * (canvas.width / 20)),
          y: Math.floor(Math.random() * (canvas.height / 20)),
          points: Math.random() < 0.2 ? 3 : 1, // 20% chance for special food worth 3 points
          color: Math.random() < 0.2 ? '#ffff00' : '#ff0000' // Yellow for special food
        };
        setFood(newFood);
        setSnakeParts([head, ...snakeParts]);
      } else {
        setSnakeParts([head, ...snakeParts.slice(0, -1)]);
      }

      draw();
    }, getGameSpeed());

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'arrowdown':
        case 's':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'arrowleft':
        case 'a':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'arrowright':
        case 'd':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case 'p':
          setIsPaused(prev => !prev);
          break;
        case '1':
          setDifficulty('easy');
          break;
        case '2':
          setDifficulty('medium');
          break;
        case '3':
          setDifficulty('hard');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial draw
    draw();

    // Cleanup
    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, snakeParts, food, gameOver, score, highScore, difficulty, isPaused, getGameSpeed]);

  const resetGame = () => {
    setSnakeParts([{ x: 10, y: 10 }]);
    setFood({
      x: 15,
      y: 15,
      points: 1,
      color: '#ff0000'
    });
    setDirection('RIGHT');
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="text-white text-2xl mb-4">Snake Game</div>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border border-gray-600"
      />
      {gameOver && (
        <div className="mt-4">
          <div className="text-red-500 text-xl mb-2">Game Over!</div>
          <button
            onClick={resetGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Play Again
          </button>
        </div>
      )}
      <div className="text-white text-sm mt-4">
        Controls: Arrow keys or WASD to move | 1-3 for difficulty | P to pause
      </div>
    </div>
  );
};

export default function Home() {
  return <SnakeGame />;
}
