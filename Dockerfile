FROM node:lts-alpine as build

WORKDIR /app
COPY . /app
run corepack enable pnpm && npm config set registry https://registry.npmmirror.com
RUN pnpm i --force
RUN pnpm build

FROM node:lts-alpine as server
WORKDIR /app
COPY --from=build /app/.next /app/.next
COPY --from=build /app/_package.json /app/package.json
RUN corepack enable pnpm && pnpm install --production

CMD ["npm", "run","start"]