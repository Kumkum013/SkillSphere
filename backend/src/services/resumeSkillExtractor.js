const COMMON_RESUME_SKILLS = [
  { name: 'JavaScript', aliases: ['JavaScript', 'JS', 'ECMAScript'] },
  { name: 'TypeScript', aliases: ['TypeScript', 'TS'] },
  { name: 'Python', aliases: ['Python'] },
  { name: 'Java', aliases: ['Java'] },
  { name: 'C++', aliases: ['C++', 'Cpp'] },
  { name: 'C#', aliases: ['C#', 'C Sharp'] },
  { name: 'PHP', aliases: ['PHP'] },
  { name: 'Ruby', aliases: ['Ruby'] },
  { name: 'Go', aliases: ['Golang'] },
  { name: 'Rust', aliases: ['Rust'] },
  { name: 'Kotlin', aliases: ['Kotlin'] },
  { name: 'Swift', aliases: ['Swift'] },
  { name: 'Dart', aliases: ['Dart'] },
  { name: 'Scala', aliases: ['Scala'] },
  { name: 'R Programming', aliases: ['R programming', 'R language'] },
  { name: 'Bash', aliases: ['Bash', 'Shell scripting'] },
  { name: 'PowerShell', aliases: ['PowerShell'] },
  { name: 'HTML', aliases: ['HTML', 'HTML5'] },
  { name: 'CSS', aliases: ['CSS', 'CSS3'] },
  { name: 'SQL', aliases: ['SQL'] },
  { name: 'React', aliases: ['React', 'React.js', 'ReactJS'] },
  { name: 'Next.js', aliases: ['Next.js', 'NextJS'] },
  { name: 'Angular', aliases: ['Angular'] },
  { name: 'Vue.js', aliases: ['Vue.js', 'VueJS'] },
  { name: 'Svelte', aliases: ['Svelte'] },
  { name: 'Tailwind CSS', aliases: ['Tailwind CSS', 'Tailwind'] },
  { name: 'Bootstrap', aliases: ['Bootstrap'] },
  { name: 'Material UI', aliases: ['Material UI', 'MUI'] },
  { name: 'Redux', aliases: ['Redux', 'Redux Toolkit'] },
  { name: 'Webpack', aliases: ['Webpack'] },
  { name: 'Vite', aliases: ['Vite'] },
  { name: 'Node.js', aliases: ['Node.js', 'NodeJS'] },
  { name: 'Express.js', aliases: ['Express.js', 'ExpressJS'] },
  { name: 'NestJS', aliases: ['NestJS'] },
  { name: 'Django', aliases: ['Django'] },
  { name: 'Flask', aliases: ['Flask'] },
  { name: 'FastAPI', aliases: ['FastAPI'] },
  { name: 'Spring Boot', aliases: ['Spring Boot'] },
  { name: 'ASP.NET', aliases: ['ASP.NET', 'ASP Net'] },
  { name: 'Laravel', aliases: ['Laravel'] },
  { name: 'Ruby on Rails', aliases: ['Ruby on Rails', 'Rails'] },
  { name: 'GraphQL', aliases: ['GraphQL'] },
  { name: 'REST API', aliases: ['REST API', 'RESTful API', 'REST'] },
  { name: 'Microservices', aliases: ['Microservices', 'Microservice architecture'] },
  { name: 'MongoDB', aliases: ['MongoDB'] },
  { name: 'PostgreSQL', aliases: ['PostgreSQL', 'Postgres'] },
  { name: 'MySQL', aliases: ['MySQL'] },
  { name: 'SQLite', aliases: ['SQLite'] },
  { name: 'Microsoft SQL Server', aliases: ['Microsoft SQL Server', 'SQL Server'] },
  { name: 'Redis', aliases: ['Redis'] },
  { name: 'Elasticsearch', aliases: ['Elasticsearch', 'Elastic Search'] },
  { name: 'Firebase', aliases: ['Firebase'] },
  { name: 'Supabase', aliases: ['Supabase'] },
  { name: 'DynamoDB', aliases: ['DynamoDB'] },
  { name: 'Oracle Database', aliases: ['Oracle Database', 'Oracle DB'] },
  { name: 'Cassandra', aliases: ['Cassandra'] },
  { name: 'Git', aliases: ['Git'] },
  { name: 'GitHub', aliases: ['GitHub'] },
  { name: 'GitLab', aliases: ['GitLab'] },
  { name: 'Docker', aliases: ['Docker'] },
  { name: 'Kubernetes', aliases: ['Kubernetes', 'K8s'] },
  { name: 'Jenkins', aliases: ['Jenkins'] },
  { name: 'Terraform', aliases: ['Terraform'] },
  { name: 'Ansible', aliases: ['Ansible'] },
  { name: 'GitHub Actions', aliases: ['GitHub Actions'] },
  { name: 'CI/CD', aliases: ['CI/CD', 'continuous integration', 'continuous delivery'] },
  { name: 'Linux', aliases: ['Linux'] },
  { name: 'Nginx', aliases: ['Nginx'] },
  { name: 'AWS', aliases: ['AWS', 'Amazon Web Services'] },
  { name: 'Microsoft Azure', aliases: ['Microsoft Azure', 'Azure'] },
  { name: 'Google Cloud Platform', aliases: ['Google Cloud Platform', 'Google Cloud', 'GCP'] },
  { name: 'Cloud Computing', aliases: ['Cloud Computing'] },
  { name: 'Machine Learning', aliases: ['Machine Learning', 'ML'] },
  { name: 'Deep Learning', aliases: ['Deep Learning'] },
  { name: 'Artificial Intelligence', aliases: ['Artificial Intelligence', 'AI'] },
  { name: 'Natural Language Processing', aliases: ['Natural Language Processing', 'NLP'] },
  { name: 'Computer Vision', aliases: ['Computer Vision'] },
  { name: 'Data Science', aliases: ['Data Science'] },
  { name: 'Data Analysis', aliases: ['Data Analysis', 'Data Analytics'] },
  { name: 'Data Engineering', aliases: ['Data Engineering'] },
  { name: 'Pandas', aliases: ['Pandas'] },
  { name: 'NumPy', aliases: ['NumPy'] },
  { name: 'TensorFlow', aliases: ['TensorFlow'] },
  { name: 'PyTorch', aliases: ['PyTorch'] },
  { name: 'Scikit-learn', aliases: ['Scikit-learn', 'Sklearn'] },
  { name: 'Keras', aliases: ['Keras'] },
  { name: 'OpenCV', aliases: ['OpenCV'] },
  { name: 'Apache Spark', aliases: ['Apache Spark', 'PySpark'] },
  { name: 'Hadoop', aliases: ['Hadoop'] },
  { name: 'Power BI', aliases: ['Power BI'] },
  { name: 'Tableau', aliases: ['Tableau'] },
  { name: 'Microsoft Excel', aliases: ['Microsoft Excel', 'Excel'] },
  { name: 'Jupyter', aliases: ['Jupyter', 'Jupyter Notebook'] },
  { name: 'Figma', aliases: ['Figma'] },
  { name: 'Adobe Photoshop', aliases: ['Adobe Photoshop', 'Photoshop'] },
  { name: 'Adobe Illustrator', aliases: ['Adobe Illustrator', 'Illustrator'] },
  { name: 'UI Design', aliases: ['UI Design', 'User Interface Design'] },
  { name: 'UX Design', aliases: ['UX Design', 'User Experience Design'] },
  { name: 'Wireframing', aliases: ['Wireframing', 'Wireframes'] },
  { name: 'Prototyping', aliases: ['Prototyping', 'Prototyping tools'] },
  { name: 'Jest', aliases: ['Jest'] },
  { name: 'Cypress', aliases: ['Cypress'] },
  { name: 'Playwright', aliases: ['Playwright'] },
  { name: 'Selenium', aliases: ['Selenium'] },
  { name: 'JUnit', aliases: ['JUnit'] },
  { name: 'Unit Testing', aliases: ['Unit Testing'] },
  { name: 'Integration Testing', aliases: ['Integration Testing'] },
  { name: 'Agile', aliases: ['Agile'] },
  { name: 'Scrum', aliases: ['Scrum'] },
  { name: 'Project Management', aliases: ['Project Management'] },
  { name: 'Problem Solving', aliases: ['Problem Solving'] },
  { name: 'Communication', aliases: ['Communication', 'Communication Skills'] },
  { name: 'Teamwork', aliases: ['Teamwork', 'Team Collaboration'] },
  { name: 'Leadership', aliases: ['Leadership', 'Leadership Skills'] },
  { name: 'Critical Thinking', aliases: ['Critical Thinking'] },
  { name: 'Research', aliases: ['Research', 'Research Skills'] },
  { name: 'Cybersecurity', aliases: ['Cybersecurity', 'Cyber Security'] },
  { name: 'Network Security', aliases: ['Network Security'] },
  { name: 'Penetration Testing', aliases: ['Penetration Testing', 'Pen Testing'] },
  { name: 'Blockchain', aliases: ['Blockchain'] },
  { name: 'Solidity', aliases: ['Solidity'] },
  { name: 'Smart Contracts', aliases: ['Smart Contracts'] },
  { name: 'Embedded Systems', aliases: ['Embedded Systems'] },
  { name: 'Internet of Things', aliases: ['Internet of Things', 'IoT'] },
  { name: 'Android Development', aliases: ['Android Development'] },
  { name: 'iOS Development', aliases: ['iOS Development'] },
  { name: 'React Native', aliases: ['React Native'] },
  { name: 'Flutter', aliases: ['Flutter'] }
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const mentionsSkill = (text, term) => {
  const pattern = escapeRegex(term.trim()).replace(/\s+/g, '\\s+');
  return new RegExp(`(^|[^a-z0-9])${pattern}($|[^a-z0-9])`, 'i').test(text);
};

const extractResumeSkills = (resumeText, catalogSkills = []) => {
  const text = resumeText.toLowerCase();
  const detected = new Map();

  for (const skill of catalogSkills) {
    if (skill.name && mentionsSkill(text, skill.name)) {
      detected.set(skill.name.toLowerCase(), skill.name);
    }
  }

  for (const skill of COMMON_RESUME_SKILLS) {
    if (skill.aliases.some((alias) => mentionsSkill(text, alias))) {
      detected.set(skill.name.toLowerCase(), skill.name);
    }
  }

  return Array.from(detected.values()).sort((a, b) => a.localeCompare(b));
};

module.exports = { extractResumeSkills };
