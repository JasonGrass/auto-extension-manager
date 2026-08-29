import React, { useEffect, useState } from "react"

import { Progress } from "antd"

import { getLang } from ".../utils/utils"

/**
 * AI 分析进行中的进度条（分组建议 / 减负分析共用）。
 *
 * 非流式 LLM 接口拿不到真实的生成进度，这里用已等待时间驱动渐近曲线：
 * 预期时长内推进到 80%，之后缓慢逼近 95% 并停住——
 * 明确表达"还在工作中"而不是假装精确，完成时随 loading 结束整体消失。
 */
function AiProgress({ loading, expectedMs = 90000 }) {
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    if (!loading) {
      setElapsedMs(0)
      return
    }
    const startedAt = Date.now()
    const timer = setInterval(() => setElapsedMs(Date.now() - startedAt), 500)
    return () => clearInterval(timer)
  }, [loading])

  if (!loading) {
    return null
  }

  const percent =
    elapsedMs <= expectedMs
      ? Math.min(80, (elapsedMs / expectedMs) * 80)
      : Math.min(95, 80 + 15 * (1 - Math.exp(-(elapsedMs - expectedMs) / (2 * expectedMs))))

  return (
    <Progress
      percent={Number(percent.toFixed(0))}
      status="active"
      format={() => getLang("ai_elapsed_time", Math.floor(elapsedMs / 1000))}
    />
  )
}

export default AiProgress
