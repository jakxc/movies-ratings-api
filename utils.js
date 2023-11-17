import * as dotenv from 'dotenv';

dotenv.config();

const IMDB_API_KEY = process.env.IMDBAPI_KEY;
const IMDB_URL = "http://www.omdbapi.com";

const RAPID_API_KEY = process.env.RAPIDAPI_KEY;
const RAPID_URL = "https://streaming-availability.p.rapidapi.com"

/**
 * Returns response from OMDb API based on title (and page) with additional previous and next page properties
 *
 * @param {string} title Title of movie
 * @param {string} page Page of results, default value is 1
 * @return {object} data Response from fetch request. varies if the response is valid movie or error.
 */
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
            next: currentPage >= Math.ceil(parseInt(data["totalResults"]) / 10) ? null : `http://localhost:3000/movies/search?title=${title}&page=${currentPage + 1}` 
        }
        : data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

/**
 * Returns response from OMDb API based on imdb ID
 *
 * @param {string} id imdbID of movie
 * @return {object} data Response from fetch request. Varies if the response is valid movie or error.
 */
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

/**
 * Returns response from Movies of the night API based on imdb ID
 *
 * @param {string} id imdbID of movie
 * @return {object} data Response from fetch request. Varies if the response is valid movie or error.
 */
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

/**
 * Returns combined response from OMDb API and Movies of the night API.
 *
 * @param {object} movieData Data retrieved from OMdb API 
 * @param {object} movieData Data retrieved from Movie of the nights API
 * @return {object} data Combined response from movie and streaming API with details and streaming info properties. Varies if response has error.
 */
export const combineMovieData = (movieData, streamingData) => {
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

/**
 * Returns OMDb ID from movie object or null if property does not exist
 *
 * @param {object} movie Data retrieved from OMdb API 
 * @return {string} imdbID OMDb ID property from movie object
 */
export const getMovieId = (movie) => {
    if (!movie["imdbID"]) {
       console.log("No imbd ID found.");
       return null;
    } 

    return movie["imdbID"]
}

/**
 * Returns OMDb ID from movie object or null if property does not exist
 *
 * @param {object} movie Data retrieved from OMdb API 
 * @return {string} poster Poster property from movie object
 */
export const getMoviePoster = (movie) => {
    if (!movie["Poster"] || movie["Poster"] === "N/A") {
        return null;
    } 
    
    return movie["Poster"] ;
}

/**
 * Returns Buffer from image url
 *
 * @param {object} url Image url 
 * @return {object} imageBuffer Buffer from image url
 */
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


/**
 * Handles setting response header and content from server: statusCode, contentType, content (and optional encoding)
 *
 * @param {object} res Server response 
 * @param {number} statusCode Server status code
 * @param {string} contentType Response content type
 * @param {object} content Response content
 * @param {string} encoding Encoding for content (defaults to empty string which sets it as utf-8)
 */
export const handleResponse = (res, statusCode, contentType, content, encoding="") => {
    res.setHeader("Content-Type", contentType);
    res.writeHead(statusCode);
    res.write(content, encoding);
    res.end();
} 



