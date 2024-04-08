set -e

inner() {
    set -e  # Exit the function if any command fails
    false
    echo "2"  # This line will not be executed if false fails
}

if gum confirm "Prompt A"; then
    echo "1"
    if ! inner; then
        echo "Bye"
    else
        echo "Hi"
    fi
else
    echo "4"
fi