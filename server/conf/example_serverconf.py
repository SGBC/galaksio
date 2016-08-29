#SERVER SETTINGS
SERVER_HOST_NAME          = "0.0.0.0"
SERVER_PORT_NUMBER        = 8081
SERVER_ALLOW_DEBUG        = False
SERVER_SUBDOMAIN          = ""
SERVER_MAX_CONTENT_LENGTH = 200 * pow(1024,2) #MAX_CLIENT_SPACE IN MB

#FILES SETTINGS
ROOT_DIRECTORY       = "/datadev/b3g/"
CLIENT_TMP_DIR       = "/tmp/"

#GALAXY SETTINGS
GALAXY_SERVER        =  "https://usegalaxy.org"
GALAXY_SUBDOMAIN     =  ""

#SMTP CONFIGURATION
smtp_host       = "smtp.gmail.com"           #Sets Gmail, Office... as the SMTP server
smtp_port       = 465                        #Set the SMTP port for the GMAIL
use_smtp_auth   = True                       #Enable SMTP authentication
use_smtp_ssl    = True                       #Whether use normal SMTP or SMTP_SSL
smtp_secure     = ""                         #Use tls, etc.
smpt_username   = "notifications@mydomain.com"  #THE SENDER EMAIL, DEPENDS ON THE SMTP SETTINGS
smpt_pass       = "09bf93aae4166cd12775c2592a1c613c" #THE SENDER PASS IN MD5 CODIFICATION, DEPENDS ON THE SMTP SETTINGS
smpt_sender     = "notifications@mydomain.com"       #Sender email (From value at the email)
smpt_sender_name= "B3Galaxy"             #Sender name (From value at the email)
