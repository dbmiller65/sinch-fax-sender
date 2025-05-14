#!/bin/bash

# Set API credentials directly
PHAXIOKEY="e7e2ce04-7fc8-4e02-9d28-2b5ba7fd0aa1"
PHAXIOSECRET="9GuWMgNWMQRV0WyUtIM~rXMskz"
PHAXIO_FAX_NUMBER="+14842765563"

# Create a simple test file
echo "This is a test fax from Sinch API" > test.txt

# Project ID
PROJECT_ID="7850c42f-597c-40cc-9567-8bad3ac7d58f"

# Display the credentials being used (safely)
echo "Using Sinch Fax API credentials:"
echo "API Key: ${PHAXIOKEY:0:4}...${PHAXIOKEY: -4}"
echo "API Secret: ${PHAXIOSECRET:0:4}...${PHAXIOSECRET: -4}"
echo "Fax Number: $PHAXIO_FAX_NUMBER"
echo "Project ID: $PROJECT_ID"
echo ""

# Send a test fax using curl with verbose output
echo "Sending test fax..."
curl -v -X POST "https://fax.api.sinch.com/v3/projects/$PROJECT_ID/faxes" \
  -u "$PHAXIOKEY:$PHAXIOSECRET" \
  -F "to=+18184348412" \
  -F "file=@test.txt" \
  -F "headerText=Test Fax"

echo ""
echo "Done!"
