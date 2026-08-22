FROM node:22-slim AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# next build only -- payload migrate runs at container start (see CMD), not
# here, because the database isn't reachable during the image build itself.
RUN npx next build

EXPOSE 3000

CMD ["sh", "-c", "npx payload migrate && exec npx next start"]
