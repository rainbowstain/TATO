import { JSX } from "preact";

interface ChatButtonProps {
  size?: "small" | "normal";
}

export default function ChatButton({ size = "normal" }: ChatButtonProps): JSX.Element {
  const handleClick = () => {
    alert("Funcionalidad de chat en desarrollo");
  };

  const buttonClass = size === "small" 
    ? "mt-2 px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
    : "mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600";

  return (
    <button 
      type="button" 
      class={buttonClass}
      onClick={handleClick}
    >
      Iniciar chat
    </button>
  );
}
