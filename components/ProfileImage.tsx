import { JSX } from "preact";

interface ProfileImageProps {
  src?: string | null;
  username: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ProfileImage({ 
  src, 
  username, 
  size = "md",
  className = ""
}: ProfileImageProps): JSX.Element {
  // Determinar tamaño
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-32 h-32"
  };
  
  const sizeClass = sizeClasses[size];
  
  // Si la URL es una URL de Unsplash, asegurarse de que tenga el parámetro sig
  let imageUrl = src;
  if (imageUrl?.includes('unsplash.com')) {
    if (!imageUrl.includes('sig=')) {
      // Si no tiene el parámetro sig, agregar uno aleatorio
      const randomSig = Math.floor(Math.random() * 1000);
      imageUrl = `${imageUrl}?sig=${randomSig}`;
    }
  }

  // Si no hay imagen o la URL está vacía, mostrar la inicial
  if (!imageUrl || imageUrl.trim() === "") {
    return (
      <div className={`${sizeClass} ${className} bg-red-500 rounded-full flex items-center justify-center text-white overflow-hidden`}>
        <span className={size === "lg" ? "text-4xl" : "text-xl"}>
          {username.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }
  
  // Si hay imagen, mostrarla directamente
  return (
    <div className={`${sizeClass} ${className} bg-red-500 rounded-full flex items-center justify-center text-white overflow-hidden`}>
      <img 
        src={imageUrl} 
        alt={`Foto de perfil de ${username}`} 
        className="w-full h-full object-cover"
        style={{ width: '100%', height: '100%' }}
        onError={(e) => {
          // Si hay error al cargar la imagen, mostrar la inicial
          const target = e.target as HTMLImageElement;
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<span class="${size === "lg" ? "text-4xl" : "text-xl"}">${username.charAt(0).toUpperCase()}</span>`;
          }
        }}
      />
    </div>
  );
}
