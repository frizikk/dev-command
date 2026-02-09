FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We use ts-node for simplicity in this sandbox, for production you'd compile to JS
CMD ["npm", "run", "start"]
