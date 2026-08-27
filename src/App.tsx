import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Catalog } from './pages/Catalog';
import './styles/catalog.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Catalog />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
