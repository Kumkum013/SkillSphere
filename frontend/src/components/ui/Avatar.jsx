const Avatar = ({ name = '', src = '', size = 'md', className = '' }) => {
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-14 w-14 text-lg' };
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
  return src ? <img src={src} alt={name || 'User'} className={`rounded-full object-cover ${sizes[size]} ${className}`} /> : <span className={`inline-flex items-center justify-center rounded-full bg-match/15 font-semibold text-match ${sizes[size]} ${className}`}>{initials}</span>;
};

export default Avatar;
