FROM node:18.2.0-alpine

WORKDIR /app

COPY package.json ./

#change date time to Jakarta
RUN apk add tzdata

#set timezone +7
RUN export TZ="Asia/Jakarta"
RUN apk add --no-cache tzdata \
    && ln -sf /usr/share/zoneinfo/Asia/Jakarta /etc/localtime \
    && echo "Asia/Jakarta" > /etc/timezone

RUN npm install --legacy-peer-deps

COPY ./ ./

EXPOSE 8100

CMD [ "npm", "start" ]
