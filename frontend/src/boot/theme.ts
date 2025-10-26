import { boot } from 'quasar/wrappers'
import { useThemeStore } from 'src/stores/theme'

export default boot(() => {
  const theme = useThemeStore()
  // Initialize theme early
  theme.init()
})


