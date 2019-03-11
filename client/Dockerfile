FROM node:alpine as builder
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

#From builder phase, copy the contents of the build folder that contains production code and copy inside the nginx container
COPY --from=builder /app/build /usr/share/nginx/html