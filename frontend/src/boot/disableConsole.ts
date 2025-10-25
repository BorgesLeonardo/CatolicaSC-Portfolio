// Silence console output in production builds
// Keeps development logs intact
export default () => {
  if (import.meta.env.PROD) {
    const noop = () => {}
    try { console.log = noop } catch (e) { void e }
    try { console.info = noop } catch (e) { void e }
    try { console.debug = noop } catch (e) { void e }
    try { console.warn = noop } catch (e) { void e }
    try { console.error = noop } catch (e) { void e }
  }
}


