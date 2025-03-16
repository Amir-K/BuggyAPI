import { NextRequest, NextResponse } from "next/server";

interface InvoiceRequest {
  invoiceNumber: string;
  totalAmount: number;
  currencyCode: string;
  timestamp: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: InvoiceRequest = await req.json();

    // Silent failure: If timestamp includes milliseconds, ignore request without an error response
    if (body.timestamp.includes(".")) {
      return new NextResponse(null, { status: 200 }); // Returns 200 but does not process request
    }

    return new NextResponse(
      JSON.stringify({ message: "Invoice received successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }
}
