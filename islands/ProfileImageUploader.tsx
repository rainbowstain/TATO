import { useState, useRef, useEffect, useContext } from "preact/hooks";
import { UserContext } from "./UserContext.tsx";
import ProfileImage from "../components/ProfileImage.tsx";

interface ProfileImageUploaderProps {
  currentImage?: string;
  username: string;
  onImageUpdated?: (imageUrl: string) => void;
}

export default function ProfileImageUploader({ 
  currentImage, 
  username,
  onImageUpdated 
}: ProfileImageUploaderProps) {
  const { updateProfilePicture } = useContext(UserContext);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Actualizar la vista previa si cambia la imagen actual
  useEffect(() => {
    if (currentImage) {
      setPreviewImage(currentImage);
    }
  }, [currentImage]);
  
  // Forzar la recarga de la imagen cuando cambia
  useEffect(() => {
    if (previewImage) {
      // Crear un timestamp para forzar la recarga de la imagen
      const timestamp = new Date().getTime();
      const imageWithTimestamp = previewImage.includes('?') 
        ? `${previewImage}&_t=${timestamp}` 
        : `${previewImage}?_t=${timestamp}`;
      
      // Precargar la imagen
      const img = new Image();
      img.src = imageWithTimestamp;
    }
  }, [previewImage]);

  // Procesar y redimensionar la imagen antes de subirla
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) {
          reject(new Error('Error al leer el archivo'));
          return;
        }
        
        const img = new Image();
        img.onload = () => {
          // Crear un canvas para redimensionar la imagen
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;
          
          // Establecer el tamaño del canvas (200x200 para una imagen cuadrada)
          canvas.width = 200;
          canvas.height = 200;
          
          // Dibujar la imagen recortada y redimensionada
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo crear el contexto del canvas'));
            return;
          }
          
          // Dibujar la imagen como un círculo
          ctx.beginPath();
          ctx.arc(100, 100, 100, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          // Dibujar la imagen recortada y redimensionada
          ctx.drawImage(img, x, y, size, size, 0, 0, 200, 200);
          
          // Convertir a formato de datos URL con menor compresión para mejor calidad
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          resolve(dataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Error al cargar la imagen'));
        };
        
        img.src = e.target.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Procesar la imagen antes de subirla
      const processedImageDataUrl = await processImage(file);
      
      // Actualizar inmediatamente la vista previa
      setPreviewImage(processedImageDataUrl);
      
      // Actualizar la foto en el contexto global inmediatamente para que se vea en toda la app
      updateProfilePicture(processedImageDataUrl);
      
      // Notificar al componente padre inmediatamente
      if (onImageUpdated) {
        onImageUpdated(processedImageDataUrl);
      }
      
      // Mostrar un mensaje de éxito
      console.log('Foto actualizada correctamente');
      
      // Convertir la imagen procesada de vuelta a un archivo
      const blob = await fetch(processedImageDataUrl).then(r => r.blob());
      const processedFile = new File([blob], file.name, { type: 'image/jpeg' });
      
      // Crear un FormData para enviar el archivo
      const formData = new FormData();
      formData.append('image', processedFile);
      formData.append('username', username);
      
      // Enviar la imagen al servidor en segundo plano
      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }
      
      // No necesitamos actualizar la interfaz de usuario aquí, ya que ya se actualizó antes
      console.log('Imagen subida correctamente al servidor');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir la imagen. Por favor, inténtalo de nuevo.');
      // Restaurar la imagen anterior si hay error
      setPreviewImage(currentImage || null);
      // También restaurar en el contexto global
      if (currentImage) {
        updateProfilePicture(currentImage);
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative">
      <div className="w-full h-full group">
        <div 
          className="cursor-pointer"
          onClick={triggerFileInput}
        >
          <ProfileImage 
            src={previewImage} 
            username={username} 
            size="lg" 
          />
        </div>
        
        <div 
          className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
          onClick={triggerFileInput}
        >
          <span className="text-white text-xs px-2 py-1">
            {isUploading ? 'Subiendo...' : 'Cambiar foto'}
          </span>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
}
