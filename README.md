<div class="imageContainer" style="text-align:center; font-size:10px; color:#898989" >
    <img src="https://cloud.githubusercontent.com/assets/11427394/26060697/1dc10348-3986-11e7-92ae-e41b98a27625.png" title="Galaksio logo."/>
</div>

> An easy to use GUI for running Galaxy workflows.

Galaksio is a web application that simplifies the usage of the Galaxy bioinformatics platform (https://usegalaxy.org/).
Galaksio provides a simple but complete UI for using Galaxy for biologists that require bioinformatics workflows to complete their research.
Using the application, users can run any workflow implemented in the associated Galaxy instance in just few *clicks*.
Besides, the rich user interface allows customizing the execution, uploading the necessary files, downloading the results, and executing several workflows simultaneously in the background.

### Quick start
First install all dependencies. For example, the instructions for an Ubuntu 16.04 server would be:
```bash
apt-get update
apt-get install -y python-pip unzip wget
pip install requests bioblend flask fpdf
```

Download and extract the [latest version](https://github.com/fikipollo/galaksio.git) of Galaksio from the GitHub repository.
```bash
wget https://github.com/fikipollo/galaksio/archive/master.zip
unzip galaksio-latest.zip
```

Launch the Flask server. Your new Galaksio instance will be listening to port 8081.
```bash
galaksio-latest/server/run.sh --start
```

By default Galaksio is configured to work with the official [Galaxy](https://usegalaxy.org) instance.This and other options can be customized through the web application. The first time that you access to your Galaksio instance you will need to configure some of the main settings.

## Documentation
Documentation for the project, including installation instructions, can be found at the ReadTheDocs platform: [http://galaksio.readthedocs.io/en/latest/](http://galaksio.readthedocs.io/en/latest/).

## Docker for Galaksio
The Galaksio Docker Image is an easy distributable full-fledged Galaksio installation.
The docker image for Galaksio can be found in the [docker hub](https://hub.docker.com/r/fikipollo/galaksio/). However, you can download the Dockerfile and other files from the [Github repository](https://github.com/fikipollo/galaksio-docker)

## About
Galaksio has been developed by the [SLU Global Bioinformatics Centre](http://sgbc.slu.se/) at the Sveriges lantbruksuniversitet (Swedish University of Agricultural Sciences).
This project is part of the B3Africa Project [http://www.b3africa.org/](http://www.b3africa.org/), which has received funding under grant agreement nr 654404 from the European Union’s Horizon 2020 research and innovation programme.
**Galaksio** application is distributed under **GNU General Public License, Version 3.**.

<img style="display:block; margin:auto;" src="https://user-images.githubusercontent.com/11427394/30154858-76cd4d9a-93bb-11e7-8834-c2d3dbf95ba3.png" title="Logos"/>
