End-to-end tests
1. cd e2e -- navigate to e2e folder
2. npm install -- install dependancies
3. To run tests locally:
   1. cd front-end -- navigate to front-end-folder
      - start frontend locally: npm run dev
      - check if front-end is running in: http://localhost:5173
         - baseUrl in cypress.config.js must be the same as frontend, change if needed
   2. cd backend -- navigate to backend-folder
      - Run this to start backend: docker compose -f docker-compose.backend.yml start
         OR
      - run: npm run dev
   3.  cd e2e -- navigate to e2e folder
      - run tests via command line: npm run cypress:run OR npx cypress run
         OR
      - run tests using Cyprecc GUI: npm run cypress:open OR npx cypress open