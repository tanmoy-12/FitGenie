import { Component, ElementRef, inject, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [NgClass, NgIf, FormsModule, NgForOf],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  isChatbotVisible = false; // Toggle visibility
  userInput = ''; // Input from the user
  isLoading = false; // Show loader when fetching response
  isBtnVisible:boolean = true; // Toggle Button visibility
  messages: { sender: 'user' | 'bot'; text: string }[] = []; // Chat messages
  @ViewChild('chatbotMessages') chatbotMessages!: ElementRef;
  private router = inject(Router);
  constructor(private authService: AuthService) {}

  toggleChatbotWindow(): void {
    this.isBtnVisible = false;
    this.isChatbotVisible = true;
  }
  close(){
    this.isChatbotVisible = false;
    this.isBtnVisible = true;
    this.messages = [];
  }
  sendMessage(): void {
    const prompt = this.userInput.trim();
    if (prompt) {
      // Add user message
      this.addMessage('user', prompt);

      // Show loader
      this.isLoading = true;

      // Fetch bot response
      this.authService.generateResponse(prompt).subscribe({
        next: (response) => {
          this.isLoading = false;
          const formattedText = this.formatBotResponse(response.text);
          this.addMessage('bot', formattedText);
        },
        error: () => {
          this.isLoading = false;
          this.addMessage('bot', 'Error: Unable to fetch response.');
        },
      });

      // Clear input field
      this.userInput = '';
    }
  }

  addMessage(sender: 'user' | 'bot', text: string): void {
    this.messages.push({ sender, text });
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }

  formatBotResponse(text: string): string {
    // Remove single * or # characters
    text = text.replace(/[#]/g, '');

    // Replace **text** with <b>text</b> and insert a line break after the bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<br><b>$1</b>');
    text = text.replace(/[*]/g, '');

    return text;
  }

  scrollToBottom(): void {
    const messagesContainer = this.chatbotMessages.nativeElement;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}
