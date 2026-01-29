import { NextResponse } from "next/server"

const auth = Buffer.from(
  `${process.env.JENKINS_USER}:${process.env.JENKINS_TOKEN}`
).toString("base64")

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const queueId = searchParams.get("queueId")

  const url = `${process.env.JENKINS_URL}/queue/item/${queueId}/api/json`
  const r = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
  })

  const data = await r.json()

  if (!data.executable) {
    return NextResponse.json({ status: "PENDING" })
  }

  return NextResponse.json({
    status: "STARTED",
    buildNumber: data.executable.number,
  })
}
