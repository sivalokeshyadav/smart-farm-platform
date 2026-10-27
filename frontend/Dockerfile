FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host", "--port", "5174"]
