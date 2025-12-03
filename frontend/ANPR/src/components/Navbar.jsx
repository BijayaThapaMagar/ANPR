import { NavLink } from 'react-router-dom';
import { navItems } from '@/nav-items';

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/60 dark:bg-[#232526]/60 backdrop-blur-xl border border-white/30 dark:border-[#444]/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.10)] rounded-2xl font-sparrow">
      <div className="flex items-center px-4 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2"></div>
        
        {/* Navigation Items */}
        <ul className="flex space-x-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 font-sparrow transition-all duration-200 px-3 py-2 rounded-lg group/item hover:px-4 ${
                    isActive 
                      ? 'text-primary bg-primary/10 dark:bg-primary/20' 
                      : 'text-foreground dark:text-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20'
                  }`
                }
              >
                <span className="flex-shrink-0">
                  {item.icon}
                </span>
                <span className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden w-0 group-hover/item:w-auto">
                  {item.title}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
