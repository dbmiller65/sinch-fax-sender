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

# List all recent faxes
echo "Listing recent faxes..."
FAXES_RESPONSE=$(curl -s "https://fax.api.sinch.com/v3/projects/$PROJECT_ID/faxes" \
  -u "$PHAXIOKEY:$PHAXIOSECRET")

echo "$FAXES_RESPONSE" | grep -E "id|to|status"

# Extract fax ID for the fax to cell phone
CELL_FAX_ID=$(echo "$FAXES_RESPONSE" | grep -B 2 -A 10 "18184348412" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$CELL_FAX_ID" ]; then
  echo ""
  echo "Found fax to cell phone with ID: $CELL_FAX_ID"
  echo ""
  
  # Cancel the specific fax
  echo "Canceling fax with ID: $CELL_FAX_ID"
  curl -v -X DELETE "https://fax.api.sinch.com/v3/projects/$PROJECT_ID/faxes/$CELL_FAX_ID" \
    -u "$PHAXIOKEY:$PHAXIOSECRET"
else
  echo ""
  echo "No fax to cell phone found in recent faxes"
fi

echo ""
echo "Done!"
