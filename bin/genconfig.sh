#!/bin/bash

# Recursive loop through files starting from project root
function deep_list() {
  for e in $1/*; do
    if [ -f $e ] && [[ $e == *$2 ]]; then
      for i in $(grep -o "get('/[a-z:/]*\|post('/[a-z:/]*\|delete('/[a-z:/]*\|update('/[a-z:/]*" $e); do
        m=$(echo $i | grep -o "get\|post\|delete\|update")
        p=$(echo $i | grep -o "/[a-z:/]*")
        echo '  {' >> $genpath
        echo '    "path": "'$p'",' >> $genpath
        echo '    "method": "'$m'"' >> $genpath
        echo '  },' >> $genpath
      done
    elif [ -d $e ]; then
      deep_list $e
    fi
  done
}

# Launch function
function launch() {

  genpath=$PWD"/test/config.json"
  rm $genpath
  touch $genpath

  # Init json config
  echo '{' >> $genpath >> $genpath
  echo ' "baseUrl": "'$1'",' >> $genpath
  echo ' "rejectCodes": [500, 404, 403, 402, 401, 400],' >> $genpath
  echo ' "login": {' >> $genpath
  echo '   "path": "'$2'",' >> $genpath
  echo '   "username": "'$3'",' >> $genpath
  echo '   "pass": "'$4'"' >> $genpath
  echo '  },' >> $genpath
  echo ' "cases": [' >> $genpath
  deep_list $PWD$5 $6
  echo '{}]' >> $genpath
  echo '}' >> $genpath
  $(echo $json | sed -e "s/,]/]/g") >> $genpath
}

# Asking for config file data
read -p "Enter your application base url (e.g.:http://127.0.0.1:3000): " burl
read -p "Enter your login route path (e.g.:/login): " lpath
read -p "Enter your login username: " user
read -p "Enter your login password: " pass
read -p "Enter your src folder path (e.g.:/src): " src
read -p "Enter your route files name pattern (e.g.:routing.js): " route
launch $burl $lpath $user $pass $src $route
