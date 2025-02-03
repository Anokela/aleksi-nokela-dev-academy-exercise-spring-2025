-Node.js (v22.13.1 or higher)
-npm (v10.9.2 or higher)

1.Project
1.  git clone https://github.com/Anokela/aleksi-nokela-dev-academy-exercise-spring-2025.git --clone the project
2. cd aleksi-nokela-dev-academy-exercise-spring-2025 --navigate to project file

2.Backend:
1. cd backend -- navigate to backend-folder
2. npm install -- install backend dependacies
4. If not exist create .env to root file with data: 
    PORT=5000
    DB_HOST=host.docker.internal
    DB_PORT=5432
    DB_USER=academy
    DB_PASSWORD=academy
    DB_NAME=electricity
    REACT_APP_API_URL=http://localhost:5000
4. run this command in backend-folder: docker compose -f docker-compose.backend.yml up --build
    -- this is to mount backend backend in docker container. HOX database must also be cloned and running in the docker container
6. Backend can also be started locally by command: npm run dev

3.Frontend:
1. cd front-end -- navigate to front-end-folder
2. npm install -- install front-end dependacies
4. If not exist create .env to root file with data: 
    VITE_API_URL=http://localhost:5000/api
3. npm run dev -- start frontend locally

4.Database:
1. cd database -- navigate to database
1. Install Docker Desktop on your computer (https://docs.docker.com/desktop/)
2. Clone this repository
3. On command line under this folder run:

```
docker compose up --build --renew-anon-volumes -d
```

Please note that running that might take couple of minutes

4. Docker setup also comes with Adminer UI, where you can check your database contents at http://localhost:8088/
5. Log into Adminer with following information (password: academy):

![alt text](login.png)

Database is running at postgres://localhost:5432/electricity and the database name is electricity. Database comes with user academy (password: academy).

# Database structure
Database consists of one table electricityData.

## ElectricityData table
| Column | Description | Type |
| ----------- | ----------- | ----------- |
| id | id, primary key | integer |
| date | date of the data point | DATE |
| startTime | Starting time of the hour for the data point | TIMESTAMP |
| productionAmount | Electricity production for the hour MWh/h | NUMERIC(11,5) *NULL* |
| consumptionAmount | Electricity consumption for the hour kWh | NUMERIC(11,3) *NULL* |
| hourlyPrice | Electricity price for the hour | NUMERIC(6,3) *NULL* |

5.End-to-end tests
1. cd e2e -- navigate to e2e folder
2. npm install -- install dependancies
3. run tests via command line: npm run cypress:run OR npx cypress run
OR
   run tests using Cyprecc GUI: npm run cypress:open OR npx cypress open
