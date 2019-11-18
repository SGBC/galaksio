#!/bin/bash

DIR=$(dirname "$0")

function printHelp {
  echo "Usage run.sh --start | --stop | --restart"
  echo ""
}

function start_service {
  cd $DIR/..
  PYTHON=$(which python);
  $PYTHON -m server.launch_server &
  cd -
  disown %1; sleep 2
  pid=`ps -Af | grep 'launch_server.py' | grep -v "grep" | awk '{ print $2 }'`
  echo $pid > $DIR/launch_server.pid
  echo "Daemon started."
}

function stop_service {
  kill `cat $DIR/launch_server.pid`

  if [[ "$?" == "0" ]]; then
    rm $DIR/launch_server.pid
    echo "Success"
  else
    echo "Failed, daemon not stopped."
  fi
}

case "$1" in
  --start)
    start_service
  ;;
  --stop)
    stop_service
  ;;
  --restart)
     stop_service && sleep 2 && start_service
  ;;
  *)
    echo "Invalid option."
    printHelp
  ;;
esac
