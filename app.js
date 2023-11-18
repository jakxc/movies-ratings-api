import * as http from "http";
import { readFile, writeFileSync, existsSync } from "fs";
import { fileTypeFromBuffer } from "file-type";
import { 
    getMovieById, 
    getMovieByTitle, 
    getStreamingById, 
    combineMovieData,
    getMoviePoster,
    convertUrlToBuffer,
    handleResponse
 } from "./utils.js"

const PORT = process.env.PORT || 3000;

const routing =  async (req, res) => {
    const url = req.url;
    const method = req.method;

     // /movies/search?title={title}&page={page} : GET
    if ((url.match(/\/movies\/search\?([a-zA-Z0-9])/) || url.startsWith("/movies/search")) && method.toLowerCase() === "get") { 
        res.setHeader("Access-Control-Allow-Origin", "*");   
       
        try {
            const params = new URLSearchParams(req.url.split("?")[1]); 
            const title = params.get("title");
            const page = params.get("page") || 1;
            const movies = await getMovieByTitle(title, page);
           
            switch (true) {
                // 400 response if no title is provided
                case (!title || title.length === 0):
                    handleResponse(res, 400, "application/json", JSON.stringify({ 
                        error: true, 
                        message: "You must supply a title!" 
                    }))
                    break;
                    // 400 response if invalid page number is provided
                case (!parseInt(page) || parseInt(page) < 1): 
                    handleResponse(res, 400, "application/json", JSON.stringify({ 
                        error: true,
                        message: "You must supply a valid page number!" 
                    }))
                    break;
                    // 404 response if no movie is found
                case (!movies["totalResults"]):
                    handleResponse(res, 404, "application/json", JSON.stringify({ message: movies["Error"] || "Movie/s not found!" }))
                    break;
                default:
                    handleResponse(res, 200, "application/json", JSON.stringify(movies))
                    break;
            }

        } catch (err) {
            handleResponse(res, 500, "application/json", JSON.stringify({ error: true, message: "An unexpected error has occured!" }))
            console.log(err["message"]);
        }

        // /movies/data?id={id}&country={country} : GET
    } else if ((url.match(/\/movies\/data\?([a-zA-Z0-9])/) || url.startsWith("/movies/data")) && method.toLowerCase() === "get") {
        res.setHeader("Access-Control-Allow-Origin", "*");   

        try {
            // get id from url
            const params = new URLSearchParams(req.url.split("?")[1]);
            const id = params.get("id");
            const country = params.get("country");
            const movie = await getMovieById(id);
            const streaming = await getStreamingById(id);
            const combinedData = combineMovieData(movie, streaming);

            switch (true) {
                case (!id || id.length === 0):
                     // 400 response if no id is provided
                    handleResponse(res, 400, "application/json", JSON.stringify({ 
                        error: true,
                        message: "You must supply an imdbID!" 
                    }));
                    break;
                     // 404 response if no movie is found
                case (movie["Response"] === "False"):
                    handleResponse(res, 404, "application/json", JSON.stringify({ message: movie["Error"] || "Movie not found!" }));
                    break;
                default:
                    const filteredStreamingData = { 
                        ...combinedData, 
                         streamingInfo: country ? { [country]: combinedData["streamingInfo"][country] } : combinedData["streamingInfo"]}
                    handleResponse(res, 200, "application/json", JSON.stringify(filteredStreamingData));
                    break;
            }
        } catch (err) {
            handleResponse(res, 500, "application/json", JSON.stringify({ error: true, message: "An unexpected error has occured!" }))
            console.log(err["message"]);
        }
        // /posters/:id : GET
    } else if ((url.match(/\/posters\/([a-zA-Z0-9])/) || url.startsWith("/posters/")) && method.toLowerCase() === "get") {    
        res.setHeader("Access-Control-Allow-Origin", "*");   

        try {
            const id = req.url.split("/")[2];
            const movie = await getMovieById(id);
            const posterUrl = getMoviePoster(movie);
            const filePath = `./posters/${id}.png`;

            switch (true) {
                // 400 response if no id is provided
                case (!id || id.length === 0):
                    handleResponse(res, 400, "application/json", JSON.stringify({ 
                        error: true, 
                        message: "You must supply an imdbID!" 
                    }));
                    break;
                    // 404 response if no movie is found
                case (movie["Response"] === "False"):
                    handleResponse(res, 404, "application/json", JSON.stringify({ message: movie["Error"] || "Movie not found!" }));
                    break;
                    // 404 response if no poster file path and poster property on the movie object is found
                case (!existsSync(filePath) && !posterUrl):
                    handleResponse(res, 404, "application/json", JSON.stringify({ message: "Poster not found!" }));
                    break;
                    // 200 response if movie poster file exists in /posters
                case (existsSync(filePath)): 
                    readFile(filePath, "binary", (err, data) => {
                        if (err) {
                            console.log(err);
                            throw err;
                        };

                        handleResponse(res, 200, "image/png", data, "binary");
                    });
                    break;
                default:
                    const buffer = await convertUrlToBuffer(posterUrl);   
                    const fileType = await fileTypeFromBuffer(buffer);
                    const imgExtRegex = new RegExp(/(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);

                    if (!imgExtRegex.test(fileType["ext"])) {
                        handleResponse(res, 400, "application/json", JSON.stringify({ 
                            error: true, 
                            message: "Incorrect file type!" 
                        }));
                    } else {
                        writeFileSync(filePath, buffer, (err) => {
                            if (err) {
                                console.log(err)
                                throw err;
                            }
                            
                            console.log("Data written successfully to file path.");
                        });

                        readFile(filePath, "binary", (err, data) => {
                            if (err) {
                                throw err;
                            };

                            handleResponse(res, 200, "image/png", data, "binary");
                        });
                    }
                    break;
            }
        } catch (err) {
            handleResponse(res, 500, "application/json", JSON.stringify({ 
                error: true, 
                message: "An unexpected error has occured!" 
            }))
            console.log(err["message"]);
        }
        // /posters/add/:id : POST
    } else if ((url.match(/\/posters\/add\/([a-zA-Z0-9])/) || url.startsWith("/posters/add")) && (method.toLowerCase() === "post" || method.toLowerCase() === "options")) {
        if (method.toLowerCase() == "options") {
            res.writeHead(200, {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "OPTIONS, POST",
            });
            res.end();
        }

        if (method.toLowerCase() === "post") {
            res.setHeader("Access-Control-Allow-Origin", "*");   
            
            let body = [];
            req.on("data", (chunk) => {
                body.push(chunk);
            });
            req.on("end", async () => {
                const id = req.url.split("/")[3];
                const movie = await getMovieById(id);
                const buffer = Buffer.concat(body);
                const filePath = `./posters/${id}.png`;
                const fileType = await fileTypeFromBuffer(buffer);
                const imgExtRegex = new RegExp(/(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);

                try {
                    switch (true) {
                       // 400 response if no id is provided
                        case (!id || id.length === 0):
                            handleResponse(res, 400, "application/json", JSON.stringify({ 
                                error: true, 
                                message: "You must supply an imdbID!" 
                            }));
                            break;
                            // 404 response if no movie is found
                        case (movie["Response"] === "False"):
                            handleResponse(res, 404, "application/json", JSON.stringify({ 
                                message: movie["Error"] || "Movie not found!" 
                            }));
                            break;
                            // 400 response if there is no body on the request
                        case (!body || body.length === 0):
                            handleResponse(res, 400, "application/json",JSON.stringify({ 
                                error: true, 
                                message: "You must supply an image file!" 
                            }));
                            break;
                            // 400 response if wrong file type is supplied
                        case (!imgExtRegex.test(fileType["ext"])):
                            handleResponse(res, 400, "application/json",JSON.stringify({ 
                                error: true, 
                                message: "Incorrect file type!" 
                            }));
                            break;
                            // 400 response if file path already exists in /posters
                        case (existsSync(filePath)):
                            handleResponse(res, 400, "application/json",JSON.stringify({ 
                                error: true, 
                                message: "Poster for this movie already exists!" 
                            }));
                            break;
                        default: 
                            writeFileSync(filePath, buffer, (err) => {
                                if (err) {
                                    console.log(err)
                                    throw err;
                                }
                                
                                console.log("Data written successfully to file path.");         
                            });

                            handleResponse(res, 201, "application/json", JSON.stringify({
                                "error": false,
                                "message": "Poster uploaded successfully!"
                            }));
                            break;
                    }
                } catch (err) {
                    handleResponse(res, 500, "application/json", JSON.stringify({ error: true, message: "An unexpected error has occured!" }))
                    console.log(err["message"]);
                }
            })
        }
    } else {
        // No page matched the url
        handleResponse(res, 404, "application/json", JSON.stringify({"message":"Route not found"}))
    }
}

const server = http.createServer(routing);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})