# 🧠 Context Vault (Chrome Extension - Manifest V3)

> **"Never lose anything valuable from the web again."**  
> *Created by [Haaswith Sai](https://github.com/HaaswithSai)*

Context Vault allows you to highlight text on any webpage, automatically capture its surrounding context, organize memories with tags and favorites, and search through them instantly—all with **100% local-first privacy**.

---

## 🌟 Key Features

- 🔒 **100% Local & Private**: All data is stored locally in your browser via `chrome.storage.local`. No cloud servers, no trackers, zero data leakage.
- ⚡ **Instant Context Capture**: Right-click any highlighted text -> click **"Save to Context Vault"** -> done.
- 🧠 **Smart DOM Heuristics**: Automatically captures the surrounding paragraph context so you never lose the original meaning.
- 🔍 **Real-Time Instant Search**: Fast substring matching across quotes, page titles, surrounding context, tags, and URLs.
- 🏷️ **Tagging & Favorites**: Organize with custom tag pills (`#research`, `#ideas`) and star favorite quotes.
- 📋 **1-Click Copy & Navigation**: Copy quotes with 1 click or open the original source URL directly in a new tab.

---

## 🚀 How to Install and Run Locally on Your PC

You can run Context Vault on **Google Chrome**, **Brave**, **Microsoft Edge**, **Arc**, **Opera**, or any Chromium-based browser on Windows, macOS, or Linux.

### Method 1: Instant Install (No Coding Required)

1. **Download the Repository**:
   - Click the green **Code** button at the top of this GitHub page and select **Download ZIP** (or clone the repo).
   - Extract the ZIP file to a folder on your computer.

2. **Open Your Browser Extensions Page**:
   - In Google Chrome, open a new tab and go to:
     ```
     chrome://extensions/
     ```
   *(For Microsoft Edge use `edge://extensions/`, for Brave use `brave://extensions/`)*

3. **Enable Developer Mode**:
   - Toggle the **Developer mode** switch in the top-right corner of the page.

4. **Load the Extension**:
   - Click the **"Load unpacked"** button in the top-left corner.
   - Select the `dist` folder located inside the extracted repository folder.

5. **Pin and Enjoy**:
   - Click the **puzzle piece (Extensions) icon** in your browser toolbar.
   - Click the **pin icon** next to **Context Vault** to keep it accessible in your toolbar.

---

### Method 2: Build from Source (For Developers)

If you'd like to inspect, modify, or customize the extension:

#### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- Git

#### 2. Clone the Repository
```bash
git clone https://github.com/HaaswithSai/ContextVault.git
cd ContextVault
```

#### 3. Install Dependencies
```bash
npm install
```

#### 4. Run Live Development Server (Preview Popup in Browser)
```bash
npm run dev
```

#### 5. Build Production Bundle for Chrome
```bash
npm run build
```
This generates the optimized Manifest V3 bundle inside the `dist/` directory.

#### 6. Package into a Distributable ZIP
```bash
npm run package
```
This automatically compiles and packages the extension into `context-vault-v1.0.0.zip` ready for the Chrome Web Store.

---

## 📖 How to Use Context Vault

1. **Capture Text**:
   - Highlight any text or quote on any webpage.
   - Right-click the highlighted text.
   - Select **"Save to Context Vault"** from the context menu.
   - A green **`✓`** badge will flash on the extension icon to confirm it was saved.

2. **Search & Recall**:
   - Click the **Context Vault** icon in your toolbar.
   - Type in the sticky search bar to filter your quotes and web references in real-time.

3. **Organize**:
   - Click **`+ Tag`** on any card to add custom tags.
   - Click the **⭐ Star** icon to add a memory to your favorites tab.
   - Click **`More`** to expand and view the full surrounding context paragraph.

4. **Revisit & Share**:
   - Click the page title to jump straight back to the original webpage.
   - Click the **Copy** icon to copy the quote directly to your clipboard.

---

## 📁 Project Architecture

```
ContextVault/
├── public/
│   ├── manifest.json            # Manifest V3 permissions & entrypoints
│   ├── icons/                   # High-res extension icons (16px, 48px, 128px)
│   └── logo.svg                 # Vector brand logo
├── src/
│   ├── background/
│   │   └── index.ts             # Service worker, context menu & badge feedback
│   ├── content/
│   │   └── index.ts             # Content script & DOM context heuristics engine
│   ├── popup/
│   │   ├── App.tsx              # Main React popup UI & state machine
│   │   ├── components/
│   │   │   ├── Header.tsx       # Header with memory counter
│   │   │   ├── SearchBar.tsx    # Real-time search filter
│   │   │   ├── FilterBar.tsx    # All / Favorites / Tag pills
│   │   │   ├── MemoryCard.tsx   # Card with quote, context & actions
│   │   │   ├── EmptyState.tsx   # Zero-data state handlers
│   │   │   ├── Logo.tsx         # Vector logo component
│   │   │   └── Toast.tsx        # Ephemeral action toasts
│   │   ├── main.tsx             # React entrypoint
│   │   └── index.css            # Tailwind directives & custom scrollbars
│   ├── types/
│   │   └── memory.ts            # Core Memory data schema
│   └── utils/
│       ├── storage.ts           # chrome.storage.local engine with dev fallback
│       └── formatters.ts        # Relative time, domain & tab navigation helpers
├── tests/
│   └── test-engine.mjs          # Automated end-to-end test suite
├── scripts/
│   ├── generate-icons.mjs       # Procedural icon generator
│   └── package-extension.mjs    # Automated ZIP packager
├── dist/                        # Compiled production bundle
├── vite.config.ts               # Multi-entry Vite bundler
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json
```

---

## 🛠️ Tech Stack

- **Extension Standard**: Chrome Manifest V3
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Bundler**: Vite 6 (Multi-entry for popup, service worker, and content scripts)
- **Icons**: Lucide React
- **Storage**: `chrome.storage.local` (Local-first)

---

## 🛡️ Permissions Explained

Context Vault only requests permissions strictly necessary for its functionality:
- `storage`: Persists your captured quotes securely on your local machine.
- `contextMenus`: Adds the right-click **"Save to Context Vault"** menu item when text is highlighted.
- `activeTab`: Accesses the active tab title and URL when saving a memory.
- `scripting`: Injects the context extractor into existing open tabs.

---

## 👤 Author

**Haaswith Sai**  
GitHub: [@HaaswithSai](https://github.com/HaaswithSai)  
Project Repository: [https://github.com/HaaswithSai/ContextVault](https://github.com/HaaswithSai/ContextVault)

---

## 📄 License

This project is licensed under the MIT License - feel free to use, modify, and distribute!
