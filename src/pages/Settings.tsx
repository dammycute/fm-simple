import { useGameStore } from '../state/gameStore'

export default function Settings() {
  const newGame = useGameStore((s) => s.newGame)

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
      <button
        onClick={newGame}
        className="mt-4 px-4 py-2 bg-negative text-white font-semibold rounded hover:opacity-90 cursor-pointer"
      >
        New Game (Reset)
      </button>
    </div>
  )
}
