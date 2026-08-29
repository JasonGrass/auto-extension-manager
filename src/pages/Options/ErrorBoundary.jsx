import React from "react"

/**
 * Options 页面的渲染错误兜底。
 *
 * 背景：AI 分组编辑态曾出现渲染崩溃导致整页白屏，且没有任何错误信息可排查。
 * 这个边界把崩溃拦住：页面上直接显示错误的原始堆栈（不走 i18n，
 * 避免兜底组件自身再失败），用户可以把红色文本发给开发者定位根因。
 */
export class OptionsErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error("[Options] 渲染错误:", error, info)
  }

  render() {
    if (this.state.error) {
      const detail = String(
        this.state.error?.stack || this.state.error?.message || this.state.error
      )
      return (
        <div style={{ padding: 24 }}>
          <h3>页面渲染出错</h3>
          <p style={{ color: "#999" }}>
            下方为错误详情，请完整复制反馈给开发者；点击「重试」可尝试恢复页面。
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              color: "#c00",
              background: "#fff5f5",
              padding: 12,
              borderRadius: 4,
              maxHeight: 320,
              overflow: "auto"
            }}>
            {detail}
          </pre>
          <button
            onClick={() => {
              this.setState({ error: null })
            }}>
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
