// lib/jenkins.server.ts
import "server-only"

const BASE = process.env.JENKINS_BASE_URL!
const JOB  = process.env.JENKINS_JOB_NAME!
const USER = process.env.JENKINS_USER!
const TOKEN = process.env.JENKINS_TOKEN!

if (!BASE || !JOB || !USER || !TOKEN) {
  throw new Error("❌ Missing Jenkins env config")
}

function authHeader() {
  const auth = Buffer.from(`${USER}:${TOKEN}`).toString("base64")
  return {
    Authorization: `Basic ${auth}`,
  }
}

/**
 * Trigger Jenkins job
 */
export async function triggerJob(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString()

  const url = `${BASE}/job/${JOB}/buildWithParameters?${query}`

  const res = await fetch(url, {
    method: "POST",
    headers: authHeader(),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Trigger failed ${res.status}`)
  }

  // Jenkins queue id is in Location header
  const location = res.headers.get("location")
  if (!location) {
    throw new Error("Missing Jenkins queue location")
  }

  const queueId = location.split("/").filter(Boolean).pop()
  return { queueId }
}

/**
 * Poll queue → build number
 */
export async function getQueue(queueId: string) {
  const res = await fetch(
    `${BASE}/queue/item/${queueId}/api/json`,
    {
      headers: authHeader(),
      cache: "no-store",
    }
  )

  if (!res.ok) {
    throw new Error("Queue fetch failed")
  }

  return res.json()
}

/**
 * Poll build status
 */
export async function getBuild(build: number) {
  const res = await fetch(
    `${BASE}/job/${JOB}/${build}/api/json`,
    {
      headers: authHeader(),
      cache: "no-store",
    }
  )

  if (!res.ok) {
    throw new Error("Build fetch failed")
  }

  return res.json()
}
