FROM itisfoundation/puppeteer:14-3

RUN apt install whois

ARG WORKDIR_BASE
ARG SERVICE

WORKDIR ${WORKDIR_BASE}/${SERVICE}

# Установка пакетов
COPY package.json package-lock.json ./
RUN npm install

COPY . .