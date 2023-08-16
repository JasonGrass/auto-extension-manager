import React, { memo, useState } from "react"

import { CloseOutlined } from "@ant-design/icons"
import { Alert, Tag, TimePicker, message } from "antd"
import { styled } from "styled-components"

const TimeTrigger = memo(() => {
  const [times, setTimes] = useState([])

  const onChange = (time, timeString) => {
    if (!timeString || timeString.trim() === "") {
      return
    }

    // if (times.length > 10) {
    //   message.error("时间最多设置10个")
    //   return
    // }

    if (times.includes(timeString)) {
      message.warning(`${timeString} 时间已存在`)
      return
    }

    const newTimes = [...times, timeString]
    setTimes(newTimes.sort())
  }

  const onTimeTagClose = (time) => {
    setTimes(times.filter((t) => t !== time))
  }

  return (
    <Style>
      <Alert
        message="设置时间触发器之后，后台需要启动定时器长期轮询。通常不建议使用此触发条件。"
        type="warning"
        showIcon
      />

      <div style={{ marginTop: 5 }}>
        <TimePicker style={{ width: 150, marginRight: 10 }} onChange={onChange} format="HH:mm" />
        {times.map((t) => {
          return (
            <Tag key={t} color="magenta" style={{ marginTop: 5 }}>
              <span>
                {t} <CloseOutlined onClick={(e) => onTimeTagClose(t, e)} />
              </span>
            </Tag>
          )
        })}
      </div>
    </Style>
  )
})

export default TimeTrigger

const Style = styled.div``
