#! /bin/bash

GIT_DIR=$(git rev-parse --git-dir)

echo "Installing hooks..."
# this command creates symlink to our pre-commit script

PRE_COMMIT="$GIT_DIR/hooks/pre-commit"

if [[ ! -L "$PRE_COMMIT" ]]
then
    ln -s ../../githooks/pre-commit.sh $PRE_COMMIT
    echo "Done !"
else 
    echo "Hooks already Installed"
fi