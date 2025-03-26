import { createContext } from "preact";
import { useState, useEffect } from "preact/hooks";

// Definir el tipo para el contexto
export interface UserContextType {
  username: string;
  role: string;
  isLoggedIn: boolean;
  profilePicture: string | null;
  login: (username: string, role: string) => void;
  logout: () => void;
  updateProfilePicture: (url: string) => void;
}

// Crear el contexto con un valor predeterminado
export const UserContext = createContext<UserContextType>({
  username: "",
  role: "",
  isLoggedIn: false,
  profilePicture: null,
  login: () => {},
  logout: () => {},
  updateProfilePicture: () => {},
});

// Proveedor del contexto
export function UserProvider({ children }: { children: preact.ComponentChildren }) {
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    const checkAuth = () => {
      const storedUsername = localStorage.getItem("username");
      const storedRole = localStorage.getItem("role");
      const storedProfilePicture = localStorage.getItem("profilePicture");
      
      if (storedUsername && storedRole) {
        setUsername(storedUsername);
        setRole(storedRole);
        setIsLoggedIn(true);
        
        if (storedProfilePicture) {
          setProfilePicture(storedProfilePicture);
        } else if (storedUsername) {
          // Si no hay foto guardada pero hay un usuario, cargar la foto desde la API
          fetchUserProfilePicture(storedUsername);
        }
      } else {
        // Si no hay datos en localStorage, asegurarse de que el estado esté limpio
        setUsername("");
        setRole("");
        setProfilePicture(null);
        setIsLoggedIn(false);
      }
    };

    // Verificar autenticación al cargar
    checkAuth();

    // Verificar autenticación cada segundo para mantener el estado actualizado
    const interval = setInterval(checkAuth, 1000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);
  
  // Función para cargar la foto de perfil desde la API
  const fetchUserProfilePicture = async (userToFetch: string) => {
    try {
      const response = await fetch(`/api/users/${userToFetch}`);
      if (response.ok) {
        const userData = await response.json();
        if (userData.profilePicture) {
          setProfilePicture(userData.profilePicture);
          localStorage.setItem("profilePicture", userData.profilePicture);
        }
      }
    } catch (error) {
      console.error("Error al cargar la foto de perfil:", error);
    }
  };

  // Función para iniciar sesión
  const login = (newUsername: string, newRole: string) => {
    localStorage.setItem("username", newUsername);
    localStorage.setItem("role", newRole);
    setUsername(newUsername);
    setRole(newRole);
    setIsLoggedIn(true);
    
    // Cargar la foto de perfil al iniciar sesión
    fetchUserProfilePicture(newUsername);
  };
  
  // Función para actualizar la foto de perfil
  const updateProfilePicture = (url: string) => {
    // Si es una URL de Unsplash y no tiene el parámetro sig, agregarlo
    if (url.includes('unsplash.com') && !url.includes('sig=')) {
      const randomSig = Math.floor(Math.random() * 1000);
      url = `${url}?sig=${randomSig}`;
    }
    
    // Actualizar el estado
    setProfilePicture(url);
    
    // Guardar en localStorage
    localStorage.setItem("profilePicture", url);
    
    // Actualizar en el servidor si hay un usuario logueado
    if (username) {
      // No esperamos a que termine la promesa para que sea más rápido
      fetch(`/api/users/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profilePicture: url,
          currentUsername: username
        }),
      }).catch(error => {
        console.error("Error al actualizar la foto de perfil en el servidor:", error);
      });
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("profilePicture");
    setUsername("");
    setRole("");
    setProfilePicture(null);
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider value={{ username, role, isLoggedIn, profilePicture, login, logout, updateProfilePicture }}>
      {children}
    </UserContext.Provider>
  );
}
