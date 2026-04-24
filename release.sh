#!/usr/bin/env sh
set -eu

usage() {
    cat <<'EOF'
Usage:
  ./release.sh build
  ./release.sh add
  ./release.sh bump [tag]
  ./release.sh publish
EOF
}

require_clean_git_status() {
    if [ -n "$(git status --porcelain --untracked-files=all)" ]; then
        echo "Git worktree is not clean" >&2
        git status --short >&2
        exit 1
    fi
}

get_version() {
    node -p "JSON.parse(require('fs').readFileSync('./packages/deadem/package.json', 'utf8')).version"
}

has_pre_state() {
    [ -f ./.changeset/pre.json ]
}

get_pre_mode() {
    node -p "JSON.parse(require('fs').readFileSync('./.changeset/pre.json', 'utf8')).mode"
}

build() {
    npm run proto:json
    npm run build
}

refresh_lockfiles() {
    npm install --package-lock-only
}

add() {
    require_clean_git_status

    npx changeset add
}

bump() {
    PRE_TAG="${1:-}"

    if [ -n "$PRE_TAG" ]; then
        echo 123
    elif has_pre_state && [ "$(get_pre_mode)" = "pre" ]; then
        npx changeset pre exit
    fi

    npx changeset version
    refresh_lockfiles

    VERSION="$(get_version)"
    TAG="v$VERSION"

    if git rev-parse "$TAG" >/dev/null 2>&1; then
        echo "Git tag already exists: $TAG" >&2
        exit 1
    fi

    git add .
    git commit -m "$VERSION"
    git tag "$TAG"
}

publish() {
    npx changeset publish --no-git-tag
}

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
    usage
    exit 1
fi

case "$1" in
    build)
        build
        ;;
    add)
        add
        ;;
    bump)
        bump "${2:-}"
        ;;
    publish)
        publish
        ;;
    *)
        usage
        exit 1
        ;;
esac
