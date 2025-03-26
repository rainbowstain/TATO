import { useState, useContext, useRef, useEffect } from "preact/hooks";
import { UserContext } from "./UserContext.tsx";
import { v4 } from "https://deno.land/std@0.140.0/uuid/mod.ts";
import { Post, User } from "../types.d.ts";

// Importaciones para el editor de texto rico (versión simplificada)
// Usaremos una solución más ligera que no dependa de TipTap

// Estilos CSS para el editor
const editorStyles = `
.rich-editor {
  outline: none;
  min-height: 150px;
  padding: 1rem;
  color: white;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0 0 0.5rem 0.5rem;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem 0.5rem 0 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.editor-toolbar button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
  color: white;
}

.editor-toolbar button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.editor-toolbar button.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: #f87171;
}

/* Estilos mejorados para el selector de colores */
.color-picker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  padding: 0.75rem;
  width: 220px;
  background-color: rgba(30, 30, 30, 0.95);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.color-picker-button {
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.color-picker-button:hover {
  transform: scale(1.1);
  z-index: 10;
  border-color: rgba(255, 255, 255, 0.5);
}

.color-picker-custom {
  grid-column: span 5;
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 0.75rem;
}

.color-picker-custom input {
  height: 2.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  background-color: transparent;
}

.color-picker-custom label {
  text-align: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.25rem;
}

/* Estilos mejorados para el selector de fuentes */
.font-family-menu {
  width: 220px;
  max-height: 250px;
  overflow-y: auto;
  padding: 0.5rem;
  background-color: rgba(30, 30, 30, 0.95);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.font-family-menu::-webkit-scrollbar {
  width: 6px;
}

.font-family-menu::-webkit-scrollbar-track {
  background: transparent;
}

.font-family-menu::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.font-family-option {
  padding: 0.75rem;
  margin: 0.25rem 0;
  text-align: left;
  border-radius: 0.25rem;
  transition: all 0.2s;
  font-size: 0.95rem;
  width: 100%;
  color: rgba(255, 255, 255, 0.9);
  display: block;
}

.font-family-option:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(3px);
}

.post-editor-advanced .color-picker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 16px;
  max-width: 240px;
  background-color: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.post-editor-advanced .color-picker-button {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.post-editor-advanced .color-picker-button:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.post-editor-advanced .color-picker-custom {
  display: flex;
  align-items: center;
  gap: 8px;
  grid-column: 1 / -1;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.post-editor-advanced .color-picker-custom input {
  height: 24px;
  width: 40px;
  padding: 0;
  border: none;
  cursor: pointer;
  background: transparent;
}

.post-editor-advanced .color-picker-custom label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.post-editor-advanced .font-family-menu {
  display: flex;
  flex-direction: column;
  max-height: 300px;
  overflow-y: auto;
  background-color: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.3);
}

.post-editor-advanced .font-family-menu::-webkit-scrollbar {
  width: 6px;
}

.post-editor-advanced .font-family-menu::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.post-editor-advanced .font-family-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.post-editor-advanced .font-family-option {
  padding: 10px 16px;
  min-width: 200px;
  text-align: left;
  border: none;
  background: transparent;
  color: white;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.post-editor-advanced .font-family-option:last-child {
  border-bottom: none;
}

.post-editor-advanced .font-family-option:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
`;

interface CreatePostFormProps {
  onPostCreated?: (newPost: Post) => void;
  users: User[];
}

