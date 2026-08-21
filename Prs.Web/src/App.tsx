import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Outlet } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "./users/IUser";
import { Toaster } from "react-hot-toast";
import { userAPI } from "./users/UserAPI";

export interface UserContextType {
  user: IUser | undefined;
  setUser: React.Dispatch<React.SetStateAction<IUser | undefined>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext(): UserContextType {
  const userContext = useContext(UserContext);
  if (userContext === undefined) {
    throw new Error("context not found");
  }
  return userContext;
}

function getPersistedUser(): IUser | undefined {
  const persistedUser = localStorage.getItem("user");
  return persistedUser ? (JSON.parse(persistedUser) as IUser) : undefined;
}

function App() {
  const [user, setUser] = useState<IUser | undefined>(getPersistedUser());

  useEffect(() => {
    if (!user?.id) return;

    userAPI
      .find(user.id)
      .then((freshUser) => {
        const { password: _, ...safeUser } = freshUser;
        setUser(safeUser as IUser);
        localStorage.setItem("user", JSON.stringify(safeUser));
      })
      .catch(() => undefined);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Toaster
        toastOptions={{
          success: {
            iconTheme: {
              primary: "#0d6efd",
              secondary: "white",
            },
          },
          style: {
            maxWidth: 500,
          },
        }}
      />
      <Outlet />
    </UserContext.Provider>
  );
}

export default App;
