const SkillDots = ({ level }) => (
  <span className="inline-flex gap-0.5 align-middle">
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        className={`w-1.5 h-1.5 rounded-full ${n <= level ? 'bg-match' : 'bg-border'}`}
      />
    ))}
  </span>
);

export default SkillDots;
