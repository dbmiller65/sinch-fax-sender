# Phaxio Fax Sender

A simple web application that allows you to send faxes inexpensively using Phaxio's Fax API.

## Features

- Send faxes to any fax number worldwide
- Support for multiple document formats (PDF, TIFF, JPG, PNG)
- Simple, user-friendly interface
- Cost-effective faxing solution

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Phaxio account
- A Phaxio phone number with fax capabilities

## Installation

1. Clone this repository or download the source code
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from the example:

```bash
cp .env.example .env
```

4. Edit the `.env` file and add your Phaxio credentials:
   - `PHAXIO_API_KEY`: Your Phaxio API Key
   - `PHAXIO_API_SECRET`: Your Phaxio API Secret
   - `PHAXIO_FAX_NUMBER`: Your Phaxio phone number with fax capabilities

## Usage

1. Start the server:

```bash
npm start
```

2. Open your browser and navigate to `http://localhost:3000`
3. Fill out the form with:
   - The destination fax number (including country code)
   - The document you want to fax
4. Click "Send Fax" to send your fax

## Pricing

Phaxio's Fax API pricing (as of May 2025):
- Sending faxes: $0.07 per page
- Receiving faxes: $0.05 per page + $2.00 per month for the phone number

For the most current pricing, please check [Phaxio's pricing page](https://www.phaxio.com/pricing).

## Development

For development with auto-reload:

```bash
npm run dev
```

## License

MIT
