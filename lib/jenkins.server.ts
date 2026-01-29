import fetch from "node-fetch"

const BASE = process.env.JENKINS_BASE_URL!
const JOB  = process.env.JENKINS_JOB_NAME!
const AUTH = Buffer.from(
  `${process.env.JENKINS_USER}:${process.env.JENKINS_API_TOKEN}`
).toString("base64")

const headers = {
  Authorization: `Basic ${AUTH}`,
}

export async function triggerBuild(runDate: string) {
  const url = `${BASE}/job/${JOB}/buildWithParameters?RUN_DATE=${runDate}&RUN_USER=frontend`

  const res = await fetch(url, {
    method: "POST",
    headers,
  })

  if (!res.ok) {
    throw new Error("Trigger Jenkins failed")
  }
}

export async function getLastBuildNumber(): Promise<number> {
  const res = await fetch(`${BASE}/job/${JOB}/api/json`, { headers })
  const json = await res.json()
  return json.lastBuild.number
}

export async function getBuildStatus(build: number) {
  const res = await fetch(
    `${BASE}/job/${JOB}/${build}/api/json`,
    { headers }
  )
  return res.json()
}

export function artifactUrl(build: number, filename: string) {
  return `${BASE}/job/${JOB}/${build}/artifact/artifacts/${filename}`
}
