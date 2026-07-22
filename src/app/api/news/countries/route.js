import { NextResponse } from 'next/server';

const SUPPORTED_COUNTRIES = [
  { code: 'pk', name: 'Pakistan' },
  { code: 'in', name: 'India' },
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'ae', name: 'United Arab Emirates' }
];

export async function GET() {
  return NextResponse.json(SUPPORTED_COUNTRIES);
}
