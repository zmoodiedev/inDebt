import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// Sheet names (tabs in the spreadsheet)
const SHEETS = {
  DEBTS: 'Debts',
  BILLS: 'Bills',
  SAVINGS: 'Savings',
  INCOME: 'Income',
  TRANSACTIONS: 'Transactions',
} as const;

// Column headers for each sheet
const HEADERS = {
  [SHEETS.DEBTS]: ['id', 'name', 'totalAmount', 'currentBalance', 'interestRate', 'minimumPayment', 'dueDate', 'category', 'currency', 'createdAt', 'updatedAt'],
  [SHEETS.BILLS]: ['id', 'name', 'amount', 'dueDate', 'category', 'isRecurring', 'frequency', 'isPaid', 'lastPaidDate', 'currency', 'createdAt', 'updatedAt'],
  [SHEETS.SAVINGS]: ['id', 'name', 'targetAmount', 'currentAmount', 'deadline', 'category', 'color', 'createdAt', 'updatedAt'],
  [SHEETS.INCOME]: ['id', 'amount', 'source', 'date', 'notes', 'currency', 'createdAt', 'updatedAt'],
  [SHEETS.TRANSACTIONS]: ['id', 'amount', 'category', 'description', 'date', 'currency', 'createdAt', 'updatedAt'],
};

/**
 * Get authenticated Google Sheets client
 */
function getGoogleSheetsClient() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error('Missing GOOGLE_SPREADSHEET_ID environment variable.');
  }

  // Try to read credentials from file first
  const credentialsPath = path.resolve('./credentials.json');
  let credentials;

  if (fs.existsSync(credentialsPath)) {
    const fileContent = fs.readFileSync(credentialsPath, 'utf-8');
    credentials = JSON.parse(fileContent);
  } else if (process.env.GOOGLE_CREDENTIALS) {
    // Support both raw JSON and base64-encoded JSON
    let jsonString = process.env.GOOGLE_CREDENTIALS;

    // Check if it's base64 encoded (doesn't start with '{')
    if (!jsonString.trim().startsWith('{')) {
      jsonString = Buffer.from(jsonString, 'base64').toString('utf-8');
    }

    credentials = JSON.parse(jsonString);

    // Fix private key newlines that may get corrupted in environment variables
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
  } else {
    throw new Error('Missing Google credentials. Either place credentials.json in project root or set GOOGLE_CREDENTIALS environment variable.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  return { sheets, spreadsheetId };
}

/**
 * Ensure a sheet exists with correct headers
 */
async function ensureSheet(sheetName: string): Promise<void> {
  const { sheets, spreadsheetId } = getGoogleSheetsClient();

  try {
    // Get spreadsheet metadata
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) || [];

    const expectedHeaders = HEADERS[sheetName as keyof typeof HEADERS];

    // Create sheet if it doesn't exist
    if (!existingSheets.includes(sheetName)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: { title: sheetName }
            }
          }]
        }
      });

      // Add headers
      if (expectedHeaders) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [expectedHeaders]
          }
        });
      }
    } else if (expectedHeaders) {
      // Sheet exists - check if headers match and update if needed
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!1:1`,
      });
      const currentHeaders = response.data.values?.[0] || [];

      // Check if headers match
      const headersMatch = expectedHeaders.length === currentHeaders.length &&
        expectedHeaders.every((h, i) => h === currentHeaders[i]);

      if (!headersMatch) {
        // Update headers to match expected
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [expectedHeaders]
          }
        });
      }
    }
  } catch (error) {
    console.error(`Error ensuring sheet ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Read all rows from a sheet
 */
export async function readSheet<T>(sheetName: string): Promise<T[]> {
  const { sheets, spreadsheetId } = getGoogleSheetsClient();

  try {
    await ensureSheet(sheetName);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return [];
    }

    // Use the code's HEADERS constant for consistency with writeSheet
    // This ensures we read from the correct column positions
    const headers = HEADERS[sheetName as keyof typeof HEADERS] || rows[0];
    const data = rows.slice(1).map(row => {
      const obj: Record<string, unknown> = {};
      headers.forEach((header: string, index: number) => {
        let value: unknown = row[index] ?? '';

        // Parse numbers
        if (['totalAmount', 'currentBalance', 'interestRate', 'minimumPayment', 'amount', 'targetAmount', 'currentAmount', 'dueDate'].includes(header)) {
          value = parseFloat(value as string) || 0;
        }
        // Parse booleans
        if (['isRecurring', 'isPaid'].includes(header)) {
          value = value === 'true' || value === true;
        }

        obj[header] = value;
      });
      return obj as T;
    });

    return data;
  } catch (error) {
    console.error(`Error reading sheet ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Write all rows to a sheet (replaces existing data)
 */
export async function writeSheet<T extends Record<string, unknown>>(sheetName: string, data: T[]): Promise<void> {
  const { sheets, spreadsheetId } = getGoogleSheetsClient();

  try {
    await ensureSheet(sheetName);

    const headers = HEADERS[sheetName as keyof typeof HEADERS];
    if (!headers) {
      throw new Error(`Unknown sheet: ${sheetName}`);
    }

    // Convert objects to rows
    const rows = data.map(item =>
      headers.map(header => {
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value.toString();
        if (value instanceof Date) return value.toISOString();
        return String(value);
      })
    );

    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A2:Z`,
    });

    if (rows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A2`,
        valueInputOption: 'RAW',
        requestBody: {
          values: rows
        }
      });
    }
  } catch (error) {
    console.error(`Error writing sheet ${sheetName}:`, error);
    throw error;
  }
}

// Typed functions for each data type
export const googleSheetsStorage = {
  // Debts
  getDebts: () => readSheet(SHEETS.DEBTS),
  saveDebts: <T extends Record<string, unknown>>(debts: T[]) => writeSheet(SHEETS.DEBTS, debts),

  // Bills
  getBills: () => readSheet(SHEETS.BILLS),
  saveBills: <T extends Record<string, unknown>>(bills: T[]) => writeSheet(SHEETS.BILLS, bills),

  // Savings
  getSavings: () => readSheet(SHEETS.SAVINGS),
  saveSavings: <T extends Record<string, unknown>>(savings: T[]) => writeSheet(SHEETS.SAVINGS, savings),

  // Income
  getIncome: () => readSheet(SHEETS.INCOME),
  saveIncome: <T extends Record<string, unknown>>(income: T[]) => writeSheet(SHEETS.INCOME, income),

  // Transactions
  getTransactions: () => readSheet(SHEETS.TRANSACTIONS),
  saveTransactions: <T extends Record<string, unknown>>(transactions: T[]) => writeSheet(SHEETS.TRANSACTIONS, transactions),
};
