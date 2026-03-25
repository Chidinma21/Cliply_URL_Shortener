FROM node:20-alpine

RUN apk add --no-cache curl
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.15.2/migrate.linux-amd64.tar.gz | tar xvz && mv migrate /usr/usr/bin/migrate

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

COPY start.sh .

RUN chmod +x start.sh

CMD ["./start.sh"]