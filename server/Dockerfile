FROM node:18-alpine

WORKDIR /app

# Kopiuj package.json
COPY package.json ./

# Instaluj zależności
RUN npm install --production --no-package-lock

# Kopiuj kod źródłowy
COPY . .

# Port backendu
EXPOSE 5000

# Uruchom aplikację
CMD ["node", "src/index.js"]
