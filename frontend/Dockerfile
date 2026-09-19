FROM node:20-alpine

WORKDIR /app

# Install dependensi Node.js
COPY package*.json ./
RUN npm install

# Copy seluruh kode frontend
COPY . .

EXPOSE 3000

# Jalankan server Next.js mode dev
CMD ["npm", "run", "dev"]