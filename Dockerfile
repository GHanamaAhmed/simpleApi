FROM node:20-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

FROM dependencies AS run

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV production

CMD [ "npm", "start" ]