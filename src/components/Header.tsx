import { Logo } from './Logo';
import { Navigation } from './Navigation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CartButton } from './CartButton';

export const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Logo />
        <Navigation />
        <div className="header-right">
          <ThemeToggle />
          <LanguageSwitcher />
          <CartButton />
        </div>
      </div>
    </header>
  );
};
