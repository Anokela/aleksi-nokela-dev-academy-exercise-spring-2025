# use Node.js -image
FROM node:18

# define working directory in container
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# install dependancies
RUN npm install

# Copy project source code
COPY . .

# compile typescript code
RUN npm run build

# run server
CMD ["node", "dist/index.js"]

