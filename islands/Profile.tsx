

interface ProfileProps {
  username: string;
  onLogout: () => void;
}

export default function Profile({ username, onLogout }: ProfileProps) {
  return (
    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <span class="text-white">👤</span>
        <span class="text-white">Hola, {username}</span>
      </div>
      <button
        type="button"
        onClick={onLogout}
        class="text-white hover:text-red-500 transition-colors"
      >
        Salir
      </button>
    </div>
  );
}
