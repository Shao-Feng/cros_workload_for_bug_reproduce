#!/bin/bash

# Code from http://stackoverflow.com/questions/630372/determine-the-path-of-the-executing-bash-script
script_dir="`dirname \"$0\"`"              # relative
script_dir="`( cd \"$script_dir\" && pwd )`"  # absolutized and normalized
if [ -z "$script_dir" ] ; then
  # error; for some reason, the path is not accessible
  # to the script (e.g. permissions re-evaled after suid)
  exit 1  # fail
fi

third_party_dir="${script_dir}/third_party"

function install_apt_packages() {
	APT_PACKAGES=("nodejs" "npm"
	              "python" "python3-pytest" "python3-openssl" "python3-httplib2"
	              )

	echo "Installing apt packages: "
	echo "${APT_PACKAGES[*]}"
	echo ""
	sudo apt-get update
	sudo apt-get install ${APT_PACKAGES[*]}
}

function install_node_packages() {
	NPM_PACKAGES=("commander" "connect" "serve-static" "socket.io")
	echo ""
	echo "Installing node packages: "
	echo "${NPM_PACKAGES[*]}"
	echo ""
	cd $script_dir # npm install will setup a node_modules directory
	npm install ${NPM_PACKAGES[*]}
}


install_apt_packages
install_node_packages
