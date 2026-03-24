

export async function signup(data){
    try {
          const url ="http://localhost:4000/api/v1/signup";
const res = await fetch(url,{
     method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
});
const response = await res.json();
if(!res.ok){
    throw new Error(response.message || "error fetching api");
}
return response;
    }catch(err){
        console.error(err.message);
        throw err;
    }
}


export async function signin(data){
    try{
         const url ="http://localhost:4000/api/v1/signin";
    const res = await fetch(url,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    const response= await res.json();
    console.log(response);

    if(!res.ok){
        throw new Error(response.message || "errpor fetching api");
    }
    return response;
    }catch(err){
        console.error(err.message);
        throw err;
    }
   
} 