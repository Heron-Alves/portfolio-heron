import { Component } from '@angular/core';
import { AiAssistant } from '../../components/ai-assistant/ai-assistant';

import {
  PROJECTS,
  TECHNOLOGY_GROUPS,
} from '../../core/data/portfolio.data';

@Component({
  selector: 'app-home',
  imports: [AiAssistant],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  currentYear = new Date().getFullYear();

  technologyGroups = TECHNOLOGY_GROUPS;
  projects = PROJECTS;
}