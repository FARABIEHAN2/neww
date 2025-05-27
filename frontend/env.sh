#!/bin/sh

# Replace environment variables in built React app
# This allows dynamic environment variable injection at runtime

for file in /usr/share/nginx/html/static/js/*.js
do
  if [ -f "$file" ]; then
    # Replace environment variables in JS files
    envsubst '${REACT_APP_BACKEND_URL}' < "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
done

# Also replace in index.html if needed
if [ -f "/usr/share/nginx/html/index.html" ]; then
    envsubst '${REACT_APP_BACKEND_URL}' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp && mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html
fi