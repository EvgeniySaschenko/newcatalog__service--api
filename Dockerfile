FROM itisfoundation/puppeteer:14-3

# RUN apt-get update &&\ 
#     apt-get install whois

ARG WORKDIR_BASE

WORKDIR ${WORKDIR_BASE}

# Установка пакетов
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
