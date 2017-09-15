<div class="imageContainer" style="" >
    <img src="galaksio_logo.png" title="Galaksio logo." style=" height: 70px !important; margin-bottom: 20px; ">
</div>

# Installing Galaksio
Galaksio is a web application which means that you don't necessarily need to install it. A running instance of Galaksio can be accessed in the [following link](http://77.235.253.122:8093). However, if you want to set up your own Galaksio you can easily do it by following these instructions. The faster way to install Galaksio is by using Dockers, a tool that allows you to install your favorite services in just a few seconds and regardless of your operating system. Alternatively, you can manually create your own Galaksio server by following the instructions shown below.

## Auto-install using Dockers
The [Galaksio](https://github.com/fikipollo/galaksio) [Docker](http://www.docker.io) Image is an easy distributable full-fledged Galaksio installation. The docker image for Galaksio can be found in the [docker hub](https://hub.docker.com/r/fikipollo/galaksio/). However, you can rebuild is manually by running **docker build**.

### Running the Container
The recommended way for running your Galaksio docker is using the provided **docker-compose** script that resolves the dependencies and make easier to customize your instance. Alternatively you can run the docker manually.

#### Quickstart

This procedure starts Galaksio in a standard virtualised environment.

- Install [docker](https://docs.docker.com/engine/installation/) for your system if not previously done.
- `docker run -it -p 8081:80 fikipollo/galaksio`
- Galaksio will be available at [http://localhost:8081/](http://localhost:8081/)

#### Using the docker-compose file
Launching your Galaksio docker is really easy using docker-compose. Just download the *docker-compose.yml* file and customize the content according to your needs. There are few settings that should be change in the file, follow the instructions in the file to configure your container.
To launch the container, type:
```sh
sudo docker-compose up
```
Using the *-d* flag you can launch the containers in background.

In case you do not have the Container stored locally, docker will download it for you.


#### Run manually
You can run manually your containers using the following commands:

```sh
sudo docker run --name galaksio -v /your/data/location/galaksio-data:/usr/local/apache2/htdocs/server/conf/ -e ADMIN_ACCOUNTS=youradminuser -e GALAXY_SERVER=https://usegalaxy.org -e GALAXY_SERVER_URL=https://usegalaxy.org -p 8081:80 -d fikipollo/galaksio
```

In case you do not have the Container stored locally, docker will download it for you.

A short description of the parameters would be:
- `docker run` will run the container for you.

- `-p 8081:80` will make the port 80 (inside of the container) available on port 8081 on your host.
    Inside the container an Apache webserver is running on port 80 and that port can be bound to a local port on your host computer.

- `fikipollo/galaksio` is the Image name, which can be found in the [docker hub](https://hub.docker.com/r/fikipollo/galaksio/).

- `-d` will start the docker container in daemon mode.

- `-e VARIABLE_NAME=VALUE` changes the default value for a system variable.
The Galaksio docker accepts the following variables that modify the behavior of the system in the docker.

    - **ADMIN_ACCOUNTS**, the email for the admin accounts. Using these accounts you can access to the admin page (e.g. [http://yourserver:8081/admin](http://yourserver:8081/admin)) and manipulate the settings for the system.
    - **GALAXY_SERVER**, the internal URL for the Galaxy server used by this Galaksio instance.
    - **GALAXY_SERVER_URL**, the external URL for the Galaxy server used by this Galaksio instance (usually be the same that above).
    - **MAX_CONTENT_LENGTH**, max size (in MB) for uploaded files (eg. a value of 300 will be 300MB).


## Manual installation
### Requirements
- A Unix system (could work in Windows but we've not tested it yet).
- A web server that supports Python execution. A typical installation will include an Apache server + uWSGI plugin for running Python scripts.
- Python 2.7
- Python modules: Flask, Requests, Bioblend and FPDF
- A web browser (we recommend Google Chrome or Firefox).

### Quick install
First install all dependencies. For example, the instructions for an Ubuntu 16.04 server would be:
```bash
apt-get update
apt-get install -y python-pip unzip wget
pip install requests bioblend flask fpdf
```

Download and extract the [latest version](https://github.com/fikipollo/galaksio/releases/tag/latest) of Galaksio from the GitHub repository.
```bash
wget https://github.com/fikipollo/galaksio/archive/latest.zip
unzip galaksio-latest.zip
```

Launch the Flask server. Your new Galaksio instance will be listening to port 8081.
```bash
galaksio-latest/server/run.sh --start
```

Go to section "Configuring Galaksio" to continue with the installation.

### Complete install
First install all dependencies. As an example, the instructions for an Ubuntu 16.04 server could be:
```bash
apt-get update
apt-get install -y apache2 libapache2-mod-wsgi python-pip unzip nano wget
pip install requests bioblend flask fpdf
```

Download and extract the [latest version](https://github.com/fikipollo/galaksio/releases/tag/latest) of Galaksio from the GitHub repository. Then copy the sources to your web server directory. Please, note that this release includes all the JavaScript and CSS sources minified, in order to reduce the load times. Alternatively you can use the "master" branch to get the latest stable version with non-minified files.

```bash
wget -O /tmp/galaksio.zip https://github.com/fikipollo/galaksio/archive/latest.zip
unzip galaksio.zip -d /tmp/galaksio
mv /tmp/galaksio/* /var/www/html/
chown -R www-data:www-data /var/www/html/
rm -r /tmp/galaksio*
```

Now, we need to change some options that are enabled by default. First, we disable the auto-launch of the application in the *launch_server.py* file which can be problematic when using a web server. After that, we need to change the default port for Galaksio. For this example we will use the default Apache port 80.
```bash
sed -i 's/application\.launch/#application\.launch/' /var/www/html/server/launch_server.py
sed -i 's/8081/80/' /var/www/html/server/resources/example_serverconf.py
```

Now, create a new file "galaksio.wsgi" in your apache root dir and add the following content:
```bash
nano /var/www/html/galaksio.wsgi #Add the content below
```
**/var/www/html/galaksio.wsgi**
```python
import sys
import os

sys.path.insert(0, "/var/www/html")

from server.launch_server import app as application
```

Finally, we need to register the new site in the Apache server. This step can be different depending on your server configuration. Disable the default server site and create the new *conf* file with the following content.
```bash
rm /etc/apache2/sites-enabled/000-default.conf
nano /etc/apache2/sites-available/galaksio.conf #Add the content below
ln -s /etc/apache2/sites-available/galaksio.conf /etc/apache2/sites-enabled/
```
**/etc/apache2/sites-available/galaksio.conf**
```apache
<VirtualHost *:80>
        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/html

        WSGIDaemonProcess galaksio user=www-data group=www-data threads=4 home=/var/www/html
        WSGIScriptAlias / /var/www/html/galaksio.wsgi
        WSGIPassAuthorization On

        <Directory "/var/www/html/">
            WSGIProcessGroup galaksio
            WSGIApplicationGroup %{GLOBAL}
            Require all granted
        </Directory>

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

</VirtualHost>
```

Finally restart your web server.  Your new fresh Galaksio instance will be listening to port 80.
```bash
service apache2 restart
```

## First configuration for Galaksio
By default Galaksio is configured to work with the official [Galaxy](https://usegalaxy.org) instance.This and other options can be customized through the web application. The first time that you access to your Galaksio instance you will need to configure some of the main settings.
