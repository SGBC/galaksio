#!/bin/bash

# Apache gets grumpy about PID files pre-existing
rm -f /usr/local/apache2/logs/httpd.pid

#Fix problems with mounted volumes ownership
chown -R www-data:www-data /usr/local/apache2/htdocs/server/conf

#Launch apache
httpd -DFOREGROUND
