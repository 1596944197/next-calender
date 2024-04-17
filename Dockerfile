FROM node:lts-alpine as build

WORKDIR /app
COPY . /app
RUN yarn
RUN yarn build

FROM node:lts-alpine as server
WORKDIR /app
COPY --from=build /app/.next /app/.next
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app
EXPOSE 3006
CMD ["npm", "run","start"]