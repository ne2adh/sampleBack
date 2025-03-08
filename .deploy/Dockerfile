# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install --silent && npm cache clean --force

# Copiar el resto del código fuente
COPY . .  

RUN chmod +x node_modules/.bin/tsc

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /usr/src/app

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /usr/src/app/package.json ./ 
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Ajustar permisos
RUN chmod -R 755 /usr/src/app/dist
RUN chmod 755 /usr/src/app/package.json

# Eliminar archivos innecesarios
RUN rm -rf \
    /usr/src/app/.gitignore \
    /usr/src/app/Dockerfile \
    /usr/src/app/Procfile \
    /usr/src/app/.env.sample \
    /usr/src/app/captain-definition \
    /usr/src/app/src

# Instalar solo dependencias de producción
RUN npm install --only=production

# Definir variables de entorno
ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

CMD ["npm", "start"]
