FROM node:14.6

COPY package*.json /reactApp/
WORKDIR /reactApp
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]