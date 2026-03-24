
import "./header.css";
import { useAuth } from "../../contexts/AuthContext";
export default function Header(){
    const {logout} = useAuth();
    
    return(
        <>  
            <header>
                <div id="logo">
                    SOS
                </div>
                <div id="indicator">Location indicator</div>
                <button onClick={()=>{
                   
                    logout();
                }}>Logout</button>
            </header>
        </>
    )
}