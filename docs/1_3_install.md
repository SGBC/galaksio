<div class="imageContainer" style="" >
    <img src="galaksio_logo.png" title="Galaksio logo." style=" height: 70px !important; margin-bottom: 20px; ">
</div>

# Installing Galaksio
Galaksio is a web application which means that you don't necessarily need to install it. A running instance of Galaksio can be accessed in the [following link](http://77.235.253.122:8093). However, if you want to set up your own Galaksio you can easily do it by following these instructions. The faster way to install Galaksio is by using Dockers, a tool that allows you to install your favorite services in just a few seconds and regardless of your operating system. Alternatively, you can manually create your own Galaksio server by following the instructions shown below.

## Auto-install using Dockers
The Galaksio Docker Image is an easy distributable full-fledged Galaksio installation. The docker image for Galaksio can be found in the [docker hub](https://hub.docker.com/r/fikipollo/galaksio/).

### Install the image

First you need to install docker. Please follow the [instructions](https://docs.docker.com/installation/) from the Docker project.

After the successful installation, all you need to do is:

```sh
docker run -d -p 8081:80 fikipollo/galaksio
```

In case you do not have the Container stored locally, docker will download it for you.

A short description of the parameters would be:
- `docker run` will run the container for you.

- `-p 8081:80` will make the port 80 (inside of the container) available on port 8081 on your host.
    Inside the container an Apache Webserver is running on port 80 and that port can be bound to a local port on your host computer.
    With this parameter you can access to the Galaksio instance via `http://localhost:8081` immediately after executing the command above.

- `fikipollo/galaksio` is the Image name, which can be found in the [docker hub](https://hub.docker.com/r/fikipollo/galaksio/).

- `-d` will start the docker container in daemon mode.


## Manual installation
### Requirements
- A Unix system (could work in Windows but we've not tested it yet).
- A web server that supports Python execution. A typical installation will include an Apache server + uWSGI plugin for running Python scripts.
- Python 2.7
- Python modules: Flask and Requests
- A web browser (we recommend Google Chrome or Firefox).

### Quick install
First install all dependencies. As an example, the instructions for a Ubuntu 16.04 server could be:
```bash
apt-get update
apt-get install -y python-flask python-requests unzip wget
```
Download and extract the latest version of Galaksio from the GitHub repository.
```bash
wget https://github.com/fikipollo/galaksio/archive/release/last.zip
unzip last.zip
```

Launch the Flask server. Your new fresh Galaksio instance will be listening to port 8081.
```bash
galaksio-release-last/server/run.sh --start
```

Go to section "Configuring Galaksio" to continue with the installation.

### Complete install
First install all dependencies. As an example, the instructions for a Ubuntu 16.04 server could be:
```bash
apt-get update
apt-get install -y apache2 libapache2-mod-wsgi python-flask python-requests unzip nano wget
```

Download and extract the latest version of Galaksio from the GitHub repository. The branch tagged as "release/last" includes all the JavaScript and CSS sources minified, in order to reduce the download times. Use the "master" branch to get the latest stable version with non-minified files. Then copy the sources to your web server directory.

```bash
wget -O /tmp/galaksio.zip https://github.com/fikipollo/galaksio/archive/release/last.zip
unzip /tmp/galaksio.zip -d /tmp/galaksio
mv /tmp/galaksio/*/* /var/www/html/
chown -R www-data:www-data /var/www/html/
rm -r /tmp/galaksio/
rm /tmp/galaksio.zip
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
By default Galaksio will work with the official [Galaxy](https://usegalaxy.org) instance.
This and other options can be customized through the web application.
The first time that you access to your Galaksio instance you will need to configure some of the main settings.
