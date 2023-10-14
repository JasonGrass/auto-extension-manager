import React, { memo, useEffect, useState } from "react"

import { Input } from "antd"
import styled from "styled-components"

const { TextArea } = Input

const Index = memo(({ extensions, options, exportRange, selectIds }) => {
  const [value, setValue] = useState("")

  useEffect(() => {
    setValue(JSON.stringify(extensions))
  }, [extensions])

  return (
    <Style>
      <TextArea className="share-textarea" value={value} rows={12} readOnly></TextArea>
    </Style>
  )
})

export default Index

const Style = styled.div`
  .share-textarea {
    margin: 12px 0;
    overflow-x: hidden;
  }
`
