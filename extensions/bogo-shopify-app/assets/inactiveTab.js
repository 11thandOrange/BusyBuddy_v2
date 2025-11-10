// inactiveTab.js - Simplified Version
class InactiveTabManager {
  constructor() {
    this.settings = null;
    this.originalTitle = document.title;
    this.originalFavicon = this.getFavicon();
    this.isActive = false;
    this.init();
  }

  async init() {
    try {
      // Load settings from server
      await this.loadSettings();
      
      // Only proceed if feature is enabled
      if (this.settings?.isEnabled) {
        this.setupEventListeners();
        this.isActive = true;
        console.log("Inactive Tab Manager started");
      }
    } catch (error) {
      console.error("Error starting Inactive Tab Manager:", error);
    }
  }

  async loadSettings() {
    try {
      // Try to get settings from server
      const response = await fetch('/apps/bogo-app/api/frontStore/getInactiveTab');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === "SUCCESS") {
          this.settings = data.data;
          return;
        }
      }
      
      // If server request fails, use default settings
      console.warn("Using default settings");
      this.settings = {
        message: "👀 Don't miss out on our special offers!",
        isEnabled: false,
        startDate: null,
        endDate: null,
        imageUrl: null,
      };
    } catch (error) {
      console.error("Error loading settings:", error);
      
      // Fallback to default settings
      this.settings = {
        message: "👀 Don't miss out on our special offers!",
        isEnabled: false,
        startDate: null,
        endDate: null,
        imageUrl: null,
      };
    }
  }

  getFavicon() {
    // Find the favicon in the page
    const favicon = document.querySelector("link[rel*='icon']") || 
                    document.querySelector("link[rel='shortcut icon']");
    return favicon ? favicon.href : "/favicon.ico";
  }

  setupEventListeners() {
    // When tab becomes hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.tabInactive();
      } else {
        this.tabActive();
      }
    });

    // When window loses focus
    window.addEventListener("blur", () => {
      this.tabInactive();
    });

    // When window gains focus
    window.addEventListener("focus", () => {
      this.tabActive();
    });

    console.log("Event listeners added");
  }

  tabInactive() {
    // Only show message if enabled and within date range
    if (this.settings.isEnabled && this.isWithinDateRange()) {
      this.showInactiveMessage();
    }
  }

  tabActive() {
    // Restore original tab appearance
    this.restoreOriginalState();
  }

  showInactiveMessage() {
    if (this.settings?.message) {
      // Change tab title
      document.title = this.settings.message;

      // Change favicon if provided
      if (this.settings?.imageUrl) {
        this.changeFavicon(this.settings.imageUrl);
      }

      console.log("Showing inactive tab message");
    }
  }

  restoreOriginalState() {
    // Restore original title
    document.title = this.originalTitle;
    
    // Restore original favicon
    this.restoreFavicon();
  }

  changeFavicon(newFaviconUrl) {
    // Find or create favicon element
    let favicon = document.querySelector("link[rel*='icon']") || 
                  document.querySelector("link[rel='shortcut icon']");
    
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    
    // Store original favicon if not already stored
    if (!favicon.hasAttribute("data-original")) {
      favicon.setAttribute("data-original", favicon.href || this.originalFavicon);
    }
    
    // Set new favicon
    favicon.href = newFaviconUrl;
  }

  restoreFavicon() {
    // Find favicon element
    const favicon = document.querySelector("link[rel*='icon']") || 
                    document.querySelector("link[rel='shortcut icon']");
    
    // Restore original if available
    if (favicon && favicon.hasAttribute("data-original")) {
      favicon.href = favicon.getAttribute("data-original");
    }
  }

  isWithinDateRange() {
    // If no dates set, always active
    if (!this.settings.startDate && !this.settings.endDate) {
      return true;
    }

    const now = new Date();
    const start = this.settings.startDate ? new Date(this.settings.startDate) : null;
    const end = this.settings.endDate ? new Date(this.settings.endDate) : null;

    // Check if current time is within range
    if (start && now < start) return false;
    if (end && now > end) return false;

    return true;
  }
}

// Start the manager when page loads
function startInactiveTabManager() {
  if (typeof document === "undefined") return;
  
  const manager = new InactiveTabManager();
  window.InactiveTabManager = manager;
  return manager;
}

// Start when page is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startInactiveTabManager);
} else {
  startInactiveTabManager();
}