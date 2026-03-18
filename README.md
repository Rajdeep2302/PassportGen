# 📸 PassportGen

**PassportGen** is a privacy-first, browser-based tool designed to create professional passport and ID photos in seconds. It combines advanced background removal, intelligent cropping, and AI-powered restoration tips to deliver high-quality results without your data ever leaving your device.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)

---

## ✨ Features

- **🚀 Instant Background Removal**: Automatically detects and removes backgrounds using `@imgly/background-removal` (runs locally in your browser).
- **✂️ Intelligent Cropping**: Easy-to-use cropping tool to ensure your photo meets official ID requirements.
- **🎨 Custom Backgrounds**: Choose from standard colors (White, Blue, etc.) for your ID photo.
- **🪄 AI Photo Restoration**: Built-in guide and "Magic Prompt" to restore vintage or damaged photos using Google Gemini.
- **🔒 Privacy First**: All image processing (removal, cropping, adjustments) happens entirely on your machine. No images are uploaded to any server.
- **✨ Premium UI**: Modern, responsive design with smooth GSAP animations and Dark Mode support.

---

## 🛠️ Tech Stack

- **Core**: [React 19](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/) (GreenSock Animation Platform)
- **Image Processing**:
  - `@imgly/background-removal`: WebAssembly-powered background extraction.
  - `react-image-crop`: Flexible cropping component.
- **Icons**: [Lucide React](https://lucide.dev/)
- **Export**: [jsPDF](https://github.com/parallax/jsPDF)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/passport-generator.git
   cd passport-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory (optional, if needed for future API integrations).
   ```env
   VITE_APP_TITLE=PassportGen
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📖 How to Use

1. **Upload**: Select or drag-and-drop your photo into the portal.
2. **Process**: Wait a few seconds for the browser-based AI to remove the background.
3. **Crop**: Adjust the crop box to frame your face correctly.
4. **Adjust**: Choose your desired background color and fine-tune the result.
5. **Export**: Preview and download your professional ID photo.

### 🕰️ Restoring Old Photos
Switch to **"Restore Auto"** mode in the header to access the restoration guide. Copy our expert "Magic Prompt" and follow the instructions to use Google Gemini for high-end restoration and colorization.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for a private and fast photo experience.
</p>
