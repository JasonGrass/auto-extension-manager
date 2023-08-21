import mitt from "mitt"

function builder() {
  let emitter = null

  return () => {
    if (emitter) {
      return emitter
    } else {
      emitter = mitt()
      return emitter
    }
  }
}

// 构建一个 rule setting 使用的 emitter
export const ruleEmitBuilder = builder()
