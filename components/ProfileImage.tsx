interface ProfileImageProps {
  src?: string | null;
  username: string;
  size?: "xs" | "sm" | "md" | "lg";
  class?: string;
}

const SIZES = {
  xs: "w-8 h-8 text-sm",
  sm: "w-10 h-10 text-lg",
  md: "w-16 h-16 text-2xl",
  lg: "w-32 h-32 text-4xl",
};

/** Avatar redondo; si no hay foto (o falla al cargar) muestra la inicial. */
export default function ProfileImage(
  { src, username, size = "sm", class: extra = "" }: ProfileImageProps,
) {
  return (
    <div
      class={`${
        SIZES[size]
      } ${extra} relative shrink-0 bg-red-500 rounded-full flex items-center justify-center text-white overflow-hidden`}
    >
      <span>{username.charAt(0).toUpperCase()}</span>
      {src && (
        <img
          src={src}
          alt={`Foto de perfil de ${username}`}
          class="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </div>
  );
}
