# HomeCareHub Django Backend

This directory contains the Python/Django backend service for the HomeCareHub ecosystem. It primarily handles specialized features such as facial recognition and Firebase integrations, acting as an auxiliary service to the main Node.js API server.

## Tech Stack

- **Framework**: Django
- **Language**: Python 3.x
- **Database**: PostgreSQL (via Docker)
- **Key Modules**:
  - `facerecognition`: Handles generating facial embeddings from images and identifying persons.
  - `authentication` / `home`: Manages user authentication and specific home-related views.
  - `firebase`: Firebase integration for notifications or real-time data sync.

## Setup Instructions

1. **Virtual Environment**:
   It is recommended to use a virtual environment.
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Setup**:
   The project uses a PostgreSQL database. You can start the database using the provided `docker-compose.yml`:
   ```bash
   docker-compose up -d
   ```
   Apply migrations:
   ```bash
   python manage.py migrate
   ```

4. **Run Development Server**:
   ```bash
   python manage.py runserver
   ```

## Features
- **Facial Embeddings**: Exposes endpoints to process images and return facial embedding vectors.
- **Firebase Integration**: Connects with Firebase services for push notifications or real-time database functions.
