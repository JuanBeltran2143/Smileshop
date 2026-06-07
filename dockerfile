# 1. Imagen oficial de Node
FROM node:18-alpine

# 2. Carpeta de trabajo interna
WORKDIR /usr/src/app

# 3. Copiamos los archivos de configuración de librerías
COPY package*.json ./

# 4. INSTALACIÓN
RUN npm install --ignore-scripts

# 5. Copiamos el resto de los archivos del proyecto
COPY . .

# 6. Exponemos el puerto de la API
EXPOSE 5000

# 7. Comando de arranque
CMD ["node", "backend/server.js"]