Galaksio Docker Image
===================
The [Galaksio](https://github.com/tklingstrom/galaksio) [Docker](http://www.docker.io) Image is an easy distributable full-fledged Galaksio installation.

Galaksio is a web application that simplifies the usage of the Galaxy bioinformatics platform (https://usegalaxy.org/).
Galaksio has been developed as part of the [B3Africa Project](http://www.b3africa.org/), which has received funding from the European Union’s Horizon 2020 research and innovation programme.

- Citation:
> Klingström T, Hernández-de-Diego R, and Bongcam-Rudloff E. Galaksio, a user friendly workflow-centric front end for Galaxy. EMBnet.journal (in revision).


# Build the image
The docker image for Galaksio can be found in the [docker hub](https://hub.docker.com/r/tklingstrom/galaksio/). However, you can rebuild is manually by running **docker build**.

```sh
sudo docker build -t galaksio .
```
Note that the current working directory must contain the Dockerfile file.

## Running the Container
The recommended way for running your Galaksio docker is using the provided **docker-compose** script that resolves the dependencies and make easier to customize your instance. Alternatively you can run the docker manually.

## Quickstart
This procedure starts Galaksio in a standard virtualised environment.

- Install [docker](https://docs.docker.com/engine/installation/) for your system if not previously done.
- `docker run -it -p 8081:80 tklingstrom/galaksio`
- Galaksio will be available at [http://localhost:8081/](http://localhost:8081/)

## Using the docker-compose file
Launching your Galaksio docker is really easy using docker-compose. Just download the *docker-compose.yml* file and customize the content according to your needs. There are few settings that should be change in the file, follow the instructions in the file to configure your container.
To launch the container, type:
```sh
sudo docker-compose up
```
Using the *-d* flag you can launch the containers in background.

In case you do not have the Container stored locally, docker will download it for you.


## Run manually
You can run manually your containers using the following commands:

```sh
sudo docker run --name galaksio -v /your/data/location/galaksio-data:/usr/local/apache2/htdocs/server/conf/ -e ADMIN_ACCOUNTS=youradminuser -e GALAXY_SERVER=https://usegalaxy.org -e GALAXY_SERVER_URL=https://usegalaxy.org -p 8081:80 -d tklingstrom/galaksio
```

Please note that the name is likely to change as we move to an organizatio repo at Dockerhub hosted by SLU Global Bioinformatics Centre

In case you do not have the Container stored locally, docker will download it for you.

A short description of the parameters would be:
- `docker run` will run the container for you.

- `-p 8081:80` will make the port 80 (inside of the container) available on port 8081 on your host.
    Inside the container an Apache webserver is running on port 80 and that port can be bound to a local port on your host computer.

- `tklingstrom/galaksio` is the Image name, which can be found in the [docker hub](https://hub.docker.com/r/tklingstrom/galaksio/). Please note that the name is likely to change as we move to an organizatio repo at Dockerhub hosted by SLU Global Bioinformatics Centre.

- `-d` will start the docker container in daemon mode.

- `-e VARIABLE_NAME=VALUE` changes the default value for a system variable.
The Galaksio docker accepts the following variables that modify the behavior of the system in the docker.

    - **ADMIN_ACCOUNTS**, the email for the admin accounts. Using these accounts you can access to the admin page (e.g. [http://yourserver:8081/admin](http://yourserver:8081/admin)) and manipulate the settings for the system.
    - **GALAXY_SERVER**, the internal URL for the Galaxy server used by this Galaksio instance.
    - **GALAXY_SERVER_URL**, the external URL for the Galaxy server used by this Galaksio instance (usually be the same that above).
    - **MAX_CONTENT_LENGTH**, max size (in MB) for uploaded files (eg. a value of 300 will be 300MB).

# First configuration for Galaksio
By default Galaksio is configured to work with the official [Galaxy](https://usegalaxy.org) instance.This and other options can be customized through the web application. The first time that you access to your Galaksio instance you will need to configure some of the main settings.

# Version log
  - v0.3 September 2017: First version of the docker.
