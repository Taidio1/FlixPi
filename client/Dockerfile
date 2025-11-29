FROM node:18-alpine as builder

WORKDIR /app

# Kopiuj package.json
COPY package.json ./

# Instaluj zależności
RUN npm install

# Kopiuj kod źródłowy
COPY . .

# Build produkcyjny
RUN npm run build

# Stage 2: Nginx do serwowania
FROM nginx:alpine

# Kopiuj zbudowane pliki
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiuj konfigurację nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
