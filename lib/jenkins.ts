// lib/jenkins.ts

export async function triggerGpsLostReport(runDate: string) {
  const r = await fetch("/api/jenkins/trigger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ runDate }),
  })

  if (!r.ok) {
    throw new Error("Failed to trigger Jenkins")
  }

  return r.json() // { queueId }
}

export async function pollQueue(queueId: string) {
  const r = await fetch(`/api/jenkins/queue?queueId=${queueId}`)
  if (!r.ok) throw new Error("Queue polling failed")
  return r.json() // { status, buildNumber? }
}

export async function pollBuild(build: number) {
  const r = await fetch(`/api/jenkins/status?build=${build}`)
  if (!r.ok) throw new Error("Build polling failed")
  return r.json() // { building, result }
}
