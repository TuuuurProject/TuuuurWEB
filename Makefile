docker_build:
	docker login && docker build -t tuuuur-web:latest . && docker push tuuuur-web:latest