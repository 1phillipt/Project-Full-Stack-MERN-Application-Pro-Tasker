import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
import api from "../services/api";


// Define the User type based on your backend response
type User = {
  id?: string;
  _id?: string;
  username: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/api/users/login", {
      email,
      password,
    });

    const data = response.data;
    console.log("LOGIN RESPONSE:", data);

    const authToken = data.token;
    const authUser = data.user || {
      id: data.id || data._id,
      _id: data._id,
      username: data.username,
      email: data.email,
    };

    if (!authToken || !authUser?.email) {
      throw new Error("Invalid login response from server");
    }

    setUser(authUser);
    setToken(authToken);

    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(authUser));
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    const response = await api.post("/users/register", {
      username,
      email,
      password,
    });

    const data = response.data;
    console.log("REGISTER RESPONSE:", data);

    const authToken = data.token;
    const authUser = data.user || {
      id: data.id || data._id,
      _id: data._id,
      username: data.username,
      email: data.email,
    };

    if (!authToken || !authUser?.email) {
      throw new Error("Invalid register response from server");
    }

    setUser(authUser);
    setToken(authToken);

    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(authUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
