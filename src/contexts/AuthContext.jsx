import { createContext, useContext, useEffect } from "react";
import { useState } from "react";


export const AuthContext = createContext();

export default function AuthProvider({children}){
    const [isLoggedIn, setLogin] = useState(()=>{
        return !!localStorage.getItem("sostoken");
    });


  
  
    
    function login(token){
        localStorage.setItem("sostoken",JSON.stringify(token.user));
        console.log(token.user)
        setLogin(true);
  
    }
    function logout(){
      
        localStorage.clear("sostoken");
        setLogin(false);
        window.location.reload();
    }


    return(
        <AuthContext.Provider value={{isLoggedIn, login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth =()=>{
    return useContext(AuthContext);
} 