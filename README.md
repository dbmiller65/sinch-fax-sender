# Sinch Fax Sender

A modern web application that allows you to send faxes inexpensively using Sinch's Fax API (formerly Phaxio).

## Features

- Send faxes to any US fax number
- Automatic phone number formatting as (XXX) XXX-XXXX
- Support for multiple document formats (PDF, TIFF, JPG, PNG)
- Fax history page to track the status of all sent faxes
- Detailed error reporting and status tracking
- Simple, user-friendly interface
- Cost-effective faxing solution

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Sinch account with Fax API access
- Sinch Project ID

## Installation

1. Clone this repository or download the source code
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Sinch API credentials:

```
PHAXIOKEY=your_sinch_api_key
PHAXIOSECRET=your_sinch_api_secret
PROJECT_ID=your_sinch_project_id
```

   Note: The variable names still use "PHAXIO" for backward compatibility, but they store Sinch credentials.

## Usage

1. Start the server:

```bash
npm start
```

2. Open your browser and navigate to `http://localhost:3000`

### Sending a Fax

1. Enter the recipient's fax number in the format (XXX) XXX-XXXX
2. Type text content or upload a document (PDF, TIFF, JPG, PNG)
3. Click "Send Fax"
4. View the status of your fax in the results area

### Viewing Fax History

1. Click on the "Fax History" link in the navigation bar
2. View a list of all faxes sent, with their status and details
3. Click "View Details" on any fax to see more information

## Pricing

Sinch's Fax API pricing (as of May 2025):
- Sending faxes: Starting at $0.07 per page
- Receiving faxes: Starting at $0.05 per page + $2.00 per month for the phone number

For the most current pricing, please check [Sinch's Fax API page](https://www.sinch.com/products/fax/).

## Development

For development with auto-reload:

```bash
npm run dev
```

## API Integration

This application uses the Sinch Fax API v3. The integration includes:

- Basic Authentication with API key and secret
- Endpoint: `https://fax.api.sinch.com/v3/projects/{projectId}/faxes`
- Multipart/form-data for file uploads
- Parameter naming: `headerText` instead of `header_text`
- Comprehensive error handling and status tracking

## License

MIT
