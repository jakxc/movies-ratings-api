import { useState } from "react";
import { Buffer } from 'buffer';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    endpoint: "/movies/search/:title",
    title: "",
    id: "",
    page: 1,
    country: "",
    file: ""
  })

  const [contentType, setContentType] = useState("application/json");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value, type, files } = e.target;

    setFormData(prev => {
      return {
        ...prev,
        [name]: type === "file" ? files[0] : value
      }
    })
    console.log(formData);
  }

  const makeAPICall = (e) => {
    e.preventDefault();
    let apiUrl = "";
    let method = "GET";
    let endpoint = formData.endpoint;

    switch(true) {
      case (endpoint === "/movies/search/:title"):
        apiUrl = `http://localhost:3000/movies/search?title=${formData.title}&page=${formData.page}`;
        break;
      case (endpoint === "/movies/data/:id"):
        apiUrl = `http://localhost:3000/movies/data?id=${formData.id}&country=${formData.country}`;
        break;
      case (endpoint === "/posters/:id"):
        apiUrl = `http://localhost:3000/posters/${formData.id}`;
        break;
      case (endpoint === "/posters/add/:id"):
        apiUrl = `http://localhost:3000/posters/add/${formData.id}`;
        method = "POST";
        break;
      default: 
        console.log("Endpoint is not applicable");
        break;
    }

    setLoading(true);
    if (method === "GET") {
      fetch(apiUrl)
      .then(async res => {
        setContentType(res.headers.get("Content-Type"));
        if (res.headers.get("Content-Type").includes("application/json")) {
          const data = await res.json();
          setContent(JSON.stringify(data, null, 2));
        } else {
          const blob = await res.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const imageBuffer = Buffer.from(arrayBuffer);
          setContent(Buffer.from(imageBuffer, "binary").toString("base64"));
        }
      })
      .finally(() => setLoading(false));
    } else if (method === "POST") {
      fetch(apiUrl, {
        method: "POST", //POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "image/png",
        },
        body: formData.file,
      })
      .then(async res => {
        setContentType(res.headers.get("Content-Type"));
        const data = await res.json();
        console.log(data);
        setContent(JSON.stringify(data));
      })
      .finally(() => setLoading(false));
    }
  }

  return (
    <div className="app">
      <h1>Movie ratings and streaming API</h1>
      <div className="container">
        <form className="form" onSubmit={makeAPICall}>
          <div className="form_input">
            <label>API endpoint</label>
            <select name="endpoint" onChange={handleChange}>
              <option value="/movies/search/:title">/movies/search/:title</option>
              <option value="/movies/data/:id">/movies/data/:id</option>
              <option value="/posters/:id">/posters/:id</option>
              <option value="/posters/add/:id">/posters/add/:id</option>
            </select>
          </div>
          <div className="form_row">
            <div className="form_input">
              <label>Movie title</label>
              <input 
                type="text"  
                name="title"
                value={formData.title} 
                onChange={handleChange} 
              />
            </div>
            <div className="form_input">
              <label>Current page</label>
              <input 
                type="number"  
                name="page"
                value={formData.page} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <div className="form_row">
            <div className="form_input">
                <label>Movie id</label>
                <input 
                  type="text"  
                  name="id"
                  value={formData.id} 
                  onChange={handleChange} 
                />
            </div>
            <div className="form_input">
              <label>Country</label>
              <input 
                type="text"  
                name="country"
                onChange={handleChange} 
              />
            </div>
          </div>
          <div className="form_input">
              <label>Upload Poster</label>
              <input 
                type="file"  
                name="file"
                onChange={handleChange} 
              />
          </div>
          <button className="btn" onClick={makeAPICall}>Submit</button>
        </form>
        <pre className="content-container">{loading ? <>Loading...</> : contentType === "application/json" 
        ? <>{content}</> 
        : <img src={`data:image/png;base64,${content}`} alt="Poster" /> }</pre>
      </div>
    </div>
  );
}

export default App;
