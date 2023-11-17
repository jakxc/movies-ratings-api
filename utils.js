import * as dotenv from 'dotenv';

dotenv.config();

const IMDB_API_KEY = process.env.IMDBAPI_KEY;
const IMDB_URL = "http://www.omdbapi.com";

const RAPID_API_KEY = process.env.RAPIDAPI_KEY;
const RAPID_URL = "https://streaming-availability.p.rapidapi.com"

export const getMovieByTitle = async (title, currentPage = 1) => {
    try {
        const res = await fetch(`${IMDB_URL}/?apikey=${IMDB_API_KEY}&s=${title}&page=${currentPage}`);
        const data = await res.json();
        console.log(data);
        currentPage = parseInt(currentPage);
        return data["totalResults"] 
        ? { 
            ...data, 
            previous: currentPage <= 1 ? null : `http://localhost:3000/movies/search?title=${title}&page=${currentPage - 1}`, 
            next: currentPage >= Math.ceil(parseInt(data["totalResults"]) / 10) ? null : `http://localhost:3000/movies/search?title=${title}&page=${currentPage + 1}` }
        : data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const getMovieById = async (id) => {
    try {
        const res = await fetch(`${IMDB_URL}/?apikey=${IMDB_API_KEY}&i=${id}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const getStreamingById =  async (id) => {
    const url = `${RAPID_URL}/get?output_language=en&imdb_id=${id}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': `${RAPID_API_KEY}`,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
    };

    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const combineMovieData = (movieData, streamingData) => {
    // if (movieData["Error"]) throw Error(movieData["Error"]);
    // if (streamingData["message"] ) throw Error(streamingData["message"]);
    try {
        const combinedObj = { 
            details: movieData || {}, 
            streamingInfo: streamingData["result"] 
            ? streamingData["result"]["streamingInfo"] 
            ? streamingData["result"]["streamingInfo"] : {} 
            : {} 
        };

        return combinedObj;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const getMovieId = (movie) => {
    if (!movie["imdbID"]) {
       console.log("No imbd ID found.");
       return null;
    } 

    return movie["imdbID"]
}

export const getMoviePoster = (movie) => {
    if (!movie["Poster"] || movie["Poster"] === "N/A") {
        return null;
    } 
    
    return movie["Poster"] ;
}

export const convertUrlToBuffer =  async (url) => {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        return imageBuffer;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const handleResponse = (res, statusCode, contentType, content, encoding="") => {
    res.setHeader("Content-Type", contentType);
    res.writeHead(statusCode);
    res.write(content, encoding);
    res.end();
} 



