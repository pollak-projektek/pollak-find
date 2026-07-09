# 1. Építő fázis (Build Stage) a Frontend számára
FROM node:20-alpine AS builder

# Munkakönyvtár beállítása
WORKDIR /app

# Függőségek másolása
COPY package.json package-lock.json* ./

# Függőségek telepítése
RUN npm ci

# Forráskód másolása
COPY . .

# Frontend lefordítása
RUN npm run build

# 2. Futtató fázis (Production Stage) a Backend számára
FROM node:20-alpine AS production

WORKDIR /app

# Beállítjuk, hogy production környezetben futunk (ez bekapcsolja az express.static-ot a server.js-ben)
ENV NODE_ENV=production
ENV PORT=3001

# Másoljuk a backendhez szükséges fájlokat
COPY package.json package-lock.json* ./

# Csak a production függőségek telepítése
RUN npm ci --omit=dev

# Másoljuk a backend fájlokat
COPY server.js .
COPY src/data/ ./src/data/

# Másoljuk a lefordított frontendet az építő fázisból
COPY --from=builder /app/dist ./dist

# Kinyitjuk a szerver portját
EXPOSE 3001

# Szerver indítása
CMD ["node", "server.js"]
