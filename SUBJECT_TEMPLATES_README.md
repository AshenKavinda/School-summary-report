# Subject Template Management System

This system provides a complete subject template collection management solution with the following features:

## Architecture

The system follows the MVC (Model-View-Controller) architecture:

```
View (HTML/JS) -> Controller (Business Logic) -> Model (Database Operations)
```

## Features

### 1. Dynamic Singly Linked List Implementation
- **File**: `src/data_structures/d_linked_list.js`
- Node-based dynamic singly linked list for managing subjects
- Operations: add, remove, get, contains, toArray, clear
- Used for temporary storage of subjects during template creation

### 2. Subject Template Collection
Each template contains:
- `template_id`: Unique MongoDB ObjectId
- `name`: Template name (string)
- `subjects`: Array of subject names

### 3. Template Management Pages

#### Home Page (`subject_tem_home.html`)
- Displays all available templates in a grid layout
- Search functionality to filter templates
- Create button to redirect to template creation
- Remove button for each template with confirmation modal
- Responsive design with Tailwind CSS

#### Create Template Page (`subject_tem_create.html`)
- Form to create new templates
- Dynamic subject addition using linked list
- Subject field with add button for one-by-one addition
- Live display of added subjects with remove functionality
- Save button to persist to MongoDB
- Form validation and error handling

## File Structure

```
src/
├── data_structures/
│   └── d_linked_list.js          # Linked list implementation
├── model/
│   ├── db.js                     # Database connection
│   └── subject_tem.js            # Template database operations
├── controller/
│   └── subject_service/
│       └── subject_tem.js        # Business logic & API handlers
└── view/
    ├── subject_tem_home.html     # Templates listing page
    └── subject_tem_create.html   # Template creation page
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | Get all templates |
| POST | `/api/templates` | Create new template |
| GET | `/api/templates/:id` | Get template by ID |
| PUT | `/api/templates/:id` | Update template |
| DELETE | `/api/templates/:id` | Delete template |
| GET | `/api/templates/search?q=term` | Search templates |

## Database Schema

```javascript
{
  _id: ObjectId,
  name: String,
  subjects: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Instructions

### Starting the Application
1. Ensure MongoDB is configured in `.env`
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Navigate to `http://localhost:3000/templates`

### Creating a Template
1. Click "Create Template" button
2. Enter template name
3. Add subjects one by one using the add button
4. Review added subjects (displayed below input)
5. Click "Save Template" to persist to database

### Managing Templates
- **View**: All templates displayed on home page
- **Search**: Use search bar to filter by name or subjects
- **Delete**: Click remove button and confirm deletion

## Technical Implementation Details

### Linked List Usage
The create page uses a dynamic singly linked list to manage subjects temporarily:
1. User adds subjects → stored in linked list
2. Subjects displayed from linked list → converted to DOM elements
3. Remove operation → linked list remove + UI update
4. Save operation → linked list converted to array for database

### Error Handling
- Client-side validation for required fields
- Duplicate subject prevention
- Server-side validation and error responses
- MongoDB connection error handling
- Network error handling with user notifications

### Security Features
- Input sanitization and HTML escaping
- MongoDB injection prevention using ObjectId validation
- CORS configuration
- Environment variable protection

## Dependencies

- **Backend**: Express.js, MongoDB driver, dotenv, cors
- **Frontend**: Tailwind CSS (CDN), Vanilla JavaScript
- **Database**: MongoDB Atlas

## Environment Variables

```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string
DB_NAME=your_database_name
```

## Future Enhancements

1. Template editing functionality
2. Template duplication feature
3. Bulk operations (import/export)
4. Template categories/tags
5. User authentication and authorization
6. Audit logging for template changes