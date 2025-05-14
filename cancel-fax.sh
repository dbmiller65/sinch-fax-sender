#!/bin/bash

# Set API credentials directly
PHAXIOKEY="e7e2ce04-7fc8-4e02-9d28-2b5ba7fd0aa1"
PHAXIOSECRET="9GuWMgNWMQRV0WyUtIM~rXMskz"

# Project ID
PROJECT_ID="7850c42f-597c-40cc-9567-8bad3ac7d58f"

# Display the credentials being used (safely)
echo "Using Sinch Fax API credentials:"
echo "API Key: ${PHAXIOKEY:0:4}...${PHAXIOKEY: -4}"
echo "API Secret: ${PHAXIOSECRET:0:4}...${PHAXIOSECRET: -4}"
echo "Project ID: $PROJECT_ID"
echo ""

# Cancel the fax using the Sinch API
echo "Canceling fax to cell phone number..."
curl -v -X DELETE "https://fax.api.sinch.com/v3/projects/$PROJECT_ID/faxes/outbound/+18184348412" \
  -u "$PHAXIOKEY:$PHAXIOSECRET"

echo ""
echo "Done!"
