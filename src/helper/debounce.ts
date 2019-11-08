export default (
  cb: (...args: any) => void,
  interval: number
): ((...args: any[]) => void) => {
  let timer: number

  return (...args: any[]): void => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = window.setTimeout((): void => {
      // eslint-disable-next-line standard/no-callback-literal
      cb(...args)
    }, interval)
  }
}
