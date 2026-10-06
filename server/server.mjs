import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';

import { portfolioContext } from './portfolio-context.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO
|--------------------------------------------------------------------------
*/

if (!process.env.GEMINI_API_KEY) {
  console.error(
    'GEMINI_API_KEY não encontrada no arquivo .env',
  );

  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
|
| Em desenvolvimento:
| Angular pode acessar pela porta 4200.
|
| Em produção:
| FRONTEND_URL receberá o endereço real do portfólio.
|
*/

const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(
    process.env.FRONTEND_URL,
  );
}

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Requisições sem Origin, como ferramentas
       * de teste ou chamadas internas, continuam
       * permitidas.
       */
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(
        `Origem bloqueada pelo CORS: ${origin}`,
      );

      return callback(
        new Error(
          'Origem não permitida pelo CORS.',
        ),
      );
    },

    methods: [
      'GET',
      'POST',
    ],

    allowedHeaders: [
      'Content-Type',
    ],
  }),
);


/*
|--------------------------------------------------------------------------
| JSON
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: '10kb',
  }),
);


/*
|--------------------------------------------------------------------------
| RATE LIMIT
|--------------------------------------------------------------------------
|
| Limite somente para o chat.
|
| Cada IP pode realizar até 20 requisições
| dentro de uma janela de 10 minutos.
|
| A rota /api/health não entra nesse limite.
|
*/

const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,

  limit: 20,

  standardHeaders: 'draft-8',

  legacyHeaders: false,

  message: {
    error:
      'Muitas perguntas foram enviadas em pouco tempo. Aguarde alguns minutos e tente novamente.',
  },
});


/*
|--------------------------------------------------------------------------
| BASE LOCAL
|--------------------------------------------------------------------------
*/

const localKnowledge = [
  {
    intents: [
      'portfolio ai',
      'este portfolio',
      'esse portfolio',
      'projeto portfolio',
      'como foi desenvolvido',
      'como foi feito',
      'tecnologias do portfolio',
    ],

    answer:
      'Este portfólio foi desenvolvido por Heron utilizando Angular e TypeScript no front-end, Node.js e Express no backend e Gemini API para recursos de inteligência artificial. O assistente utiliza uma arquitetura híbrida, combinando respostas locais rápidas com IA generativa.',
  },

  {
    intents: [
      'inteligencia artificial',
      'ia do portfolio',
      'assistente virtual',
      'assistente de ia',
      'gemini',
      'gemini api',
    ],

    answer:
      'Sim. Este portfólio possui um assistente de IA com integração à Gemini API. O sistema utiliza uma arquitetura híbrida, combinando uma base local para perguntas profissionais comuns com IA generativa para perguntas mais abertas.',
  },

  {
    intents: ['php'],

    answer:
      'Sim. Heron possui experiência profissional com PHP, utilizando a linguagem no desenvolvimento e manutenção de aplicações back-end, APIs e integrações.',
  },

  {
    intents: ['laravel'],

    answer:
      'Sim. Laravel faz parte da experiência profissional de Heron no desenvolvimento back-end com PHP.',
  },

  {
    intents: ['yii'],

    answer:
      'Sim. Heron possui experiência profissional com Yii em aplicações PHP.',
  },

  {
    intents: ['angularjs'],

    answer:
      'Sim. Heron possui experiência profissional com AngularJS no desenvolvimento e manutenção de aplicações web.',
  },

  {
    intents: ['angular'],

    answer:
      'Sim. Heron possui experiência profissional com Angular no desenvolvimento front-end de aplicações web.',
  },

  {
    intents: [
      'javascript',
      'java script',
    ],

    answer:
      'Sim. JavaScript faz parte da experiência profissional de Heron no desenvolvimento de aplicações web.',
  },

  {
    intents: [
      'api',
      'apis',
      'rest',
      'integracao',
      'integracoes',
    ],

    answer:
      'Sim. Heron possui experiência profissional na criação e manutenção de APIs REST e em integrações entre aplicações e bancos de dados.',
  },

  {
    intents: [
      'mysql',
      'banco de dados',
    ],

    answer:
      'Heron possui experiência profissional com MySQL, incluindo integração entre aplicações e banco de dados.',
  },

  {
    intents: [
      'android',
      'android studio',
    ],

    answer:
      'Heron possui experiência com manutenção de aplicações Android e utilização do Android Studio.',
  },

  {
    intents: [
      'ios',
      'xcode',
      'iphone',
    ],

    answer:
      'Heron possui experiência com manutenção de aplicações iOS e utilização do Xcode.',
  },

  {
    intents: [
      'mobile',
      'aplicativo',
      'aplicativos',
    ],

    answer:
      'Sim. Heron possui experiência profissional com desenvolvimento e manutenção de aplicações mobile, incluindo Android e iOS.',
  },

  {
    intents: [
      'zhavia',
      'onde trabalhou',
      'empresa trabalhou',
      'ultima empresa',
    ],

    answer:
      'Heron trabalhou como Desenvolvedor Full Stack na Zhavia, de março de 2021 a junho de 2025, atuando no desenvolvimento e manutenção de aplicações web e mobile.',
  },

  {
    intents: [
      'quanto tempo',
      'quantos anos',
      'anos de experiencia',
      'tempo de experiencia',
    ],

    answer:
      'Heron possui mais de 4 anos de experiência profissional em desenvolvimento de software, com atuação em aplicações web e mobile.',
  },

  {
    intents: [
      'faculdade',
      'formacao',
      'onde estuda',
      'unicesumar',
      'engenharia de software',
    ],

    answer:
      'Heron está cursando Engenharia de Software na UniCesumar, com início em março de 2026.',
  },

  {
    intents: [
      'principais tecnologias',
      'quais tecnologias',
      'stack',
      'stack profissional',
    ],

    answer:
      'Entre as tecnologias presentes na experiência de Heron estão PHP, Laravel, Yii, Angular, AngularJS, JavaScript, HTML, CSS, Angular Material, MySQL e APIs REST, além de experiência com Android Studio e Xcode.',
  },

  {
    intents: [
      'front-end',
      'frontend',
      'front end',
    ],

    answer:
      'No front-end, Heron possui experiência com Angular, AngularJS, JavaScript, HTML, CSS e Angular Material.',
  },

  {
    intents: [
      'back-end',
      'backend',
      'back end',
    ],

    answer:
      'No back-end, Heron possui experiência principalmente com PHP, Laravel, Yii, APIs REST e integração com MySQL.',
  },
];


