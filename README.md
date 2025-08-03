# 🌟 SAVIOUR - Disaster Management Platform

<div align="center">
  <picture>
    <source srcset="/assets/images/Saviour2.png" media="(prefers-color-scheme: dark)" />
    <source srcset="/assets/images/Saviour.png" media="(prefers-color-scheme: light)" />
    <img src="/assets/images/Saviour.png" alt="Saviour Logo" width="300px" />
  </picture>
  
  <h3>Empowering communities to prepare, respond, and recover from disasters</h3>
</div>



## 🚀 Overview

**SAVIOUR** is a cutting-edge disaster management platform built to save lives and strengthen community resilience during emergencies. Leveraging modern mobile technologies, our application delivers:

- ⚡ **Real-time emergency coordination**
- 🔔 **Instant alerts and notifications**
- 📍 **Location-based resource tracking**
- 👥 **Community support networks**
- 📊 **Resource management tools**
- 🛡️ **Comprehensive safety information**
- 📱 **Available on iOS and Android platforms**

## ✨ Key Features

### 🚨 Emergency Alert System
<details>
<summary><b>Expand for details</b></summary>

- Real-time SOS alerts with location tracking
- Multi-level emergency categorization (High/Medium/Low priority)
- Support for various emergency types (Medical, Fire, Natural Disasters, etc.)
- Image upload capability for emergency documentation
- 5-second cancellation window for accidental alerts
</details>

### 🗺️ Navigation & Location Services
<details>
<summary><b>Expand for details</b></summary>

- Fast location detection with caching for immediate response
- Fallback mechanisms for geolocation services
- Integration with OpenWeatherMap for local weather alerts
- Map visualization of nearby emergencies and resources
</details>

### 📊 Resource Management
<details>
<summary><b>Expand for details</b></summary>

- Track essential supplies in your area
- Request and offer resources during emergencies
- Inventory management for disaster response teams
- Base64 storage for images and documents
</details>

### 👥 Community Support
<details>
<summary><b>Expand for details</b></summary>

- User-to-user assistance network
- Community chat for local coordination
- Help tracking for emergency responders
- SOS response coordination
</details>

### 📱 User & Admin Dashboards
<details>
<summary><b>Expand for details</b></summary>

- User-friendly dashboards with real-time updates
- Admin controls for resource allocation and emergency management
- Safety statistics and activity tracking
- Quick action buttons for common emergency tasks
</details>

### 🛡️ Safety Information
<details>
<summary><b>Expand for details</b></summary>

- Comprehensive safety guidelines for different emergencies
- Video tutorials for first aid and safety procedures
- Interactive safety guide for various disaster scenarios
- Educational resources on disaster preparedness
</details>

## 💻 Technical Stack

<div align="center">
  <p>
    <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-0.79.5-61DAFB?style=for-the-badge&logo=react" alt="React Native"></a>
    <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-53.0.12-000020?style=for-the-badge&logo=expo" alt="Expo"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  </p>
  <p>
    <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-11.9.1-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"></a>
    <a href="https://docs.expo.dev/router/introduction/"><img src="https://img.shields.io/badge/Expo_Router-5.1.0-000020?style=for-the-badge&logo=expo" alt="Expo Router"></a>
    <a href="https://github.com/vikrantwiz02/Saviour"><img src="https://img.shields.io/badge/iOS_App-Available-black?style=for-the-badge&logo=apple" alt="iOS"></a>
  </p>
  <p>
    <a href="https://github.com/vikrantwiz02/Saviour"><img src="https://img.shields.io/badge/Android_App-Available-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"></a>
  </p>
  
  <table>
    <tr>
      <th>Frontend</th>
      <th>Backend</th>
      <th>Mobile Features</th>
    </tr>
    <tr>
      <td>
        <ul>
          <li>React Native 0.79.5</li>
          <li>Expo SDK 53.0.12</li>
          <li>Native Base Components</li>
          <li>React Context API</li>
          <li>React Native Maps</li>
          <li>Reanimated Animations</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Firebase Firestore</li>
          <li>Firebase Authentication</li>
          <li>Firebase Cloud Messaging</li>
          <li>Expo Notifications</li>
          <li>OpenWeatherMap API</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>File-based Routing</li>
          <li>Push Notifications</li>
          <li>Location Services</li>
          <li>Haptic Feedback</li>
          <li>Media Playback</li>
          <li>Offline Support</li>
        </ul>
      </td>
    </tr>
  </table>
</div>

## 📂 Project Structure

