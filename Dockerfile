FROM itisfoundation/puppeteer:14-3

# RUN apt-get update &&\ 
#     apt-get install whois

ARG WORKDIR_BASE
ARG SERVICE

WORKDIR ${WORKDIR_BASE}/${SERVICE}

# Установка пакетов
COPY package.json package-lock.json ./
RUN npm install

COPY . .