/*
|--------------------------------------------------------------------------
| NORMALIZAÇÃO
|--------------------------------------------------------------------------
*/

function normalizeText(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[?!.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}


/*
|--------------------------------------------------------------------------
| PERGUNTAS COMPLEXAS
|--------------------------------------------------------------------------
*/

function shouldUseGemini(question) {
  const normalizedQuestion =
    normalizeText(question);

  const complexPatterns = [
    'por que',
    'porque',
    'como voce',
    'como o heron',
    'explique',
    'explica',
    'compare',
    'comparar',
    'diferenca',
    'diferencas',
    'vantagem',
    'vantagens',
    'desafio',
    'desafios',
    'como resolveria',
    'como faria',
    'o que faria',
    'por que contratar',
    'porque contratar',
    'por que devo contratar',
    'nao conhece',
    'nao sabe',
    'nao trabalha',
    'nao tem experiencia',
  ];

  return complexPatterns.some(
    (pattern) =>
      normalizedQuestion.includes(pattern),
  );
}


/*
|--------------------------------------------------------------------------
| BUSCA LOCAL
|--------------------------------------------------------------------------
*/

function findLocalAnswer(question) {
  if (shouldUseGemini(question)) {
    return null;
  }

  const normalizedQuestion =
    normalizeText(question);

  const matches = [];

  for (const item of localKnowledge) {
    for (const intent of item.intents) {
      const normalizedIntent =
        normalizeText(intent);

      if (
        normalizedQuestion.includes(
          normalizedIntent,
        )
      ) {
        matches.push({
          answer: item.answer,
          length: normalizedIntent.length,
        });
      }
    }
  }

  if (!matches.length) {
    return null;
  }

  matches.sort(
    (a, b) =>
      b.length - a.length,
  );

  return matches[0].answer;
}


/*
|--------------------------------------------------------------------------
| HISTÓRICO
|--------------------------------------------------------------------------
*/

function prepareHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((message) => {
      if (
        !message ||
        typeof message.content !== 'string'
      ) {
        return false;
      }

      if (
        message.role !== 'user' &&
        message.role !== 'assistant'
      ) {
        return false;
      }

      const content =
        message.content.trim();

      if (!content) {
        return false;
      }

      if (
        content.includes(
          'temporariamente ocupado',
        ) ||
        content.includes(
          'temporariamente indisponível',
        ) ||
        content.includes(
          'limite de uso',
        )
      ) {
        return false;
      }

      return true;
    })
    .slice(-6)
    .map((message) => ({
      role:
        message.role === 'assistant'
          ? 'model'
          : 'user',

      parts: [
        {
          text: message.content
            .trim()
            .slice(0, 1000),
        },
      ],
    }));
}


/*
|--------------------------------------------------------------------------
| GEMINI
|--------------------------------------------------------------------------
*/

const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
];

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms),
  );


function getGeminiErrorStatus(error) {
  return (
    error?.status ||
    error?.code ||
    error?.error?.code ||
    null
  );
}


function isTemporaryGeminiError(error) {
  const status =
    getGeminiErrorStatus(error);

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}


