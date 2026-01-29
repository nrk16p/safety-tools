"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

import {
  triggerGpsLostReport,
  pollQueue,
  pollBuild,
} from "@/lib/jenkins"

const sleep = (ms: number) =>
  new Promise((r) => setTimeout(r, ms))

type RunStep =
  | "IDLE"
  | "START"
  | "PREPARE"
  | "PROCESS"
  | "DOWNLOAD"
  | "DONE"
  | "ERROR"

const STEP_LABEL: Record<RunStep, string> = {
  IDLE: "",
  START: "🚀 เริ่มประมวลผลข้อมูล…",
  PREPARE: "⏳ ระบบกำลังเตรียมข้อมูล…",
  PROCESS: "📊 กำลังสร้างรายงาน GPS Lost…",
  DOWNLOAD: "📥 กำลังเตรียมไฟล์รายงาน…",
  DONE: "✅ รายงานพร้อมใช้งาน",
  ERROR: "❌ ไม่สามารถสร้างรายงานได้",
}

const STEP_PROGRESS: Record<RunStep, number> = {
  IDLE: 0,
  START: 10,
  PREPARE: 35,
  PROCESS: 70,
  DOWNLOAD: 90,
  DONE: 100,
  ERROR: 100,
}

export default function GpsLostReportPage() {
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<RunStep>("IDLE")
  const [message, setMessage] = useState<string | null>(null)

  const onRun = async () => {
    try {
      setLoading(true)
      setMessage(null)
      setStep("START")

      // 1️⃣ start process
      const { queueId } = await triggerGpsLostReport(date)

      // 2️⃣ preparing
      setStep("PREPARE")
      let buildNumber: number | null = null

      while (!buildNumber) {
        await sleep(2000)
        const q = await pollQueue(queueId)
        if (q.buildNumber) {
          buildNumber = q.buildNumber
        }
      }

      // 3️⃣ processing
      setStep("PROCESS")
      let done = false

      while (!done) {
        await sleep(3000)
        const s = await pollBuild(buildNumber)

        if (!s.building && s.result === "SUCCESS") {
          done = true
        }

        if (s.result === "FAILURE") {
          throw new Error("PROCESS_FAILED")
        }
      }

      // 4️⃣ download
      setStep("DOWNLOAD")
      window.location.href = `/api/jenkins/download?build=${buildNumber}`

      setStep("DONE")
      setMessage("รายงานถูกสร้างเรียบร้อยแล้ว")
    } catch (err) {
      console.error(err)
      setStep("ERROR")
      setMessage("ไม่สามารถสร้างรายงานได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  const progress = STEP_PROGRESS[step]

  return (
    <div className="flex justify-center py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-lg">
            GPS Lost Report
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              วันที่ของรายงาน
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Action */}
          <Button
            onClick={onRun}
            disabled={loading}
            className="w-full"
          >
            {loading ? "กำลังประมวลผล…" : "สร้างรายงาน"}
          </Button>

          {/* Progress */}
          {step !== "IDLE" && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                {STEP_LABEL[step]}
              </p>
            </div>
          )}

          {/* Message */}
          {message && (
            <p className="text-sm text-center font-medium">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
