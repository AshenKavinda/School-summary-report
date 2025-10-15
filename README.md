# School Summary Report System

A comprehensive web-based management system for academic reporting, subject templates, and student performance tracking. Built with modern web technologies and featuring custom data structures implementation.

## 🚀 Features

### 📊 Summary Report Manager
- **Report Initialization**: Create new class summary reports with customizable parameters
- **Student Mark Management**: Efficient marks entry and editing using linked list data structures
- **Data Filtering**: Advanced filtering by year, class name, and test numbers
- **Statistics Generation**: Automatic calculation of class performance metrics
- **Export Functionality**: Export reports to Excel format

### 📝 Subject Template Manager
- **Template Creation**: Design reusable subject templates for consistent reporting
- **Template Management**: Full CRUD operations for subject templates
- **Search & Filter**: Quick template discovery and organization
- **Bulk Operations**: Efficient management of multiple templates

### 🔄 Data Structures Implementation
- **Dynamic Linked List**: Custom implementation for efficient student data management
- **Selection Sort Algorithm**: Optimized sorting for student performance ranking
- **Memory Efficient**: In-place sorting with O(1) space complexity

### 📈 Performance Analytics
- **Real-time Statistics**: Live calculation of class averages and performance metrics
- **Grade Distribution**: Visual representation of student grade patterns
- **Comparative Analysis**: Cross-class and temporal performance comparisons

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Font Awesome for modern iconography
- **File Processing**: XLSX library for Excel export functionality

## 📦 Dependencies

### Production Dependencies
```json
{
  "express": "^5.1.0",
  "mongodb": "^6.20.0",
  "mongoose": "^8.19.1",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "uuid": "^13.0.0",
  "xlsx": "^0.18.5"
}
```

### Development Dependencies
```json
{
  "browser-sync": "^3.0.4",
  "concurrently": "^9.2.1"
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14.0.0 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AshenKavinda/School-summary-report.git
   cd School-summary-report
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/school_reports
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   mongod
   
   # Or using MongoDB Compass/Atlas connection
   ```

5. **Run the application**
   ```bash
   # Production mode
   npm start
   
   # Development mode with auto-reload
   npm run dev
   ```

6. **Access the application**
   Open your browser and navigate to: `http://localhost:3000`

## 🎯 Usage Guide

### Getting Started
1. **Access the Home Page**: Navigate to `http://localhost:3000`
2. **Choose a Module**: Select either "Summary Report Manager" or "Subject Templates"

### Summary Report Management
1. **Initialize Reports**: 
   - Go to `/summary/initialization`
   - Fill in class details, year, and test information
   - Select subjects from existing templates

2. **Manage Student Marks**:
   - Navigate to the marks manager from the summary home
   - Enter student marks using the linked list interface
   - Save bulk updates or individual mark changes

3. **Export Reports**:
   - Access the export functionality from the main menu
   - Choose your desired format (Excel)
   - Download the generated report

### Subject Template Management
1. **Create Templates**:
   - Go to `/templates/create`
   - Define subject name, code, and properties
   - Save for reuse in future reports

2. **Manage Existing Templates**:
   - Browse templates at `/templates`
   - Search, edit, or delete as needed
   - Use templates when initializing new reports

## 🏗️ Project Structure

```
School-summary-report/
├── src/
│   ├── controller/              # Request handlers and business logic
│   │   ├── initialization_report_home/
│   │   │   └── summary_init.js
│   │   ├── report_service/
│   │   │   └── export.js
│   │   ├── subject_manager_service/
│   │   │   └── mark_manager.js
│   │   └── subject_service/
│   │       └── subject_tem.js
│   ├── data_structures/         # Custom data structure implementations
│   │   ├── d_linked_list.js     # Dynamic Linked List
│   │   └── selection_sort.js    # Selection Sort Algorithm
│   ├── model/                   # Database models and schemas
│   │   ├── db.js                # Database connection
│   │   ├── export.js            # Export model
│   │   ├── mark_manager.js      # Marks management model
│   │   ├── subject_tem.js       # Subject template model
│   │   └── summary_init.js      # Summary initialization model
│   └── view/                    # Frontend HTML templates
│       ├── export.html
│       ├── marks_manager.html
│       ├── subject_tem_create.html
│       ├── subject_tem_home.html
│       ├── summary_home.html
│       └── summary_initialization.html
├── index.html                   # Main landing page
├── server.js                    # Express server configuration
├── package.json                 # Project dependencies and scripts
└── README.md                    # Project documentation
```

