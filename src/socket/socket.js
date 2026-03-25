import {io} from "socket.io-client";

const url = import.meta.env.VITE_SERVER_URL;
console.log(url);
const socket = io(url, {
    autoConnect: false
}
    
);


export default socket;