# 🧠 SPACE Notes Backend

SPACE Notes is an AI-powered mobile application designed for students. It allows users to effortlessly generate summaries and quizzes from lecture materials by uploading PDFs or providing YouTube links. This repository contains the backend implementation of SPACE Notes, built using NestJS and a microservices architecture.

## 🚀 Features

- ✍️ AI-generated **summaries** from PDFs and YouTube videos
- 🧪 Smart **quiz generation** for self-testing
- 📦 Modular microservice-based backend with separate services for:
  - PDF parsing and content extraction
  - YouTube transcription (via subtitles/audio)
  - Summarization (via LLMs like OpenAI/Gemini)
  - Quiz generation
  - User authentication and profile management
- 📊 Centralized logging and error handling
- 🔒 Secure authentication (JWT/Auth guards)
- 📬 Message-based communication (e.g. Kafka, RabbitMQ)

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript
- **Architecture**: Microservices
- **Communication**: gRPC / RabbitMQ 
- **AI Providers**: OpenAI, Google Gemini (pluggable)
- **Database**: PostgreSQL 
- **Containerization**: Docker
- **CI/CD**: GitHub Actions (optional)
- **Hosting**: Digital Ocean's Droplets

## 📁 Structure

