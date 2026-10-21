const Card = ({ as: Element = 'div', interactive = false, className = '', children, ...props }) => (
  <Element
    className={`ui-card ${interactive ? 'transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#333]' : ''} ${className}`}
    {...props}
  >
    {children}
  </Element>
);

export default Card;
