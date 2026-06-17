#!/bin/bash
# Automation Dispatcher
# Routes automation requests to the appropriate platform

set -e

ISSUE_NUMBER="$1"
LABEL_NAME="$2"
REPOSITORY="$3"
GITHUB_TOKEN="$4"

# Platform detection from label
# Format: ready-to-implement:platform (e.g., ready-to-implement:openhands, ready-to-implement:claude)
detect_platform() {
    local label="$1"
    
    if [[ "$label" == ready-to-implement:* ]]; then
        # Extract platform from label (e.g., "ready-to-implement:openhands" -> "openhands")
        echo "$label" | cut -d':' -f2
    elif [[ "$label" == "ready-to-implement" || "$label" == "complex-logic" ]]; then
        # Default platform
        echo "${DEFAULT_PLATFORM:-openhands}"
    else
        echo "unknown"
    fi
}

# Main
main() {
    echo "=== Automation Dispatcher ==="
    echo "Issue: #$ISSUE_NUMBER"
    echo "Label: $LABEL_NAME"
    echo "Repository: $REPOSITORY"
    echo ""
    
    PLATFORM=$(detect_platform "$LABEL_NAME")
    echo "Detected platform: $PLATFORM"
    
    if [[ "$PLATFORM" == "unknown" ]]; then
        echo "::error::Unknown label: $LABEL_NAME"
        exit 1
    fi
    
    PLATFORM_SCRIPT=".automation/platforms/${PLATFORM}.sh"
    
    if [[ ! -f "$PLATFORM_SCRIPT" ]]; then
        echo "::error::Platform script not found: $PLATFORM_SCRIPT"
        echo "Available platforms:"
        ls -1 .automation/platforms/
        exit 1
    fi
    
    echo ""
    echo "=== Running $PLATFORM automation ==="
    bash "$PLATFORM_SCRIPT" "$ISSUE_NUMBER" "$LABEL_NAME" "$REPOSITORY" "$GITHUB_TOKEN"
    
    RESULT=$?
    
    if [[ $RESULT -eq 0 ]]; then
        echo ""
        echo "=== $PLATFORM automation completed successfully ==="
        exit 0
    else
        echo ""
        echo "::error::$PLATFORM automation failed with exit code $RESULT"
        exit $RESULT
    fi
}

main "$@"
