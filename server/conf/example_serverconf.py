#SERVER SETTINGS
SERVER_HOST_NAME          = "0.0.0.0" #THE IP ADDRESS FOR GALAKSIO, LEAVE 0.0.0.0 FOR LISTENING ALL REQUESTS
SERVER_PORT_NUMBER        = 8081      #THE PORT NUMBER THAT GALAKSIO LISTENS FOR REQUESTS
SERVER_ALLOW_DEBUG        = False     #ENABLE DEBUG, THIS OPTIOS IS JUST FOR DEVELOPMENT
SERVER_SUBDOMAIN          = ""        #USE THIS OPTION IF GALAKSIO RUNS UNDER AN SPECIFIC SUBDOMAIN, E.G. myserver.com/galaksio (w/o proxy)
SERVER_MAX_CONTENT_LENGTH = 20        #THE MAX SIZE FOR THE REQUESTS SENT BY THE CLIENTS, IN MB
ADMIN_ACCOUNTS            = "myadmin@account.com" #ACCOUNTS THAT HAVE ADMINISTRATION RIGHTS, SEPARATED BY COMMAS

#FILES SETTINGS
ROOT_DIRECTORY            = "" #THE LOCATION FOR THE GALAKSIO FILES, LEAVE BLANK TO AUTO DETECT

#GALAXY SETTINGS
GALAXY_SERVER             =  "https://usegalaxy.org" #THE URL FOR THE GALAXY INSTANCE THAT WILL RECEIVE ALL THE GALAKSIO REQUESTS

#SMTP CONFIGURATION
smtp_host                 = "smtp.gmail.com"           #Sets Gmail, Office... as the SMTP server
smtp_port                 = 465                        #Set the SMTP port for the GMAIL
use_smtp_auth             = True                       #Enable SMTP authentication
use_smtp_ssl              = True                       #Whether use normal SMTP or SMTP_SSL
smtp_secure               = ""                         #Use tls, etc.
smpt_username             = "notifications@mydomain.com"  #THE SENDER EMAIL, DEPENDS ON THE SMTP SETTINGS
smpt_pass                 = "09bf93aae4166cd12775c2592a1c613c" #THE SENDER PASS IN MD5 CODIFICATION, DEPENDS ON THE SMTP SETTINGS
smpt_sender               = "notifications@mydomain.com"       #Sender email (From value at the email)
smpt_sender_name          = "B3Galaxy"             #Sender name (From value at the email)
