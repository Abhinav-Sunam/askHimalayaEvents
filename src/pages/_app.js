import '@/styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';

export default function App({ Component, pageProps }) {
  return (
    <LocationProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </LocationProvider>
  );
}
