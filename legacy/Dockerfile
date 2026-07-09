# Use official nginx:alpine image as base
FROM nginx:alpine

# Copy all files from current directory to nginx html directory
COPY ./ /usr/share/nginx/html/

# Expose port 80 for the web server
EXPOSE 80

# Optional: Set working directory
WORKDIR /usr/share/nginx/html/