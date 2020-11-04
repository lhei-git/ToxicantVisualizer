FROM node:14.6 as build

COPY . /reactApp/
WORKDIR /reactApp
RUN npm install
RUN npm run build

FROM nginx:alpine

COPY --from=build /reactApp/build/ /usr/share/nginx/html/
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
