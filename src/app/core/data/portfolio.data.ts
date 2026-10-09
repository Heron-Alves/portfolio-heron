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
      'Portfólio profissional desenvolvido em Angular com assistente de IA integrado. Utiliza Node.js e Express no backend, arquitetura híbrida com respostas locais e Gemini API, histórico de conversa, fallback e proteção contra abuso da API.',
    technologies: [
      'Angular',
      'TypeScript',
      'Node.js',
      'Express',
      'Gemini API',
    ],
    status: 'Em desenvolvimento',
    image: '/projects/portfolio-ai-preview.webp',
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