```
saviour-mobile/
├── app/                     # Main application screens using file-based routing
│   ├── (auth)/              # Authentication screens (login, signup, forgot-password)
│   ├── (tabs)/              # Main tab (User) navigation screens
│   ├── Admin/               # Administrator-specific screens
│   └── Employee/            # Employee-specific screens
├── assets/                  # Images, fonts, videos, and sounds
│   ├── fonts/               # Custom fonts
│   ├── images/              # App images and icons
│   ├── safety-videos/       # Safety tutorial videos
│   └── sounds/              # Alert and notification sounds
├── components/              # Reusable UI components
│   ├── Chat/                # Chat-related components
│   ├── Map/                 # Map visualization components
│   ├── Modals/              # Modal dialogs
│   ├── Safety/              # Safety information components
│   └── ui/                  # Base UI components
├── constants/               # Theme configurations and color schemes
├── context/                 # React Context providers (Auth, Theme)
├── hooks/                   # Custom React hooks
└── lib/                     # Utility functions and configurations
```

## � Getting Started

<details>
<summary><b>Prerequisites</b></summary>

- Node.js (v18 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)
- Firebase account
</details>

### 📱 Installation Steps

1. **Clone the repository:**
```bash
git clone https://github.com/vikrantwiz02/Saviour.git
cd Saviour
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up Firebase configuration:**
   - Create a Firebase project
   - Add iOS and Android apps to your Firebase project
   - Configure the Firebase credentials in `/lib/firebase.ts`

4. **Start the development server:**
```bash
npx expo start
```

5. **Run on specific platform:**
```bash
# For iOS
npx expo start
press i or scan the QR from Expo Go app

# For Android
npx expo start
press a or scan the QR from Expo Go app
```

## ⚡ Performance Optimizations

<div align="center">
  <table>
    <tr>
      <td align="center"><h3>🚀</h3> Location caching</td>
      <td align="center"><h3>⚡</h3> Optimized Firebase queries</td>
      <td align="center"><h3>📱</h3> Progressive loading</td>
    </tr>
    <tr>
      <td>Speeds up emergency responses</td>
      <td>Faster data retrieval</td>
      <td>Optimized UI components</td>
    </tr>
    <tr>
      <td align="center"><h3>📍</h3> Geolocation fallbacks</td>
      <td align="center"><h3>🖼️</h3> Expo Image optimization</td>
      <td align="center"><h3>🌐</h3> Offline capability</td>
    </tr>
    <tr>
      <td>Multiple location sources</td>
      <td>Efficient image handling</td>
      <td>Core features work without internet</td>
    </tr>
  </table>
</div>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

<ol>
  <li>Fork the repository</li>
  <li>Create your feature branch (<code>git checkout -b feature/amazing-feature</code>)</li>
  <li>Commit your changes (<code>git commit -m 'Add some amazing feature'</code>)</li>
  <li>Push to the branch (<code>git push origin feature/amazing-feature</code>)</li>
  <li>Open a Pull Request</li>
</ol>

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

<div align="center">
  <a href="https://reactnative.dev/" target="_blank"><img src="https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native"></a>
  <a href="https://expo.dev/" target="_blank"><img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"></a>
  <a href="https://firebase.google.com/" target="_blank"><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"></a>
  <a href="https://docs.expo.dev/router/introduction/" target="_blank"><img src="https://img.shields.io/badge/Expo_Router-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Router"></a>
  <a href="https://openweathermap.org/api" target="_blank"><img src="https://img.shields.io/badge/OpenWeatherMap-EB6E4B?style=for-the-badge&logo=openweathermap&logoColor=white" alt="OpenWeatherMap API"></a>
</div>

## ✨ Team & Contributors

<div align="center">

### Project Leads

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/vikrantwiz02">
        <img src="https://github.com/vikrantwiz02.png" width="100px;" alt="Vikrant Kumar"/>
        <br />
        <sub><b>Vikrant Kumar</b></sub>
      </a>
      <br />
      <small>Project Lead</small>
      <br />
      <a href="mailto:vikrantkrd@gmail.com">Email</a>
    </td>
    <td align="center">
      <a href="https://github.com/Ravikumar-2016">
        <img src="https://github.com/Ravikumar-2016.png" width="100px;" alt="Gunti Ravi Kumar"/>
        <br />
        <sub><b>Gunti Ravi Kumar</b></sub>
      </a>
      <br />
      <a href="https://www.linkedin.com/in/ravikumar-gunti-8b360a2a8">LinkedIn</a>
    </td>
    <td align="center">
      <a href="https://github.com/harshpalas">
        <img src="https://github.com/harshpalas.png" width="100px;" alt="Harsh Kumar Palas"/>
        <br />
        <sub><b>Harsh Kumar Palas</b></sub>
      </a>
      <br />
      <a href="https://www.linkedin.com/in/harsh-kumar-palas-652831249/">LinkedIn</a>
    </td>
    <td align="center">
      <a href="https://github.com/">
        <img src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" width="100px;" alt="Anchal Siddharth Patil"/>
        <br />
        <sub><b>Anchal Siddharth Patil</b></sub>
      </a>
      <br />
      <a href="https://www.linkedin.com/in/anchal-patil-67b18a299/">LinkedIn</a>
    </td>
  </tr>
</table>

</div>

<div align="center">
  <br>
  <p>
    <sub>Built with ❤️ by the SAVIOUR team</sub>
  </p>
</div>
