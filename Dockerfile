FROM itisfoundation/puppeteer:14-3

# RUN apt-get update &&\ 
#     apt-get install whois

ARG APP_DIR

WORKDIR ${APP_DIR}

# Установка пакетов
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
