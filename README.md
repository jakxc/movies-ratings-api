# movies-ratings-api  
A movies and ratings node js api for finding movies, ratings and posters. It allows users to search movies and ratings by title, imdb ID as well as search for movie posters by imdb ID and add a movie poster to an existing movie .     

## Steps

## PART I: Download & Build on local

## Method 1: From github
### 1) Clone the repository, install node packages  and verify routes locally

``` 
//on local
git clone https://github.com/jakxc/movies-ratings-api.git
cd movies-ratings-api
npm install
npm start
```

Open your local browser and verify the api is working by accessing:     
`http://localhost:3000/movies?title=titanic`   
`http://localhost:3000/movies?id=tt0117731`   
`http://localhost:3000/posters/tt0117731`   


### 2) Transfer project files from local to remote host

**Note**  
The `node_modules` folder will not be transferred, we can do npm install later on remote server itself to pull down required node packages

