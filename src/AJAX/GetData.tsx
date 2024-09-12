
export const getData = async (page = 1)=>{
    let res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
    let data =await res.json()
    return data
}