import { NextResponse } from "next/server"

const auth = Buffer.from(
  `${process.env.JENKINS_USER}:${process.env.JENKINS_TOKEN}`
).toString("base64")

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const build = searchParams.get("build")

  const url = `${process.env.JENKINS_URL}/job/${process.env.JENKINS_JOB}/${build}/api/json`
  const r = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
  })

  const data = await r.json()

  return NextResponse.json({
    building: data.building,
    result: data.result, // SUCCESS / FAILURE
  })
}
