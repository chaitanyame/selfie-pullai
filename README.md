# 📸 Selfie PullAI

<p align="center">
  <strong>Create fun AI-generated selfies with your favorite celebrities!</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-setup">API Setup</a> •
  <a href="#image-editing-controls">Editing</a> •
  <a href="#custom-templates">Custom Templates</a> •
  <a href="#history-management">History</a> •
  <a href="#testing">Testing</a> •
  <a href="#faq">FAQ</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/Made%20with-❤️-red.svg" alt="Made with Love">
  <img src="https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4.svg" alt="Powered by Gemini">
</p>

---

## ✨ Features

- 🎭 **Celebrity Templates** - Choose from various celebrity scene templates
- 📱 **Mobile-First Design** - Works seamlessly on all devices
- 📷 **Camera Capture** - Take photos directly in the app
- 🤖 **AI-Powered Generation** - Uses Google Gemini API for realistic composites
- 💾 **Local History** - Your creations are saved locally (IndexedDB)
- 🔒 **Privacy-First** - All processing happens client-side, no server storage
- ⚡ **Zero Dependencies** - Pure vanilla JavaScript (~60KB bundle)
- ♿ **Accessible** - WCAG 2.1 AA compliant

## 🎬 How It Works

1. **Select a celebrity template** - Browse the carousel of celebrity scenes
2. **Upload your photo** - Drag & drop, click to upload, or use your camera
3. **Adjust your photo** - Use the position / scale / rotation / opacity controls until it looks right
4. **Generate with AI** - Click "Generate" to create your AI selfie!
5. **Download & Share** - Save your creation or share with friends
6. **Browse history** - Past creations are automatically saved in the history panel
7. **Add your own templates** — Use the **➕ Add Template** button to upload custom celebrity images and create templates from your own photos

## 🚀 Quick Start

### Option 1: Use Directly (No Build Required!)

```bash
# Clone the repository
git clone https://github.com/chaitanyame/selfie-pullai.git
cd selfie-pullai

# Start a local server
npx http-server -p 3000

# Open in browser
open http://localhost:3000
```

### Option 2: Development Setup

```bash
# Clone and install
git clone https://github.com/chaitanyame/selfie-pullai.git
cd selfie-pullai
npm install

# Run tests
npm test

# Start development server
npm start
```

## 🔑 API Setup

This app uses the **Google Gemini API** for AI image generation.

### Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Click the 🔑 button in the app header
4. Paste your API key and save

> **Note:** Your API key is stored locally in your browser's localStorage and is never sent to any server other than Google's API.

### Supported Models

The app uses `gemini-2.0-flash-exp` which supports native image generation.

## 🖼️ Custom Templates

You're not limited to the built-in celebrity scenes! The app lets you upload your own images to create custom templates:

1. Click the **➕ Add Template** button in the header
2. Enter a **Template Name** (e.g., "Beach with Taylor Swift")
3. Enter the **Celebrity Name** (e.g., "Taylor Swift")
4. **Upload an image** — drag & drop or click to select the celebrity/scene photo
5. Click **Save Template** — your custom template appears in the carousel alongside the built-in ones

**How it works:** Custom templates are stored in your browser's `localStorage` and persist across sessions. The AI model receives both your face photo and the custom template image to generate a realistic selfie composite.

**Managing templates:** Custom templates can be removed, and they're clearly marked with a custom badge in the carousel. All processing stays client-side — your images are never uploaded to any server other than Google's Gemini API.

## 🎨 Image Editing Controls

Before generating, you can fine-tune your photo's placement and appearance in the preview canvas:

| Control  | How to Use | What It Does |
|----------|-----------|--------------|
| **Drag to Position** 🖱️ | Click and drag your photo on the canvas | Moves the user photo around the scene |
| **Scale** 🔍 | Slider (50–200%) | Adjusts how large your face appears in the composite |
| **Rotation** 🔄 | Slider (0–360°) | Rotates your photo to match the angle of the scene |
| **Opacity** 👻 | Slider (0–100%) | Blends your photo for a more natural composite |

These controls update the app's edit-parameter store (position, scale, rotation, opacity), and the values are recorded on each history entry for reference.

