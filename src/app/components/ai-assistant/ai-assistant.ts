import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface ChatResponse {
  answer: string;
}

interface ApiError {
  error?: string;
}

@Component({
  selector: 'app-ai-assistant',
  imports: [FormsModule],
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.scss',
})
export class AiAssistant implements AfterViewChecked {
  @ViewChild('messagesContainer')
  private messagesContainer?: ElementRef<HTMLDivElement>;

  question = '';
  isLoading = false;

  private shouldScroll = false;

  messages: ChatMessage[] = [
    {
      role: 'assistant',
      content:
        'Olá! Sou o assistente virtual do portfólio do Heron. Pergunte sobre experiência, tecnologias, projetos ou formação.',
    },
  ];

  suggestions = [
    'Experiência com PHP',
    'Trabalha com Angular?',
    'Experiência com APIs',
    'Principais tecnologias',
  ];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewChecked(): void {
    if (!this.shouldScroll) {
      return;
    }

    this.scrollToBottom();
    this.shouldScroll = false;
  }

  sendSuggestion(question: string): void {
    if (this.isLoading) {
      return;
    }

    this.question = question;
    this.sendMessage();
  }

sendMessage(): void {
  const question = this.question.trim();

  if (!question || this.isLoading) {
    return;
  }

  // Marca quando o loading começou.
  const loadingStartedAt = Date.now();

  /*
   * Pega as últimas 6 mensagens antes
   * de adicionar a nova pergunta.
   */
  const history = this.messages
    .slice(1)
    .slice(-6)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

  // Adiciona a pergunta no chat.
  this.messages.push({
    role: 'user',
    content: question,
  });

  this.question = '';
  this.isLoading = true;
  this.shouldScroll = true;

  this.cdr.detectChanges();

  this.http
    .post<ChatResponse>(
      'http://localhost:3000/api/chat',
      {
        question,
        history,
      },
    )
    .subscribe({
      next: (response) => {
        // Calcula quanto tempo o "Pensando..." já ficou visível.
        const elapsed =
          Date.now() - loadingStartedAt;

        // Garante no mínimo 450ms de loading.
        const remaining =
          Math.max(0, 450 - elapsed);

        setTimeout(() => {
          this.messages.push({
            role: 'assistant',
            content: response.answer,
          });

          this.isLoading = false;
          this.shouldScroll = true;

          this.cdr.detectChanges();
        }, remaining);
      },

      error: (error: HttpErrorResponse) => {
        console.error(
          'Erro ao consultar assistente:',
          error,
        );

        const apiError =
          error.error as ApiError;

        const message =
          apiError?.error ||
          'O assistente está temporariamente indisponível. Tente novamente em alguns segundos.';

        this.messages.push({
          role: 'assistant',
          content: message,
        });

        this.isLoading = false;
        this.shouldScroll = true;

        this.cdr.detectChanges();
      },
    });
}

  private scrollToBottom(): void {
    const container =
      this.messagesContainer?.nativeElement;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }
}