#!/bin/bash

# stop if we have some error
set -e

WORKSPACE=`pwd`
DEPENDENCIES="$WORKSPACE/dependencies"
REPOSITORY=/local/repository/rappidjs.com

rm -rf public-build
# git reset --hard HEAD
# git pull;

# npm install

echo "Dependencies: $DEPENDENCIES"

rm -rf $DEPENDENCIES
mkdir $DEPENDENCIES

cd $DEPENDENCIES

git clone git://github.com/rappid/rAppid.js.git
cd rAppid.js
git checkout dev

npm install --production

cd $DEPENDENCIES

git clone https://github.com/spreadshirt/rAppid.js-sprd.git
cd rAppid.js-sprd
git checkout dev

cd $DEPENDENCIES

git clone https://github.com/rappid/rappidjs-piwik.git

cd $WORKSPACE/public

ln -s $DEPENDENCIES/rAppid.js/js
ln -s $DEPENDENCIES/rAppid.js-sprd/sprd
ln -s $DEPENDENCIES/rappidjs-piwik/piwik

cd $WORKSPACE

RAPPIDJS="$DEPENDENCIES/rAppid.js/bin/rappidjs"
chmod +x $RAPPIDJS

VERSION="`$RAPPIDJS version`-$BUILD_NUMBER";

echo "VERSION: $VERSION"

$RAPPIDJS build --version $VERSION

cd public-build/$VERSION

$REPO=$REPOSITORY/$VERSION;

mkdir -p $REPO;
