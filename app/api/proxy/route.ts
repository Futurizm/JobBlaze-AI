import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query parameters
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Make the request to the target API
    const response = await fetch(url, {
      headers: {
        "User-Agent": "JobBlaze/1.0 (jobblaze@example.com)",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `API request failed with status ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in proxy:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
