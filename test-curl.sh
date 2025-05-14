#!/bin/bash

# Load environment variables from .env file
source <(grep -v '^#' .env | sed -E 's/(.*)=(.*)$/export \1="\2"/g')

# Create a simple test PDF
echo "This is a test fax from Phaxio" > test.txt
echo "Sent at $(date)" >> test.txt

# Display the credentials being used (safely)
echo "Using Sinch Fax API credentials:"
echo "API Key: ${PHAXIOKEY:0:4}...${PHAXIOKEY: -4}"
echo "API Secret: ${PHAXIOSECRET:0:4}...${PHAXIOSECRET: -4}"
echo "Fax Number: $PHAXIO_FAX_NUMBER"
echo ""

# Send a test fax using curl with verbose output
echo "Sending test fax..."
curl -v -X POST https://fax.api.sinch.com/faxes \
  -u "$PHAXIOKEY:$PHAXIOSECRET" \
  -F "to=+18184348412" \
  -F "content=This is a test fax sent using curl" \
  -F "header_text=Test Fax"

echo ""
echo "Done!"
