FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm ci --include=optional

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]