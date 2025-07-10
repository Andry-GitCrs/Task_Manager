# Task Management Flask Application

This is a comprehensive task management application built with Flask. It provides a platform for users to manage their tasks, set priorities, and track their progress. The application also includes an admin panel for user management and monitoring.

## Features

*   **User Authentication**: Secure user registration and login system.
*   **Task Management**: Create, update, delete, and track tasks and subtasks.
*   **Task Lists**: Organize tasks into custom lists.
*   **Notifications**: In-app notifications for important events.
*   **Admin Dashboard**: A powerful admin panel to manage users, view statistics, and monitor application activity.
*   **User Profiles**: Users can update their profile information and profile pictures.
*   **Data Export**: Export tasks to CSV and PDF formats.
*   **Responsive Design**: A responsive user interface that works on different devices.

## Architecture

The project follows a modular and scalable architecture, with a clear separation of concerns:

*   **`main`**: The entry point of the application, responsible for initializing the Flask app and its components.
*   **`database`**: Contains all database-related logic, including SQLAlchemy models and database connection settings.
*   **`routes`**: Defines all the application's routes, organized into blueprints for better maintainability.
*   **`static`**: Stores all static assets, such as CSS, JavaScript, and images.
*   **`templates`**: Contains all the HTML templates for rendering the application's views.

## Technologies Used

*   **Backend**: Python, Flask, SQLAlchemy
*   **Database**: PostgreSQL
*   **Frontend**: HTML, CSS, JavaScript
*   **Deployment**: Heroku (Procfile included)

## Installation and Setup

To run this project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/Gestion_des_taches_flask.git
    cd Gestion_des_taches_flask
    ```

2.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install the dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up the database**:
    *   Make sure you have PostgreSQL installed and running.
    *   Create a new database for the project.
    *   Configure the database connection in the `database/pg_connexion.py` file.

5.  **Run the database migrations**:
    ```bash
    flask db upgrade
    ```

6.  **Run the application**:
    ```bash
    flask run
    ```

The application should now be running at `http://127.0.0.1:5000/`.

## Project Structure

```
Gestion_des_taches_flask/
├── database/
│   ├── models/
│   └── pg_connexion.py
├── main/
│   ├── migrations/
│   └── main.py
├── routes/
│   ├── admin/
│   ├── auth/
│   ├── list/
│   ├── public/
│   ├── services/
│   ├── subtask/
│   ├── task/
│   └── user/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
├── templates/
│   └── views/
├── .gitignore
├── Procfile
├── requirements.txt
└── README.md
```

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
