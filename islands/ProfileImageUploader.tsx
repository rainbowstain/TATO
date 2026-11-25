import { useRef, useState } from "preact/hooks";
import ProfileImage from "../components/ProfileImage.tsx";

interface Props {
  current: string | null;
  username: string;
  onChange: (dataUrl: string) => void;
}

/** Recorta la imagen al centro y la reduce a 256x256 JPEG. */
function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No se pudo procesar la imagen"));
      ctx.drawImage(
        img,
        (img.width - size) / 2,
        (img.height - size) / 2,
        size,
        size,
        0,
        0,
        256,
        256,
      );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = url;
  });
}

export default function ProfileImageUploader(
  { current, username, onChange }: Props,
) {
  const [preview, setPreview] = useState(current);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecciona un archivo de imagen válido");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await processImage(file);
      setPreview(dataUrl);
      onChange(dataUrl);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      class="relative group rounded-full"
      onClick={() => inputRef.current?.click()}
      title="Cambiar foto"
    >
      <ProfileImage src={preview} username={username} size="lg" />
      <span class="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">
        {busy ? "Procesando..." : "Cambiar foto"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        class="hidden"
        onChange={handleFile}
      />
    </button>
  );
}
