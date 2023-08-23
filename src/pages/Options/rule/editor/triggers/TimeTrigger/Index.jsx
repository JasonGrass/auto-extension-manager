import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { CloseOutlined } from "@ant-design/icons"
import { Alert, Button, Tag, TimePicker, message } from "antd"
import { styled } from "styled-components"

const TimeTrigger = ({ options, config }, ref) => {
  useImperativeHandle(ref, () => ({
    getPeriodTriggerConfig: () => {
      if (periods.length === 0) {
        throw new Error("请至少设置一个时间区间")
      }
      return {
        periods: periods
      }
    }
  }))

  // 所有已经添加的时间段
  const [periods, setPeriods] = useState([])
  // 当前选择的时间段
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  // 初始化
  useEffect(() => {
    const myConfig =
      config.match?.triggers?.find((t) => t.trigger === "periodTrigger")?.config ?? {}
    setPeriods(myConfig.periods ?? [])
  }, [config])

  // 时间选择变更
  const onChange = (time, timeString, point) => {
    if (!timeString || timeString.trim() === "") {
      return
    }
    if (point === "start") {
      setStartTime(timeString)
    }
    if (point === "end") {
      setEndTime(timeString)
    }
  }

  const onAdd = () => {
    if (periods.length > 10) {
      message.error("最多设置10个时间区间")
      return
    }

    if (startTime === "" || endTime === "") {
      message.error("请选择完整的时间区间")
      return
    }
    if (startTime >= endTime) {
      message.error("开始时间不能大于等于结束时间")
      return
    }

    const newPeriods = [...periods, { start: startTime, end: endTime }]
    sortPeriods(newPeriods)
    if (checkPeriodCross(newPeriods)) {
      message.error("时间区间存在交叉，请重新设置")
      return
    }

    setPeriods(newPeriods)
  }

  const onTimeTagClose = (period) => {
    setPeriods(periods.filter((t) => t !== period))
  }

  return (
    <Style>
      <Alert
        message="不建议使用此匹配条件。由于浏览器限制，后台操作不能常驻，必须由事件触发。所以仅在浏览器有活动时，才能触发此条件的匹配，时机会不精确。"
        type="warning"
        showIcon
        action={
          <a href="https://ext.jgrass.cc/docs/rule" target="_blank" rel="noreferrer">
            详细说明
          </a>
        }
      />

      <div style={{ marginTop: 5 }}>
        <div className="match-period-setting">
          <span className="match-period-setting-time-label">开始时间</span>
          <TimePicker
            className="match-period-setting-time-picker"
            changeOnBlur
            onChange={(time, timeString) => onChange(time, timeString, "start")}
            minuteStep={5}
            format="HH:mm"
          />
          <span className="match-period-setting-time-label">结束时间</span>
          <TimePicker
            className="match-period-setting-time-picker"
            changeOnBlur
            onChange={(time, timeString) => onChange(time, timeString, "end")}
            minuteStep={5}
            format="HH:mm"
          />
          <Button onClick={onAdd}>添加</Button>
        </div>

        {periods.map((period) => {
          const show = `${period.start}-${period.end}`
          return (
            <Tag key={show} color="magenta" style={{ marginTop: 5 }}>
              <span>
                {show} <CloseOutlined onClick={(e) => onTimeTagClose(period, e)} />
              </span>
            </Tag>
          )
        })}
      </div>
    </Style>
  )
}

export default memo(forwardRef(TimeTrigger))

const Style = styled.div`
  .match-period-setting {
    margin: 10px 0 5px 5px;
  }

  .match-period-setting-time-label {
    margin-right: 8px;
  }

  .match-period-setting-time-picker {
    margin-right: 24px;
  }
`

/**
 * 检查时间区间是否存在交叉
 */
function checkPeriodCross(periods) {
  // 先排序
  sortPeriods(periods)

  // 遍历
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i]

    // 当前时间
    // const start = period.start
    const end = period.end

    // 下一个时间
    const nextPeriod = periods[i + 1]
    if (!nextPeriod) {
      return false
    }

    const nextStart = nextPeriod.start
    // const nextEnd = nextPeriod.end

    // 当前时间与下一个时间相交
    if (end > nextStart) {
      return true
    }
  }
  return false
}

/**
 * 对时间区间进行排序
 */
function sortPeriods(periods) {
  periods.sort((a, b) => {
    if (a.start > b.start) {
      return 1
    } else if (a.start < b.start) {
      return -1
    } else {
      return 0
    }
  })
}
