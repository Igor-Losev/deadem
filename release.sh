set -e

if [ -z "$1" ]; then
  echo "Must have a version argument"
  exit 1
fi

VERSION=$1

npm version $VERSION --workspaces
npm version $VERSION --no-git-tag-version

git add ./package.json ./package-lock.json ./packages/**/package.json

git commit -m "$VERSION"

git tag v$VERSION -s