export default function CreatePostForm({ onPostCreated, users }: CreatePostFormProps) {
  const { username, isLoggedIn } = useContext(UserContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Obtener el usuario actual de la lista de usuarios
  const currentUser = users.find(u => u.username === username);

  // Función para aplicar formato al texto seleccionado
  const formatText = (command: string, value?: string) => {
    if (!editorRef.current) return;
    
    document.execCommand(command, false, value);
    editorRef.current.focus();
    
    // Actualizar el contenido después de formatear
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleExpand = () => {
    if (isLoggedIn) {
      setIsExpanded(true);
    } else {
      globalThis.location.href = "/login";
    }
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setTitle("");
    setContent("");
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!isLoggedIn || !title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newPost = {
        id: v4.generate(),
        title,
        content,
        author: username,
        date: new Date().toISOString().split("T")[0],
        likes: {},
        comments: []
      };

      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error("Error al crear la publicación");
      }

      // Notificar al componente padre sobre el nuevo post si existe la función
      if (typeof onPostCreated === 'function') {
        onPostCreated(newPost);
      } else {
        // Si no hay callback, simplemente recargamos la página
        globalThis.location.reload();
      }
      
      // Limpiar y cerrar el formulario
      setTitle("");
      setContent("");
      setIsExpanded(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la publicación. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Asegurarse de que el HTML del editor se actualiza cuando cambia el content
  useEffect(() => {
    if (editorRef.current && isExpanded) {
      editorRef.current.innerHTML = content;
      editorRef.current.focus();
    }
  }, [isExpanded]);

  if (!isExpanded) {
    return (
      <div 
        onClick={handleExpand}
        class="mb-8 bg-white/5 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-300 shadow-lg border border-white/5"
      >
        <div class="flex items-center p-4">
          {isLoggedIn && (
            <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white overflow-hidden shadow-md">
              {currentUser?.profilePicture ? (
                <img 
                  src={currentUser.profilePicture} 
                  alt={`Foto de perfil de ${username}`} 
                  class="w-full h-full object-cover"
                />
              ) : (
                <span class="text-xl">{username.charAt(0).toUpperCase()}</span>
              )}
            </div>
          )}
          <div class="flex-1 ml-3 p-3 bg-white/5 rounded-xl text-white/80 hover:bg-white/10 transition-all duration-300 shadow-inner border border-white/5">
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              <span>¿Qué tienes en mente, {isLoggedIn ? username : "visitante"}?</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="mb-8 p-6 bg-white/10 backdrop-blur-md rounded-lg">
      <style>{editorStyles}</style>
      
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-red-500">Crear Publicación</h2>
        {isLoggedIn && (
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white overflow-hidden">
              {currentUser?.profilePicture ? (
                <img 
                  src={currentUser.profilePicture} 
                  alt={`Foto de perfil de ${username}`} 
                  class="w-full h-full object-cover"
                />
              ) : (
                <span class="text-sm">{username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span class="text-sm text-white/70">{username}</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
            placeholder="Título"
            class="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            required
          />
        </div>
        
        <div class="bg-white/5 backdrop-blur-md rounded-lg overflow-hidden">
          {/* Barra de herramientas del editor */}
          <div class="editor-toolbar">
            <div class="flex space-x-1">
              <button 
                type="button" 
                onClick={() => formatText('bold')}
                title="Negrita"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"/>
                </svg>
              </button>
              
              <button 
                type="button" 
                onClick={() => formatText('italic')}
                title="Cursiva"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/>
                </svg>
              </button>
              
              <button 
                type="button" 
                onClick={() => formatText('underline')}
                title="Subrayado"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57-1.709 0-2.687-1.08-2.687-2.57V3.136zM12.5 15h-9v-1h9v1z"/>
                </svg>
              </button>
            </div>
            
            <div class="h-6 border-r border-white/10 mx-1"></div>
            
            <div class="relative group">
              <button 
                type="button" 
                class="group-hover:bg-white/20"
                title="Color de texto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708l.647.646-3.147 3.146a.5.5 0 0 0 0 .708l1 1a.5.5 0 0 0 .708 0L9.5 7.207l.646.647a.5.5 0 0 0 .708-.708L10.2 6.5l3.147-3.146a1.207 1.207 0 0 0 0-1.708l-.243-.244z"/>
                </svg>
              </button>
              <div class="absolute top-full left-0 mt-2 hidden group-hover:block z-10">
                <div class="color-picker">
                  {[
                    "#ff0000", "#ff5733", "#ff9900", "#ffcc00", "#ffff00", 
                    "#99cc00", "#33cc33", "#00cc99", "#00ccff", "#0099ff", 
                    "#0066ff", "#3333ff", "#6633ff", "#9933ff", "#cc33ff", 
                    "#ff33cc", "#ff3366", "#ffffff", "#cccccc", "#999999"
                  ].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => formatText('foreColor', color)}
                      class="color-picker-button"
                      style={{ backgroundColor: color }}
                      title={color}
                    ></button>
                  ))}
                  
                  <div class="color-picker-custom">
                    <input 
                      type="color" 
                      id="colorPicker" 
                      value="#ff0000"
                      onChange={(e) => {
                        const colorValue = (e.target as HTMLInputElement).value;
                        formatText('foreColor', colorValue);
                      }}
                    />
                    <label for="colorPicker">Color personalizado</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="relative group">
              <button 
                type="button" 
                class="group-hover:bg-white/20"
                title="Tipografía"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M12.258 3h-8.51l-.083 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.52h4.082v-.52c-1.162-.103-1.306-.26-1.306-.923V3.602l.431.013c1.934.062 2.434.301 2.693 1.846h.479L12.258 3z"/>
                </svg>
              </button>
              <div class="absolute top-full left-0 mt-2 hidden group-hover:block z-10">
                <div class="font-family-menu">
                  {[
                    { name: "Arial", sample: "Texto de ejemplo" },
                    { name: "Helvetica", sample: "Texto de ejemplo" },
                    { name: "Times New Roman", sample: "Texto de ejemplo" },
                    { name: "Georgia", sample: "Texto de ejemplo" },
                    { name: "Verdana", sample: "Texto de ejemplo" },
                    { name: "Courier New", sample: "Texto de ejemplo" },
                    { name: "Tahoma", sample: "Texto de ejemplo" },
                    { name: "Trebuchet MS", sample: "Texto de ejemplo" },
                    { name: "Impact", sample: "Texto de ejemplo" },
                    { name: "Comic Sans MS", sample: "Texto de ejemplo" }
                  ].map(font => (
                    <button
                      key={font.name}
                      type="button"
                      onClick={() => formatText('fontName', font.name)}
                      class="font-family-option hover:bg-white/10"
                      style={{ fontFamily: font.name }}
                    >
                      {font.sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Editor de contenido */}
          <div
            ref={editorRef}
            class="rich-editor"
            contentEditable={true}
            onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
            placeholder="¿Qué quieres compartir?"
          />
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            class="ml-auto mt-4 px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white font-medium rounded-lg hover:shadow-lg hover:opacity-90 transition-all duration-300 flex items-center gap-2"
          >
            {!isSubmitting && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
            </svg>}
            {isSubmitting ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
