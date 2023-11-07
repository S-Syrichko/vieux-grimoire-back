# Mon vieux Grimoire
## Backend
This project is a backend API for a book sharing platform.<br>
You also can visit [frontend repo](https://github.com/S-Syrichko/vieux-grimoire-front)

## Start project
### With npm
`npm install` then `npm run dev` will launch the project.
### With Docker
`docker-compose up -d`
  

#### Environnement variables
To make project functionnal, you have to create a .env file with following variables :

`MONGO_URI` : Contains the mongo connection URI as string<br>
`TOKEN_SECRET` : Contains the secret string to encode JWT tokens<br>

The project will start on port `4000`