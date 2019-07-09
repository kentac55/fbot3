FROM golang:latest as go-builder
ENV CGO_ENABLED=0
ENV GO111MODULE=off
ENV GOARCH=amd64
ENV GOOS=linux
ENV GOPATH=/build
RUN go get -u github.com/ikawaha/nise
RUN go get -u github.com/greymd/ojichat

FROM node:lts-alpine as node-builder
WORKDIR /build
COPY . .
RUN yarn install
RUN yarn run build

FROM node:lts-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=go-builder /build/bin /bin
COPY --from=node-builder /build/dist /app/dist
COPY . .
RUN yarn install
ENTRYPOINT ["yarn", "run"]
CMD ["start"]
