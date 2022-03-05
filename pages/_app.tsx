import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Canvas from '../components/canvas';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Canvas>
      <Component {...pageProps} />
    </Canvas>
  )
}

export default MyApp
