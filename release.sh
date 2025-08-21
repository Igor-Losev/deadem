set -e

if [ -z "$1" ]; then
  echo "Must have a version argument"
  exit 1
fi

VERSION_OR_TYPE=$1

npm version $VERSION_OR_TYPE --workspaces
npm version $VERSION_OR_TYPE --no-git-tag-version

VERSION=$(node -p "require('./package.json').version")

git add ./package.json ./package-lock.json ./packages/**/package.json

git commit -m "$VERSION"

git tag v$VERSION -s -m "$VERSION"

