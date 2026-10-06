export interface TechnologyGroup {
  title: string;
  technologies: string[];
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  status: 'Concluído' | 'Em desenvolvimento';
  image?: string;
  github?: string;
  demo?: string;
  featured?: boolean;
}

export const TECHNOLOGY_GROUPS: TechnologyGroup[] = [
  {
    title: 'Back-end',
    technologies: ['PHP', 'Laravel', 'Yii', 'APIs REST'],
  },
  {
    title: 'Front-end',
    technologies: [
      'Angular',
      'AngularJS',
      'JavaScript',
      'HTML5',
      'CSS3',
      'Angular Material',
    ],
  },
  {
    title: 'Banco de dados',
    technologies: ['MySQL'],
  },
  {
    title: 'Mobile & Tools',
    technologies: [
      'Android Studio',
      'Xcode',
      'Git',
      'GitHub',
      'Postman',
    ],
  },
];

export const PROJECTS: Project[] = [
  {
    title: 'Portfolio AI',
    description:
      'Portfólio profissional desenvolvido em Angular com assistente de IA integrado para responder perguntas sobre minha experiência, tecnologias e formação.',
    technologies: ['Angular', 'TypeScript', 'Node.js', 'Gemini API'],
    status: 'Em desenvolvimento',
    featured: true,
  },
  {
    title: 'Sistema de Controle de Produção',
    description:
      'Sistema para gerenciamento de pedidos, produção, prioridades, estoque e acompanhamento operacional.',
    technologies: ['Angular', 'PHP', 'MySQL'],
    status: 'Em desenvolvimento',
  },
];