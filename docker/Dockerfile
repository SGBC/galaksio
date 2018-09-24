############################################################
# Dockerfile to build Galaksio container images
# Based on official HTTPD
############################################################

# Set the base image to official HTTP
FROM httpd

# File Author / Maintainer
MAINTAINER Tomas Klingström <https://github.com/tklingstrom>


################## BEGIN INSTALLATION ######################
#INSTALL THE DEPENDENCIES
RUN apt-get update  \
    && apt-get install --no-install-recommends -y wget libapache2-mod-wsgi python-flask python-requests unzip python-pip \
    && apt-get clean \
    && pip install bioblend==0.10.0 \
    && pip install fpdf

#DOWNLOAD AND INSTALL THE APP CODE
RUN wget -O /tmp/galaksio.zip https://github.com/sgbc/galaksio/archive/master.zip \
#RUN wget -O /tmp/galaksio.zip https://github.com/OskarSLU/galaksio/archive/v0.3.zip \
    && unzip /tmp/galaksio.zip -d /tmp/galaksio \
    && mv /tmp/galaksio/*/* /usr/local/apache2/htdocs/ \
    && rm -r /tmp/galaksio/ \
    && rm /tmp/galaksio.zip \
    && sed -i 's/application\.launch/#application\.launch/' /usr/local/apache2/htdocs/server/launch_server.py \
    && sed -i 's/isDocker = False/isDocker = True/' /usr/local/apache2/htdocs/server/launch_server.py \
    && sed -i 's/8081/80/' /usr/local/apache2/htdocs/server/resources/example_serverconf.cfg

COPY configs/entrypoint.sh /usr/bin/entrypoint.sh
COPY configs/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY configs/galaksio.wsgi /usr/local/apache2/htdocs/galaksio.wsgi

RUN chmod +x /usr/bin/entrypoint.sh \
    && chown -R www-data:www-data /usr/local/apache2/htdocs/

##################### INSTALLATION END #####################

VOLUME ["/usr/local/apache2/htdocs/server/conf/"]

EXPOSE 80

ENTRYPOINT ["/usr/bin/entrypoint.sh"]
