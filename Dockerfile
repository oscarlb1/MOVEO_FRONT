# ETAPA 1: Construcción (Cambiamos la fuente a Google Mirror)
FROM mirror.gcr.io/library/node:lts-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ETAPA 2: Producción (Cambiamos la fuente a Google Mirror)
FROM mirror.gcr.io/library/nginx:stable-alpine AS production-stage

# --- ESTA ES LA LÍNEA QUE TIENES QUE AÑADIR ---
COPY nginx.conf /etc/nginx/conf.d/default.conf
# ----------------------------------------------

COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]