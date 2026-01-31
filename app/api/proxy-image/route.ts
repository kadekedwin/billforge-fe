import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return new NextResponse("URL parameter is required", { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return new NextResponse(`Failed to fetch image: ${response.statusText}`, {
                status: response.status,
            });
        }

        const contentType = response.headers.get("content-type") || "application/octet-stream";
        const blob = await response.blob();

        return new NextResponse(blob, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
