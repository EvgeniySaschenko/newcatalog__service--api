FROM node:18.13

ARG WORKDIR_BASE
ARG SERVICE

WORKDIR ${WORKDIR_BASE}/${SERVICE}

# Установка пакетов
COPY package.json package-lock.json ./
RUN npm install
# RUN npm install --ignore-scripts=false --foreground-scripts --verbose sharp
# RUN npm install --platform=linuxmusl --arch=x64 sharp

COPY . .