async function askModel(
  model,
  conversation,
) {
  console.log(
    `Tentando modelo: ${model}`,
  );

  const response =
    await ai.models.generateContent({
      model,

      contents: conversation,

     config: {
      systemInstruction:
        portfolioContext,

      thinkingConfig: {
        thinkingLevel: 'low',
      },

      maxOutputTokens: 1000,
    },
    });

  const answer =
    response.text?.trim();

  if (!answer) {
    throw new Error(
      'A IA retornou uma resposta vazia.',
    );
  }

  return answer;
}


async function askGemini(
  question,
  history = [],
) {
  const conversation =
    prepareHistory(history);

  conversation.push({
    role: 'user',

    parts: [
      {
        text: question,
      },
    ],
  });


  for (
    let index = 0;
    index < GEMINI_MODELS.length;
    index++
  ) {
    const model =
      GEMINI_MODELS[index];

    try {
      const answer =
        await askModel(
          model,
          conversation,
        );

      console.log(
        `Modelo utilizado: ${model} ✓`,
      );

      return answer;

    } catch (error) {
      const status =
        getGeminiErrorStatus(error);

      console.error(
        `Falha no ${model}:`,
        status || error?.message,
      );

      if (
        !isTemporaryGeminiError(error)
      ) {
        throw error;
      }

      const isLastModel =
        index ===
        GEMINI_MODELS.length - 1;

      if (isLastModel) {
        throw error;
      }

      console.log(
        'Tentando modelo de fallback...',
      );

      await sleep(
        400 * (index + 1),
      );
    }
  }

  throw new Error(
    'Nenhum modelo Gemini está disponível.',
  );
}


/*
|--------------------------------------------------------------------------
| HEALTH
|--------------------------------------------------------------------------
*/

app.get(
  '/api/health',
  (req, res) => {
    res.json({
      status: 'ok',
      service: 'Heron Portfolio AI',
      provider: 'Hybrid',
    });
  },
);


/*
|--------------------------------------------------------------------------
| CHAT
|--------------------------------------------------------------------------
|
| O rate limit é aplicado somente ao chat.
|
*/

app.post(
  '/api/chat',
  chatLimiter,
  async (req, res) => {
    try {
      const question =
        req.body?.question?.trim();

      const history =
        req.body?.history ?? [];


      if (!question) {
        return res
          .status(400)
          .json({
            error:
              'Digite uma pergunta.',
          });
      }


      if (question.length > 500) {
        return res
          .status(400)
          .json({
            error:
              'A pergunta deve ter no máximo 500 caracteres.',
          });
      }


      console.log('');
      console.log(
        `Pergunta: ${question}`,
      );


      /*
       * 1. BASE LOCAL
       */
      const localAnswer =
        findLocalAnswer(question);


      if (localAnswer) {
        console.log(
          'Resposta: BASE LOCAL ⚡',
        );

        return res.json({
          answer: localAnswer,
          source: 'local',
        });
      }


      /*
       * 2. GEMINI
       */
      console.log(
        'Resposta: GEMINI ✦',
      );


      const answer =
        await askGemini(
          question,
          history,
        );


      console.log(
        'Resposta enviada com sucesso.',
      );


      return res.json({
        answer,
        source: 'gemini',
      });

    } catch (error) {
      const status =
        getGeminiErrorStatus(error);


      console.error('');
      console.error(
        'Falha final do Gemini:',
      );

      console.error(
        'Status:',
        status,
      );

      console.error(
        'Mensagem:',
        error?.message,
      );


      if (
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504
      ) {
        return res
          .status(503)
          .json({
            error:
              'A IA está temporariamente ocupada, mas você ainda pode perguntar sobre tecnologias, experiência, formação e stack do Heron.',
          });
      }


      return res
        .status(500)
        .json({
          error:
            'Não foi possível consultar o assistente.',
        });
    }
  },
);


/*
|--------------------------------------------------------------------------
| ERROS DE CORS
|--------------------------------------------------------------------------
*/

app.use(
  (error, req, res, next) => {
    if (
      error?.message ===
      'Origem não permitida pelo CORS.'
    ) {
      return res
        .status(403)
        .json({
          error:
            'Origem não autorizada.',
        });
    }

    return next(error);
  },
);


/*
|--------------------------------------------------------------------------
| START
|--------------------------------------------------------------------------
*/

app.listen(
  PORT,
  () => {
    console.log('');
    console.log(
      '====================================',
    );

    console.log(
      ' HERON PORTFOLIO AI',
    );

    console.log(
      '====================================',
    );

    console.log(
      `Servidor: http://localhost:${PORT}`,
    );

    console.log(
      `Health:   http://localhost:${PORT}/api/health`,
    );

    console.log(
      'Modo:     Local + Gemini',
    );

    console.log(
      `Gemini:   ${GEMINI_MODELS.join(' → ')}`,
    );

    console.log(
      'Proteção: CORS + Rate Limit',
    );

    console.log(
      '====================================',
    );

    console.log('');
  },
);