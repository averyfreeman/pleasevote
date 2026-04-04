import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Copyright,
  User,
  Facebook
} from 'lucide-react';

const IconsBar = () => {
  const iconSize = 36;
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      href: 'https://github.com/averyfreeman',
      icon: <Github size={iconSize} />,
      label: 'GitHub'
    },
    {
      href: 'https://facebook.com/avery.freeman',
      icon: <Facebook size={iconSize} />,
      label: 'Facebook'
    },
    {
      href: 'https://twitter.com/UnixGreybeard',
      icon: <Twitter size={iconSize} />,
      label: 'Twitter'
    },
    {
      href: 'https://linkedin.com/in/averyfreeman',
      icon: <Linkedin size={iconSize} />,
      label: 'LinkedIn'
    },
    {
      href: 'mailto:contact@averyfreeman.com?subject=please-vote-project',
      icon: <Mail size={iconSize} />,
      label: 'Email'
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-onehalf-dark border-t-2 border-onehalf-gray shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-4 py-3 flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">

        <div className="flex items-center space-x-6 md:space-x-12">
          {socialLinks.map(({ href, icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-onehalf-light opacity-60 hover:opacity-100 hover:text-onehalf-blue transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              {icon}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-sm text-onehalf-gray font-medium md:text-base">
          <Copyright size={16} className="inline" />
          <span>{currentYear} Avery Freeman</span>
        </div>
      </div>
    </footer>
  );
};

export default IconsBar;
