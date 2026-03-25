FROM node:20-alpine

RUN apk add --no-cache curl tar

RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.15.2/migrate.linux-amd64.tar.gz | tar -xvz -C /usr/local/bin

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]