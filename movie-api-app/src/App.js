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

  const [isImage, setIsImage] = useState(false);
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
        setIsImage(false);
        break;
      case (endpoint === "/movies/data/:id"):
        apiUrl = `http://localhost:3000/movies/data?id=${formData.id}&country=${formData.country}`;
        setIsImage(false);
        break;
      case (endpoint === "/posters/:id"):
        apiUrl = `http://localhost:3000/posters/${formData.id}`;
        setIsImage(true);
        break;
      case (endpoint === "/posters/add/:id"):
        apiUrl = `http://localhost:3000/posters/add/${formData.id}`;
        setIsImage(false);
        method = "POST";
        break;
      default: 
        console.log("Endpoint is not applicable");
        setIsImage(false);
        break;
    }

    setLoading(true);
    if (method === "GET") {
      fetch(apiUrl)
      .then(res => isImage ? res.arrayBuffer() : res.json())
      .then(data => {
        if (isImage) {
          setContent(Buffer.from(data, 'binary').toString('base64'));
        } else {
          setContent(JSON.stringify(data, null, 2));
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
      .then(res => res.json())
      .then(data => {
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
        <pre className="content-container">{loading ? <>Loading...</> : isImage ? <img src={`data:image/png;base64,${content}`} alt="Poster" /> : <>{content}</> }</pre>
      </div>
    </div>
  );
}

export default App;
