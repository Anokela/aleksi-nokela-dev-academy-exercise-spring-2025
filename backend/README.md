-Node.js (v22.13.1 or higher)
-npm (v10.9.2 or higher)

Backend:
    1. cd backend -- navigate to backend-folder
    2. npm install -- install backend dependacies
    3. If not exist create .env to root file with data: 
        PORT=5000
        DB_HOST=host.docker.internal
        DB_PORT=5432
        DB_USER=academy
        DB_PASSWORD=academy
        DB_NAME=electricity
        REACT_APP_API_URL=http://localhost:5000
    4. run this command in backend-folder: docker compose -f docker-compose.backend.yml up --build
        -- this is to mount backend backend in docker container. HOX database must also be cloned and running in the docker container
        OR 
        run: docker compose -f docker-compose.backend.yml up --build -d
        -- without logs in terminal
    5. Run this to start backend: docker compose -f docker-compose.backend.yml start
    6. Run this to stop backend: docker compose -f docker-compose.backend.yml stop
    7. Run this command if you want to stop, remove and remount backend (after code changes): docker compose -f docker-compose.backend.yml down && docker compose -f docker-compose.backend.yml up --build -d
    8. Backend can also be started locally by command: npm run dev