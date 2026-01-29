import { NextRequest } from "next/server"

function basicAuthHeader() {
  const user = process.env.JENKINS_USER
  const token = process.env.JENKINS_TOKEN
  if (!user || !token) throw new Error("Missing Jenkins credentials env")

  const auth = Buffer.from(`${user}:${token}`).toString("base64")
  return { Authorization: `Basic ${auth}` }
}

function env(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v.replace(/\/$/, "")
}

// helper: yyyy-mm-dd_hh-mm
function formatNow() {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, "0")

  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_` +
    `${pad(d.getHours())}-${pad(d.getMinutes())}`
  )
}

export async function GET(req: NextRequest) {
  const build = req.nextUrl.searchParams.get("build")
  if (!build) return new Response("Missing build", { status: 400 })

  const JENKINS_URL = env("JENKINS_URL")
  const JENKINS_JOB = env("JENKINS_JOB")

  // 1️⃣ read build metadata
  const metaUrl = `${JENKINS_URL}/job/${encodeURIComponent(
    JENKINS_JOB
  )}/${build}/api/json`

  const metaRes = await fetch(metaUrl, {
    headers: basicAuthHeader(),
  })

  if (!metaRes.ok) {
    const text = await metaRes.text()
    return new Response(
      `Jenkins meta fetch failed: ${metaRes.status} ${text}`,
      { status: 502 }
    )
  }

  const meta = await metaRes.json()

  const artifacts: Array<{
    fileName: string
    relativePath: string
  }> = meta.artifacts || []

  const xlsx = artifacts.find((a) =>
    a.fileName.toLowerCase().endsWith(".xlsx")
  )

  if (!xlsx) {
    return new Response("No .xlsx artifact found in this build", {
      status: 404,
    })
  }

  // 2️⃣ build artifact URL (NO wildcard)
  const fileUrl = `${JENKINS_URL}/job/${encodeURIComponent(
    JENKINS_JOB
  )}/${build}/artifact/${xlsx.relativePath}`

  const fileRes = await fetch(fileUrl, {
    headers: basicAuthHeader(),
  })

  if (!fileRes.ok || !fileRes.body) {
    const text = await fileRes.text().catch(() => "")
    return new Response(
      `Artifact download failed: ${fileRes.status} ${text}`,
      { status: 502 }
    )
  }

  // 3️⃣ rename file for user
  const timestamp = formatNow()
  const downloadName = `gps_lost_report_${timestamp}.xlsx`

  return new Response(fileRes.body, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
      "Cache-Control": "no-store",
    },
  })
}
