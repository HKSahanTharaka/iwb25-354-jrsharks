# AccessAble - Frontend

A modern, accessible web application that helps people with disabilities discover and share accessible locations in Sri Lanka. Built with React, Vite, and Mantine UI components.

## 🚀 About AccessAble

AccessAble is a comprehensive accessibility platform that connects people with disabilities (PWDs) with accessible locations and caregivers. Our mission is to make Sri Lanka more inclusive by providing verified accessibility information and community-driven reviews.

### Key Features

- **Interactive Map**: Discover wheelchair-friendly places with detailed accessibility information
- **Community Reviews**: Read and write reviews from real users who have visited locations
- **Caregiver Matching**: Connect PWDs with qualified caregivers based on specific needs
- **Place Management**: Add new accessible locations and help build the community database
- **User Roles**: Support for different user types (PWD, Caregiver, Admin)
- **Real-time Updates**: Live location data and community contributions

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Mantine UI** - Modern, accessible component library
- **React Router DOM** - Client-side routing
- **React Leaflet** - Interactive maps integration
- **Tailwind CSS** - Utility-first CSS framework

### Key Dependencies
- `@mantine/core` - UI components and theming
- `@mantine/hooks` - Custom React hooks
- `@mantine/notifications` - Toast notifications
- `@tabler/icons-react` - Icon library
- `leaflet` & `react-leaflet` - Map functionality

## 📋 Prerequisites

Before running this project, make sure you have:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Backend API** running (see backend README for setup)

## 🚀 Quick Start

### 1. Clone and Install
```bash
# Navigate to frontend directory
cd accessable-web

# Install dependencies
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:9090

# Development settings
VITE_APP_NAME=AccessAble
```

### 3. Start Development Server
```bash
# Start the development server
npm run dev

# Open http://localhost:5173 in your browser
```

### 4. Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the project for production |
| `npm run lint` | Run ESLint to check code quality |
| `npm run preview` | Preview the production build locally |

## 🏗️ Project Structure

```
accessable-web/
├── public/                    # Static assets
│   └── vite.svg              # Vite logo
├── src/
│   ├── assets/               # Images and media files
│   │   ├── bg.png           # Background image
│   │   └── icon.png         # App icon
│   ├── components/           # Reusable React components
│   │   ├── Header.jsx       # Main navigation header
│   │   ├── Footer.jsx       # Global footer
│   │   ├── LoginForm.jsx    # User authentication
│   │   ├── MapView.jsx      # Interactive map component
│   │   ├── AddPlaceForm.jsx # Form for adding locations
│   │   └── ...
│   ├── context/             # React context providers
│   │   └── AuthContext.jsx  # Authentication state
│   ├── pages/               # Page components
│   │   ├── MainApp.jsx     # Home page
│   │   ├── AddPlace.jsx    # Add location page
│   │   ├── ShowPlaces.jsx  # Browse locations
│   │   ├── FindCare.jsx    # Caregiver matching
│   │   ├── AdminDashboard.jsx # Admin panel
│   │   └── ...
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── .eslintrc.js            # ESLint configuration
├── tailwind.config.js      # Tailwind CSS config
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:9090` |
| `VITE_APP_NAME` | Application name | `AccessAble` |

### Tailwind Configuration

The project uses Tailwind CSS with custom configuration in `tailwind.config.js`:
- Custom color palette matching the design system
- Extended spacing and typography scales
- Custom component styles

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6) - Main brand color
- **Secondary**: Purple (#8b5cf6) - Accent color
- **Success**: Green (#22c55e) - Success states
- **Warning**: Yellow (#f59e0b) - Warning states
- **Error**: Red (#ef4444) - Error states

### Typography
- **Primary Font**: Inter (system font stack)
- **Headings**: 600-800 weight for hierarchy
- **Body**: 400 weight for readability

## 🔐 Authentication & Authorization

The app supports multiple user roles:
- **Person with Disability (PWD)**: Can browse locations, add reviews, find caregivers
- **Caregiver**: Can view PWD profiles, provide services, manage availability
- **Admin**: Full system access, user management, content moderation

## 🌍 Accessibility Features

- **WCAG 2.1 AA Compliance**: Built with accessibility best practices
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and semantic HTML
- **High Contrast Mode**: Support for accessibility preferences
- **Responsive Design**: Mobile-first approach

## 🚀 Deployment

### Production Build
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- Minified CSS and JavaScript
- Code splitting for better performance
- Asset optimization
- Service worker for caching

### Environment Configuration
For production deployment, ensure these environment variables are set:
```bash
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_NAME=AccessAble
```

## 🐛 Troubleshooting

### Common Issues

1. **Build fails with dependency errors**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Hot reload not working**
   - Check if Vite dev server is running
   - Clear browser cache
   - Restart development server

3. **API connection issues**
   - Verify backend is running on correct port
   - Check CORS configuration
   - Validate environment variables

### Development Tips

- Use `npm run lint` regularly to maintain code quality
- Test on multiple browsers and devices
- Use browser dev tools for debugging
- Check console for runtime errors

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Made with ❤️ for accessibility and inclusion in Sri Lanka**
