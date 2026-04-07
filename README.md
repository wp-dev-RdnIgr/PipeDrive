# Pipedrive n8n Workflows

n8n workflows for fetching data from Pipedrive CRM.

## Workflows

### `n8n_flow/pipedrive_fetch_all.json`

Fetches all data from Pipedrive in a single run:
- **Deals** - all deals
- **Persons** - all contacts
- **Organizations** - all organizations
- **Activities** - all activities

Produces a summary JSON with counts and full data arrays.

## Setup

1. Ensure Pipedrive API credentials are configured in n8n as "WP_Pipedrive account"
2. Import `n8n_flow/pipedrive_fetch_all.json` into n8n (via UI or API)
3. Verify/re-select Pipedrive credentials on each Pipedrive node if needed
4. Run the workflow manually from n8n UI

## n8n Instance

- URL: https://n8n.rnd.webpromo.tools