> **Note on the current build:** the controls are fully wired in the UI, but the renderer currently displays the finished AI composite cover-fit on the 800×800 canvas, and the Gemini request sends your *original* upload — so scale / rotation / opacity / position do not yet transform the live preview or the generated result. Applying these transforms to the composite is a planned editing enhancement (see [Roadmap](#-roadmap)).

### Canvas Preview Features

- **Real-time rendering** — Uses `requestAnimationFrame` for smooth, lag-free preview updates
- **Drag & drop positioning** — Mouse & touch handlers track position on the 800×800 canvas (staged as in the editing note above)
- **Aspect-ratio-aware** — Templates and photos are automatically scaled to cover the canvas while maintaining proportions
- **Multi-device input** — Mouse and touch events both supported for mobile and desktop

## 💾 History Management

Every generated selfie is automatically saved to your browser's **IndexedDB** — your history persists across sessions without any server-side storage.

```js
// Your history lives entirely in your browser
// DB Name: SelfiePullAI | Store: history | Max: 10 items
```

| Feature | Detail |
|---------|--------|
| **Auto-save** | Every generated image is saved with timestamp, template used, and edit parameters |
| **Browsing** | Scroll through your past creations in the history panel |
| **Max capacity** | Keeps the most recent 10 images; oldest are automatically trimmed |
| **Data stored** | Original photo, template ID, edit params (position/scale/rotation/opacity), final generated image |
| **Privacy** | Zero data ever leaves your browser — no cloud sync, no telemetry |

To clear your history, use the **Clear History** button in the app — this purges all stored images from IndexedDB.

## 📁 Project Structure

```
selfie-pullai/
├── index.html              # Main HTML file
├── css/
│   └── style.css           # All styles (~15KB)
├── js/
│   ├── app.js              # Entry point
│   └── modules/
│       ├── store.js        # State management & templates
│       ├── ui.js           # DOM interactions
│       ├── canvas.js       # Canvas rendering
│       ├── processor.js    # Gemini API integration
│       └── db.js           # IndexedDB history
├── assets/
│   └── templates/          # Celebrity template images
├── tests/                  # Playwright specs (66 cases × 2 projects = 132 runs)
└── package.json
```

## 🧪 Testing

The project includes a comprehensive Playwright test suite:

```bash
# Run the full suite
npm test
```

**66 test cases** across **5 spec files** (`actions`, `canvas`, `carousel`, `structure`, `upload`), each executed in **two** browser projects — Desktop Chrome and Mobile Chrome (Pixel 5) — for a total of **132 test executions**:

```bash
# Run with UI
npx playwright test --ui

# Run specific test file
npx playwright test tests/canvas.spec.ts

# Run with coverage report
npx playwright test --reporter=html
```

## 🤝 Contributing

We love contributions! Here's how you can help:

### Quick Contribution Guide

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** your changes: `npm test`
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Development Guidelines

- ✅ **No external dependencies** - Keep it vanilla JS
- ✅ **Mobile-first** - Test on mobile devices
- ✅ **Accessibility** - Maintain WCAG 2.1 AA compliance
- ✅ **Tests required** - All features need Playwright tests
- ✅ **Bundle size** - Keep under 150KB total

### Areas for Contribution

- 🎨 New celebrity templates
- 🌍 Internationalization (i18n)
- 🎭 New scene types
- 📱 PWA support
- 🧪 More test coverage
- 📖 Documentation improvements

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📋 Roadmap

- [x] More celebrity templates
- [x] Custom template upload
- [ ] Apply live editing transforms (scale/rotation/opacity/position) to the composite
- [ ] Style presets (vintage, cartoon, anime, etc.)
- [ ] Social sharing integration
- [ ] PWA support for offline use
- [ ] Multi-language support
- [ ] Template editor

## 🔒 Privacy

Your privacy is important to us:

- **No server storage** - Images are never uploaded to our servers
- **Local processing** - All image handling happens in your browser
- **API key security** - Your Gemini API key stays in localStorage
- **No tracking** - No analytics or user tracking
- **No cookies** - We don't use cookies

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **AI**: Google Gemini API
- **Storage**: IndexedDB, LocalStorage
- **Testing**: Playwright
- **Build**: None required! (Zero build tooling)

## ❓ Frequently Asked Questions

### Why is my generated image blurry or low-quality?
The Gemini 2.0 Flash model outputs images at a default resolution. For best results, use a clear, well-lit front-facing photo with your face prominently visible.

### The "Generate" button is disabled — what's wrong?
Make sure you've completed all three steps: (1) selected a celebrity template, (2) uploaded your photo, and (3) configured your Gemini API key via the 🔑 button in the header.

### Is my API key safe?
Yes. Your API key is stored in your browser's `localStorage` and is only sent to Google's Gemini API endpoint. It is never transmitted to any other server, logged, or shared.

### Can I use the app offline?
Currently the app requires an internet connection for the Gemini API call. Offline PWA support is on the [roadmap](#-roadmap). Template browsing and photo upload work offline.

### Why does the "Add Template" feature exist if I can already choose celebrities?
The built-in templates are a curated set of popular scenes. The custom template feature lets you upload **any** celebrity or scene image — your favorite actor, a family member, a fictional character, or a completely original backdrop.

### How many custom templates can I add?
There's no hard limit, but your browser's `localStorage` has a ~5 MB cap. Each template image is stored as a base64 data URL, so we recommend keeping 10–20 custom templates for optimal performance.

### Do the scale, rotation, and opacity controls change my final image?
Not yet. In the current build the controls update the edit-parameter store and are recorded on each history entry, but the Gemini request sends your *original* upload and the result is shown cover-fit — the transforms are applied neither to the preview nor to the output. Live composite editing is on the [roadmap](#-roadmap).

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - You are free to:
✅ Use commercially
✅ Modify
✅ Distribute
✅ Use privately
```

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for the image generation API
- [Playwright](https://playwright.dev/) for the excellent testing framework
- All our amazing [contributors](https://github.com/chaitanyame/selfie-pullai/graphs/contributors)

## 💬 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/chaitanyame/selfie-pullai/issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Open an issue](https://github.com/chaitanyame/selfie-pullai/issues/new?template=feature_request.md)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/chaitanyame/selfie-pullai/discussions)

---

<p align="center">
  Made with ❤️ by the Open Source Community
</p>

<p align="center">
  <a href="https://github.com/chaitanyame/selfie-pullai/stargazers">⭐ Star us on GitHub!</a>
</p>
