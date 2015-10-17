#!/bin/bash
unset DIR
unset DIR_CSV
unset NEO4J_SYM
unset NEO4J_BIN
unset NEO4J_BINDIR
unset NEO4J_PARENT
unset NEO4J_HOME
unset NEO4J_DB
unset NEO4J_SHELL

# TODO: Make portable (see: version of neo4j in db home path)
#export NEO4J_HOME=/usr/local/Cellar/neo4j/2.2.5/libexec

# Define path of this script
DIR=$( cd "$( dirname "$0" )" && pwd )

# Define path to backup directory
DIR_BKP=$DIR/backup

# Define path to seed CSV files
DIR_CSV=$DIR/csv

# Resolve real binary path from symlinks of installed neo4j instance
source $DIR/realpath.sh

if NEO4J_SYM=$(which neo4j); then
	echo "A neo4j instance was found on this system."
	NEO4J_BIN=$(realpath ${NEO4J_SYM})
	NEO4J_BINDIR=$(dirname ${NEO4J_BIN})
	NEO4J_PARENT="${NEO4J_BINDIR}/.."
	NEO4J_HOME=$(realpath ${NEO4J_PARENT})
else
	echo "Error: Failed to find an instance of neo4j on this system."
	exit $?;
fi

if [ -d ${NEO4J_HOME} ]; then
    echo "Neo4j home directory resolved to an actual directory.";
else
	echo "Error: Failed to resolve neo4j home directory."
	exit 1;
fi

# DEFINE PATH OF NEO4J DATABASE
NEO4J_DB=$NEO4J_HOME/data/graph.db

# Define path to neo4j-shell binary
NEO4J_SHELL=$NEO4J_HOME/bin/neo4j-shell

echo "NEO4J_SYM: ${NEO4J_SYM}"
echo "NEO4J_BIN: ${NEO4J_BIN}"
echo "NEO4J_BINDIR: ${NEO4J_BINDIR}"
echo "NEO4J_PARENT: ${NEO4J_PARENT}"
echo "NEO4J_HOME: ${NEO4J_HOME}";
echo "NEO4J_DB: '${NEO4J_DB}'"
echo "NEO4J_SHELL: '${NEO4J_SHELL}'"

# ==============================================================================
# 2: Backup Neo4J Database
# ==============================================================================
echo "Creating backup of Neo4J DB (just in case!)"
BKP_DEST="${DIR_BKP}/graph.db.bkp.$(date +%F_%T)"
BACKUP="cp -R ${NEO4J_DB} ${BKP_DEST}"
if $BACKUP; then
	echo "Neo4j DB backup \"${BKP_DEST}\" created successfully.";
else
	echo "Error: Failed to create Neo4j DB backup."
	exit $?;
fi

# Clean up backup directory by removing all but 10 most recent backups
#BKP_CLEAN="find ${DIR_BKP} -maxdepth 1 -type d -name 'graph.db.bkp*' | ls -C1t | awk 'NR>10' | while read d ; do rm -rvf \$d ; done"
# BKP_CLEAN="find ${DIR_BKP} -type d -maxdepth 1 -name 'graph.db.bkp*' | sort -r | awk 'NR<=10' | while read d ; do echo \$d ; done"
# echo "BKP_CLEAN = $(${BKP_CLEAN})"
# if $(${BKP_CLEAN}); then
# 	echo "Neo4j DB backup directory successfully cleaned.";
# else
# 	echo "Error: Failed to clean Neo4j DB backup directory."
# 	exit $?;
# fi

# ==============================================================================
# 2: Annhiliate Neo4J Database
# ==============================================================================
echo "Annhiliating Neo4J DB for Seed Data"

# Stop the database
STOP_DB="${NEO4J_BIN} stop"
if $STOP_DB; then
	echo "Neo4j database stopped successfully.";
else
	echo "Error: Failed to stop Neo4j database."
	exit $?;
fi

# Remove database files
REMOVE_DB="rm -rf ${NEO4J_DB}"
if $REMOVE_DB; then
	echo "Neo4j database removed successfully.";
else
	echo "Error: Failed to remove Neo4j database."
	exit $?;
fi

# Start a fresh database
START_DB="$NEO4J_BIN start"
if $START_DB; then
	echo "Neo4j database started successfully.";
else
	echo "Error: Failed to start Neo4j database."
	exit $?;
fi

# ==============================================================================
# 3: Seed the Neo4J Database
# ==============================================================================
CQL_TEMPLATE="${DIR}/neo4j_init.cqltmp"
CQL_SCRIPT="${DIR}/neo4j_init.cql"
CQL_SED="sed -e s,CSV_PATH,${DIR_CSV},g ${CQL_TEMPLATE}"

if $CQL_SED > $CQL_SCRIPT; then
	${NEO4J_SHELL} -c < ${CQL_SCRIPT}
	if [ $? -eq 0 ]; then
		echo "CQL script successfully run."
	else
		echo "Error: Failed to run CQL script."
		exit $?;
	fi
else
	echo "Error: Failed to create CQL seed script."
    exit $?;
fi

# npm install 
