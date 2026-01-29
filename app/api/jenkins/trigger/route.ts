import { NextResponse } from "next/server"

const auth = Buffer.from(
  `${process.env.JENKINS_USER}:${process.env.JENKINS_TOKEN}`
).toString("base64")

export async function POST(req: Request) {
  const { runDate } = await req.json()

  const url = `${process.env.JENKINS_URL}/job/${process.env.JENKINS_JOB}/buildWithParameters`

  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      RUN_DATE: runDate ?? "",
      RUN_USER: "frontend",
    }),
  })

  if (!r.ok) {
    return NextResponse.json(
      { error: "Failed to trigger Jenkins" },
      { status: 500 }
    )
  }

  // Jenkins ส่ง queue id ใน header
  const queueUrl = r.headers.get("location")
  const queueId = queueUrl?.split("/").filter(Boolean).pop()

  return NextResponse.json({ queueId })
}