## 🔧 API Endpoints

### Subject Templates
- `GET /api/templates` - Retrieve all templates
- `POST /api/templates` - Create new template
- `GET /api/templates/:id` - Get specific template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `GET /api/templates/search` - Search templates

### Summary Management
- `GET /api/summary/years` - Get available years
- `GET /api/summary/names` - Get available class names
- `GET /api/summary/tests` - Get available test numbers
- `POST /api/summary/initialize` - Initialize new summary
- `GET /api/summary/data` - Get summary data with filtering
- `GET /api/summary/statistics` - Get performance statistics
- `DELETE /api/summary/:id` - Delete summary

### Marks Management
- `GET /api/marks/students` - Get students for linked list
- `POST /api/marks/save-bulk` - Save marks from linked list
- `PUT /api/marks/single` - Update single mark
- `GET /api/marks/statistics` - Get marks statistics

### Export Services
- `GET /api/export/data/:summaryId` - Get export data
- `GET /api/export/excel/:summaryId` - Export to Excel

## 🧮 Data Structures & Algorithms

### Dynamic Linked List
- **Purpose**: Efficient student data management
- **Operations**: Add, remove, search, update student records
- **Benefits**: Dynamic memory allocation, O(1) insertion at head
- **Implementation**: `src/data_structures/d_linked_list.js`

### Selection Sort Algorithm
- **Purpose**: Student performance ranking and grade calculation
- **Time Complexity**: O(n²) for all cases
- **Space Complexity**: O(1) - in-place sorting
- **Features**: Stable sorting, grade calculation, statistics generation
- **Implementation**: `src/data_structures/selection_sort.js`

## 🔍 Key Features Explained

### Linked List Implementation
```javascript
// Example usage of the custom linked list
const studentList = new DLinkedList();
studentList.add({ name: "John Doe", mark: 85 });
studentList.add({ name: "Jane Smith", mark: 92 });

// Efficient retrieval and updates
const topStudent = studentList.get(0);
const allStudents = studentList.toArray();
```

### Selection Sort Features
```javascript
// Sort students by marks with grade calculation
const sortedStudents = SelectionSort.sortStudentsWithGrades(students, true);

// Get sorting statistics
const stats = SelectionSort.getSortingStats(original, sorted);
console.log(`Comparisons: ${stats.comparisons}, Swaps: ${stats.swaps}`);
```

## 🌐 Page Routes

- `/` - Home page with module selection
- `/templates` - Subject template management
- `/templates/create` - Create new subject template
- `/summary` - Summary report home
- `/summary/initialization` - Initialize new reports
- `/marks_manager` - Student marks management
- `/export` - Report export functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Development Guidelines

### Code Style
- Use ES6+ features where appropriate
- Follow consistent naming conventions
- Comment complex algorithms and business logic
- Maintain separation of concerns

### Database Schema
- Use Mongoose schemas for data validation
- Implement proper indexing for performance
- Follow MongoDB best practices

### Error Handling
- Implement comprehensive error handling
- Use appropriate HTTP status codes
- Log errors for debugging purposes

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check MongoDB service status
   sudo systemctl status mongod
   
   # Restart MongoDB service
   sudo systemctl restart mongod
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

3. **Module Not Found Errors**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

## 📊 Performance Considerations

- **Database Indexing**: Implement proper indexes for frequently queried fields
- **Caching**: Consider implementing Redis for session management
- **File Upload**: Implement file size limits and validation
- **API Rate Limiting**: Add rate limiting for production deployment

## 🔒 Security Features

- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Properly configured cross-origin requests
- **Error Handling**: Secure error messages without sensitive information
- **Environment Variables**: Sensitive data stored in environment variables

## 📈 Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time updates using WebSockets
- [ ] Advanced analytics and reporting
- [ ] Mobile-responsive design improvements
- [ ] PDF export functionality
- [ ] Batch import from CSV/Excel files
- [ ] Advanced search and filtering options
- [ ] Role-based access control

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **AshenKavinda** - Initial work - [GitHub Profile](https://github.com/AshenKavinda)

## 🙏 Acknowledgments

- Built as part of PDSA (Principles of Data Structures and Algorithms) coursework
- Inspired by real-world school management needs
- Thanks to the open-source community for the amazing tools and libraries

## 📞 Support

For support and questions, please open an issue on the [GitHub repository](https://github.com/AshenKavinda/School-summary-report/issues).

---

**Happy Coding! 🎓📚**