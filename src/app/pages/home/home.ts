
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';

import { AiAssistant } from '../../components/ai-assistant/ai-assistant';
import { ParticlesBackground } from '../../components/particles-background/particles-background';

import {
  PROJECTS,
  TECHNOLOGY_GROUPS,
} from '../../core/data/portfolio.data';

@Component({
  selector: 'app-home',
  imports: [AiAssistant, ParticlesBackground],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();

  technologyGroups = TECHNOLOGY_GROUPS;
  projects = PROJECTS;

  typedText = '';

  private phrases = [
    'Olá, eu sou Heron Alves',
    'Desenvolvedor Full Stack',
    'Desenvolvo aplicações web e APIs',
    'Transformo ideias em soluções reais',
  ];

  private phraseIndex = 0;
  private characterIndex = 0;
  private isDeleting = false;
  private typingTimer?: ReturnType<typeof setTimeout>;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.typeText();
  }

  ngOnDestroy(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }

  private typeText(): void {
    const phrase = this.phrases[this.phraseIndex];

    if (!this.isDeleting) {
      this.characterIndex++;
      this.typedText = phrase.substring(0, this.characterIndex);
    } else {
      this.characterIndex--;
      this.typedText = phrase.substring(0, this.characterIndex);
    }

    this.cdr.markForCheck();

    let delay = this.isDeleting ? 45 : 85;

    if (!this.isDeleting && this.characterIndex === phrase.length) {
      delay = 2200;
      this.isDeleting = true;
    } else if (this.isDeleting && this.characterIndex === 0) {
      this.isDeleting = false;
      this.phraseIndex =
        (this.phraseIndex + 1) % this.phrases.length;
      delay = 450;
    }

    this.typingTimer = setTimeout(() => this.typeText(), delay);
  }
}
