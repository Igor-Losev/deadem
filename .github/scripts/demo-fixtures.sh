#!/usr/bin/env bash

set -euo pipefail

usage() {
    echo "Usage: $0 <cache-key|ensure|matches>" >&2
    exit 1
}

require_env() {
    local name="$1"

    if [[ -z "${!name:-}" ]]; then
        echo "Missing required env var: $name" >&2
        exit 1
    fi
}

load_demo_files() {
    DEMO_FILE_LIST=()

    while IFS= read -r file; do
        [[ -n "$file" ]] || continue
        DEMO_FILE_LIST+=("$file")
    done <<< "${DEMO_FILES}"
}

print_cache_key() {
    printf '%s' "$DEMO_FILES" | sha256sum | cut -c1-16
}

ensure_demo_fixtures() {
    local file target

    load_demo_files
    mkdir -p "$DEMO_DIR"

    for file in "${DEMO_FILE_LIST[@]}"; do
        target="$DEMO_DIR/$file.dem"

        if [[ -f "$target" ]]; then
            echo "Using cached $file.dem"
            continue
        fi

        echo "Downloading $file.dem"
        curl --fail --silent --show-error --location \
            --output "$target" \
            "$DEMO_S3_PREFIX/$file.dem"
    done
}

print_matches() {
    load_demo_files

    local IFS=' '
    printf '%s\n' "${DEMO_FILE_LIST[*]}"
}

main() {
    local command="${1:-}"

    [[ -n "$command" ]] || usage

    require_env DEMO_FILES

    case "$command" in
        cache-key)
            print_cache_key
            ;;
        ensure)
            require_env DEMO_DIR
            require_env DEMO_S3_PREFIX
            ensure_demo_fixtures
            ;;
        matches)
            print_matches
            ;;
        *)
            usage
            ;;
    esac
}

main "$@"
