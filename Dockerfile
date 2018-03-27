FROM node:8.9.0 as webpack
WORKDIR /src
COPY . /src
RUN npm install
RUN npm run build


FROM nginx
RUN mkdir /dist
COPY --from=webpack /src/dist /dist

RUN rm /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/
COPY run_nginx.sh run_nginx.sh
CMD /run_nginx.sh
