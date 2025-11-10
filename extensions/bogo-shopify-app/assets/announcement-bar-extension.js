// Analytics tracking function
async function trackAnnouncementBarAnalytics(action, announcementBarId) {
  try {
    const response = await fetch(
      `/apps/bogo-app/api/announcement-bars/${announcementBarId}/track`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      }
    );

    if (!response.ok) {
      console.warn(`Failed to track ${action} analytics`);
    }
  } catch (error) {
    console.error(`Error tracking ${action}:`, error);
  }
}

// Track view when announcement bar is loaded
function trackInitialView(announcementBarId) {
  // Use Intersection Observer to track when bar becomes visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          trackAnnouncementBarAnalytics("view", announcementBarId);
          observer.disconnect(); // Stop observing after first view
        }
      });
    },
    { threshold: 0.5 }
  ); // 50% visible

  const container = document.getElementById("busybuddy-announcement-bar");
  if (container) {
    observer.observe(container);
  }
}

//Counter Timer
function renderTimerBody(theme, timerData, colors) {
  const { days, hours, minutes, seconds } = timerData;

  const parts = [
    { duration: "days", value: days },
    { duration: "hours", value: hours },
    { duration: "minutes", value: minutes },
    { duration: "seconds", value: seconds },
  ];

  const wrapper = document.createElement("div");

  // Classic
  if (theme === "Classic") {
    parts.forEach((part) => {
      const span = document.createElement("span");
      span.style.color = colors.digits;
      span.textContent = `${String(part.value)}${part.duration} ${
        part.duration !== "seconds" ? ":" : ""
      } `;
      wrapper.appendChild(span);
    });

    // Cards
  } else if (theme === "Cards") {
    wrapper.style.display = "flex";
    wrapper.style.gap = "10px";
    parts.forEach((part) => {
      const card = document.createElement("div");
      card.style.width = "70px";
      card.style.borderRadius = "8px";
      card.style.overflow = "hidden";
      card.style.color = colors.digits;

      const top = document.createElement("div");
      top.style.backgroundColor = colors.background;
      top.style.height = "50px";
      top.style.display = "flex";
      top.style.alignItems = "center";
      top.style.justifyContent = "center";
      top.innerHTML = `<span style="font-size: 36px; font-weight: bold;">${String(
        part.value
      )}</span>`;

      const bottom = document.createElement("div");
      bottom.style.backgroundColor = colors.background;
      bottom.style.height = "25px";
      bottom.style.display = "flex";
      bottom.style.alignItems = "center";
      bottom.style.justifyContent = "center";
      bottom.style.borderTop = "1px solid rgba(0,0,0,0.1)";
      bottom.innerHTML = `<span style="font-size: 12px;">${part.duration}</span>`;

      card.appendChild(top);
      card.appendChild(bottom);
      wrapper.appendChild(card);
    });

    // Moderns
  } else if (theme === "Moderns") {
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.justifyContent = "center";
    parts.forEach((part, index) => {
      const box = document.createElement("div");
      box.style.width = "35px";
      box.style.height = "35px";
      box.style.display = "flex";
      box.style.alignItems = "center";
      box.style.justifyContent = "center";
      box.style.borderRadius = "8px";
      box.style.background = `linear-gradient(to bottom, ${colors.gradientStart}, ${colors.gradientEnd})`;
      box.innerHTML = `<span style="font-weight: bold; color: ${
        colors.digits
      }">${String(part.value).padStart(2, "0")}</span>`;

      wrapper.appendChild(box);

      if (index < parts.length - 1) {
        const separator = document.createElement("span");
        separator.textContent = ":";
        separator.style.fontSize = "25px";
        separator.style.fontWeight = "bold";
        separator.style.margin = "0 5px";
        separator.style.color = colors.digits;
        wrapper.appendChild(separator);
      }
    });

    // Hexagon Timer & Progress Circles
  } else if (["Hexagon Timer", "Progress Circles"].includes(theme)) {
    wrapper.style.display = "flex";
    wrapper.style.gap = "10px";

    parts.forEach((part) => {
      const boxWrapper = document.createElement("div");
      boxWrapper.style.textAlign = "center";
      boxWrapper.style.color = colors.digits;
      const shape = document.createElement("div");
      shape.className =
        theme === "Hexagon Timer" ? "hexagon" : "progress-circle";
      shape.style.border = `1px solid ${colors.border}`;
      shape.style.display = "flex";
      shape.style.alignItems = "center";
      shape.style.justifyContent = "center";
      shape.style.width = "50px";
      shape.style.height = "50px";
      shape.innerHTML = `<span>${String(part.value).padStart(2, "0")}</span>`;

      const label = document.createElement("span");
      label.style.fontSize = "15px";
      label.textContent = part.duration;

      boxWrapper.appendChild(shape);
      boxWrapper.appendChild(label);
      wrapper.appendChild(boxWrapper);
    });

    // Progress Bar
  } else if (theme === "Progress Bar") {
    const initialDuration = {
      days: 0,
      hours: 23,
      minutes: 56,
      seconds: 10,
    };

    const totalDurationSeconds =
      initialDuration.days * 86400 +
      initialDuration.hours * 3600 +
      initialDuration.minutes * 60 +
      initialDuration.seconds;

    const remainingSeconds =
      days * 86400 + hours * 3600 + minutes * 60 + seconds;

    const progress = Math.min(
      100,
      ((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100
    ).toFixed(2);

    // Progress bar container
    const progressBarWrapper = document.createElement("div");
    progressBarWrapper.style.width = "100%";
    progressBarWrapper.style.marginBottom = "8px";

    const progressBar = document.createElement("div");
    progressBar.style.width = "100%";
    progressBar.style.height = "15px";
    progressBar.style.backgroundColor = "#D3D3D3";
    progressBar.style.borderRadius = "5px";
    progressBar.style.overflow = "hidden";

    const progressFill = document.createElement("span");
    progressFill.style.display = "block";
    progressFill.style.width = `${progress}%`;
    progressFill.style.height = "100%";
    progressFill.style.backgroundColor = colors.background;
    progressFill.style.borderRadius = "5px 0 0 5px";

    progressBar.appendChild(progressFill);
    progressBarWrapper.appendChild(progressBar);
    wrapper.appendChild(progressBarWrapper);

    // Digits below bar
    const digitsRow = document.createElement("div");
    digitsRow.style.display = "flex";
    digitsRow.style.gap = "5px";
    digitsRow.style.fontWeight = "bold";

    parts.forEach((part) => {
      const span = document.createElement("span");
      span.style.color = colors.digits;
      span.textContent = `${String(part.value)}${part.duration} ${
        part.duration !== "seconds" ? ":" : ""
      } `;
      digitsRow.appendChild(span);
    });

    wrapper.appendChild(digitsRow);

    // Minimalist
  } else if (theme === "Minimalist") {
    wrapper.style.display = "flex";
    wrapper.style.gap = "10px";

    parts.forEach((part) => {
      const col = document.createElement("div");
      col.style.display = "flex";
      col.style.flexDirection = "column";
      col.style.alignItems = "center";
      col.style.justifyContent = "center";
      col.style.color = colors.digits;
      if (part.duration !== "seconds") {
        col.style.borderRight = `1px solid ${colors.border}`;
        col.style.padding = "0 10px";
      }

      const number = document.createElement("span");
      number.style.fontSize = "40px";
      number.style.fontWeight = "bold";
      number.textContent = String(part.value);

      const label = document.createElement("span");
      label.style.fontSize = "15px";
      label.style.color = colors.digits;
      label.textContent = part.duration;

      col.appendChild(number);
      col.appendChild(label);
      wrapper.appendChild(col);
    });

    // Other's
  } else {
    parts.forEach((part) => {
      const span = document.createElement("span");
      span.style.color = colors.digits;
      span.textContent = `${String(part.value)}${part.duration} ${
        part.duration !== "seconds" ? ":" : ""
      } `;
      wrapper.appendChild(span);
    });
  }

  return wrapper;
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("busybuddy-announcement-bar");
  if (!container) return;

  try {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      .ocean {
        height: 80px;
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        overflow-x: hidden;
      }

      .wave {
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='%23003F7C'/%3E%3C/svg%3E");
        position: absolute;
        width: 200%;
        height: 100%;
        animation: wave 10s -3s linear infinite;
        transform: translate3d(0, 0, 0);
        opacity: 0.8;
        display: block !important;
      }

      .wave:nth-of-type(2) {
        bottom: 0;
        animation: wave 18s linear reverse infinite;
        opacity: 0.5;
      }

      .wave:nth-of-type(3) {
        bottom: 0;
        animation: wave 20s -1s linear infinite;
        opacity: 0.5;
      }

      @keyframes wave {
        0% { transform: translateX(0); }
        50% { transform: translateX(-25%); }
        100% { transform: translateX(-50%); }
      }
      
      .scrolling-text {
        animation: scrollText var(--message-animation-speed, 20s) linear infinite;
        display: inline-block;
        white-space: nowrap;
      }

      @keyframes scrollText {
        0% { transform: translateX(0%); }
        100% { transform: translateX(-100%); }
      }

      .hexagon {
          --size: 60px; /* Width of the hexagon */
          width: var(--size);
          height: calc(var(--size) * 1.1547); /* approx: 1.1547 = sqrt(3) */
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 2px;
          border: 1px solid #a0a0a0;       /* Thin gray outline */
          background-color: #ffffff; 
      }

      .progress-circle{
        --size: 70px; /* Width of the hexagon */
          width: var(--size);
          height: calc(var(--size) * 1); /* approx: 1.1547 = sqrt(3) */
          border-radius: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 2px;
          border: 1px solid #a0a0a0;       /* Thin gray outline */
          background-color: #ffffff; 
      }
    `;
    document.head.appendChild(styleTag);

    let response = await fetch(
      `/apps/bogo-app/api/frontStore/getAnnouncementBar`
    );
    const result = await response.json();

    if (result.status !== "SUCCESS" || !result.data) {
      console.warn("No announcement bar found.");
      return;
    }

    const data = result.data;
    const announcementBarId = data._id; // Assuming your API returns the ID

    // Track initial view
    if (announcementBarId) {
      setTimeout(() => trackInitialView(announcementBarId), 1000);
    }

    // Create announcement bar (keep your existing bar creation code)
    const bar = document.createElement("div");
    bar.style.width = data.barWidth ? `${data.barWidth}%` : "100%";
    bar.style.height = data.barHeight ? `${data.barHeight}px` : "60px";
    bar.style.backgroundColor =
      data.generalColorSettings?.["Background Color"] || "#007bff";
    bar.style.color =
      data.generalColorSettings?.["Message Font Color"] || "#ffffff";
    bar.style.position =
      data.barPosition === "top-fixed"
        ? "sticky"
        : data.barPosition === "bottom"
        ? "absolute"
        : "relative";
    bar.style.top = data.barPosition === "top-fixed" ? "0" : "auto";
    bar.style.bottom = data.barPosition === "bottom" ? "0" : "auto";
    bar.style.display = "flex";
    bar.style.flexDirection = "column";
    bar.style.alignItems = "center";
    bar.style.justifyContent = "center";
    bar.style.gap = "15px";
    bar.style.padding = "12px 16px";
    bar.style.borderRadius =
      data.barPosition === "bottom" ? "0 0 8px 8px" : "8px 8px 0 0";
    bar.style.zIndex = "9999";
    bar.style.position = "relative";
    bar.style.overflow = "hidden";

    const contentWrapper = document.createElement("div");
    contentWrapper.style.position = "relative";
    contentWrapper.style.zIndex = "2";
    contentWrapper.style.display = "flex";
    contentWrapper.style.flexDirection = "column";
    contentWrapper.style.alignItems = "center";
    contentWrapper.style.justifyContent = "center";
    contentWrapper.style.gap = "15px";
    contentWrapper.style.width = "100%";

    // Apply background styles
    if (data.selectedTheme === "image-upload" && data.uploadedImage) {
      bar.style.backgroundImage = `url(${data.uploadedImage})`;
      bar.style.backgroundSize = "cover";
      bar.style.backgroundPosition = "center";
    } else if (data.selectedTheme !== "solid") {
      bar.style.backgroundImage = `url(${data.selectedTheme})`;
      bar.style.backgroundSize = "cover";
      bar.style.backgroundPosition = "center";
    } else {
      bar.style.backgroundColor =
        data.colorSettings["Background Color"] || "#007bff";
    }

    // Message section
    if (data.showMessage && data.message) {
      const messageContainer = document.createElement("div");
      messageContainer.style.overflow = "hidden";
      messageContainer.style.flexGrow = "2";
      messageContainer.style.whiteSpace = "nowrap";
      messageContainer.style.textAlign = "center";
      messageContainer.style.width = "100%";

      const h2 = document.createElement("h2");
      h2.style.margin = "0";
      h2.style.color = data.generalColorSettings["Message Font Color"];
      h2.style.fontSize = data.messageDesktopFontSettings?.fontSize || "18px";
      h2.style.fontFamily =
        data.messageDesktopFontSettings?.fontFamily || "Inter";
      h2.style.fontWeight =
        data.messageDesktopFontSettings?.fontWeight || "600";
      h2.style.letterSpacing =
        data.messageDesktopFontSettings?.letterSpacing || "0px";
      h2.style.lineHeight =
        data.messageDesktopFontSettings?.lineHeight || "1.2";
      h2.style.display = "inline-block";
      h2.style.borderBottom = "none";

      if (data.animateMessage) {
        h2.classList.add("scrolling-text");
        h2.style.setProperty(
          "--message-animation-speed",
          `${data.messageAnimationSpeed || 20}s`
        );

        const messageContent = Array(10)
          .fill(data.message || "Type text here")
          .map(
            (msg, i) =>
              `<span key="${i}" style="margin-right: 40px;">${msg}</span>`
          )
          .join("");
        h2.innerHTML = messageContent;
      } else {
        h2.innerText = data.message || "Type text here";
      }

      messageContainer.appendChild(h2);
      contentWrapper.appendChild(messageContainer);
    }

    const flexContainer = document.createElement("div");
    flexContainer.style.display = "flex";
    flexContainer.style.alignItems = "center";
    flexContainer.style.justifyContent = "center";
    flexContainer.style.gap = "15px";

    // Save box
    if (data.showSaveBox) {
      const saveBox = document.createElement("div");
      saveBox.innerText = data.saveBoxText || "SAVE";
      saveBox.style.backgroundColor = data.saveBoxSettings.backgroundColor;
      saveBox.style.color = data.saveBoxSettings.fontColor;
      saveBox.style.fontSize = data.saveBoxSettings.fontSize;
      saveBox.style.fontFamily = data.saveBoxSettings.fontFamily;
      saveBox.style.fontWeight = data.saveBoxSettings.fontWeight;
      saveBox.style.padding = data.saveBoxSettings.padding;
      saveBox.style.borderRadius = data.saveBoxSettings.borderRadius;
      saveBox.style.border = `1px solid ${data.saveBoxSettings.borderColor}`;
      saveBox.style.whiteSpace = "nowrap";
      flexContainer.appendChild(saveBox);
    }

    // Countdown timer
    if (data.type === "Countdown Timer" && data.isTimerActive) {
      const timer = document.createElement("div");
      timer.style.display = "flex";
      timer.style.gap = data.timerBlockSettings?.spacing || "10px";
      timer.style.fontSize = data.timerDesktopFontSettings?.fontSize || "16px";
      timer.style.fontWeight =
        data.timerDesktopFontSettings?.fontWeight || "700";

      let targetDateTime = null;
      if (data.targetDate && data.targetTime) {
        targetDateTime = new Date(`${data.targetDate}T${data.targetTime}`);
      }

      function updateTimer() {
        if (!targetDateTime || isNaN(targetDateTime.getTime())) {
          timer.innerText = "00d 00h 00m 00s";
          return;
        }

        const now = new Date();
        const diff = targetDateTime - now;
        if (diff <= 0) {
          timer.innerText = "Expired!";
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        timer.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      flexContainer.appendChild(timer);
    }

    contentWrapper.appendChild(flexContainer);
    bar.appendChild(contentWrapper);

    // End sale message
    if (data.showEndSaleMessage) {
      const endSale = document.createElement("div");
      const timer = document.createElement("span");
      let targetDateTime = null;
      if (data.targetDate) {
        targetDateTime = new Date(`${data.targetDate}`);
      }
      function updateTimer() {
        if (!targetDateTime || isNaN(targetDateTime.getTime())) {
          timer.innerText = "00d 00h 00m 00s";
          endSale.innerText =
            `${data.endSaleMessage} ${timer.innerText}` || "End Sale";
          return;
        }

        const now = new Date();
        const diff = targetDateTime - now;
        if (diff <= 0) {
          timer.innerText = "Expired!";
          endSale.innerText =
            `${data.endSaleMessage} ${timer.innerText}` || "End Sale";
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        timer.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        endSale.innerText =
          `${data.endSaleMessage} ${timer.innerText}` || "End Sale";
      }
      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      endSale.style.backgroundColor =
        data.endSaleMessageSettings.backgroundColor;
      endSale.style.color = data.endSaleMessageSettings.fontColor;
      endSale.style.fontSize = data.endSaleMessageSettings.fontSize;
      endSale.style.fontFamily = data.endSaleMessageSettings.fontFamily;
      endSale.style.fontWeight = data.endSaleMessageSettings.fontWeight;
      endSale.style.padding = "5px 10px";
      endSale.style.borderRadius = "8px 18px 8px 8px";
      endSale.style.position = "absolute";
      endSale.style.height = "29px";
      endSale.style.top = "0px";
      endSale.style.right = "0px";
      endSale.style.zIndex = 99;
      endSale.style.gap = "5px";
      endSale.style.flexShrink = 0;
      endSale.style.boxSizing = "border-box";
      endSale.style.whiteSpace = "nowrap";
      endSale.style.display = "flex";
      endSale.style.flexDirection = "row";
      endSale.style.alignItems = "center";
      bar.appendChild(endSale);
    }

    //Counter Timer
    if (data.showTimerOptions) {
      const { theme, alignment, colors, margin, title, startDate, endDate } =
        data.timerStylingSettings;

      const container = document.createElement("div");
      container.className =
        theme === "Classic" ? "timer-block" : "countdown-container";
      container.style.position = "relative";
      container.style.zIndex = "9999";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.justifyContent = alignment.toLowerCase();
      container.style.alignItems = alignment.toLowerCase();
      container.style.textAlign = alignment.toLowerCase();
      container.style.marginTop = `${margin?.top?.value || 0}${
        margin?.top?.unit || "px"
      }`;
      container.style.marginBottom = `${margin?.bottom?.value || 0}${
        margin?.bottom?.unit || "px"
      }`;

      container.style.padding = "10px 15px";
      container.style.borderRadius = "8px";
      container.style.color = colors?.title || "#000";

      const titleSpan = document.createElement("div");
      titleSpan.innerText = `${title}`;
      titleSpan.style.color = colors?.title || "#000";
      titleSpan.style.fontSize = "15px";
      titleSpan.style.marginTop = "0px";
      container.appendChild(titleSpan);

      const countdownWrapper = document.createElement("div");
      countdownWrapper.className = "timer-countdown-wrapper";
      container.appendChild(countdownWrapper);

      function updateTimer() {
        let now = new Date();
        let targetDate = null;

        if (startDate && endDate) {
          targetDate = new Date(endDate);
          now = new Date(startDate);
        } else if (startDate) {
          targetDate = new Date(startDate);
        } else if (endDate) {
          targetDate = new Date(endDate);
        } else {
          targetDate = new Date();
        }

        const diff = targetDate - now;

        if (isNaN(targetDate.getTime()) || diff <= 0) {
          countdownWrapper.innerHTML = `<span style="color: red; font-weight: bold;">Expired!</span>`;
          clearInterval(timerInterval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Create updated DOM for the selected theme
        const timerData = { days, hours, minutes, seconds };
        const newContent = renderTimerBody(theme, timerData, colors);

        // Replace old content
        countdownWrapper.innerHTML = "";
        countdownWrapper.appendChild(newContent);
      }

      const timerInterval = setInterval(updateTimer, 1000);
      updateTimer(); // Initial call

      flexContainer.appendChild(container);
      // bar.appendChild(container);
    }

    
    // Shop Now Button with click tracking
    if (data.showShopNowButton) {
      const button = document.createElement("button");
      button.innerText = data.shopNowButtonText || "Shop Now";
      button.style.backgroundColor = data.shopNowButtonSettings.backgroundColor;
      button.style.color = data.shopNowButtonSettings.fontColor;
      button.style.fontSize = data.shopNowButtonSettings.fontSize;
      button.style.fontFamily = data.shopNowButtonSettings.fontFamily;
      button.style.fontWeight = data.shopNowButtonSettings.fontWeight;
      button.style.padding = data.shopNowButtonSettings.padding;
      button.style.borderRadius = data.shopNowButtonSettings.borderRadius;
      button.style.border = `1px solid ${data.shopNowButtonSettings.borderColor}`;
      button.style.marginTop = "0px";
      button.style.cursor = "pointer";

      button.onclick = () => {
        // Track click before navigation
        if (announcementBarId) {
          trackAnnouncementBarAnalytics("click", announcementBarId);
        }
        window.location.href = data.shopNowButtonUrl || "/";
      };

      flexContainer.appendChild(button);
    }

    // Wave animation
    if (data.showWaveOptions) {
      const ocean = document.createElement("div");
      ocean.classList.add("ocean");
      ocean.style.position = "absolute";
      ocean.style.bottom = "0";
      ocean.style.left = "0";
      ocean.style.width = "100%";
      ocean.style.height = "80px";
      ocean.style.overflow = "hidden";
      ocean.style.zIndex = "1";

      for (let i = 0; i < 3; i++) {
        const wave = document.createElement("div");
        wave.classList.add("wave");
        ocean.appendChild(wave);
      }
      bar.appendChild(ocean);
    }

    container.appendChild(bar);
  } catch (error) {
    console.error("Error loading announcement bar:", error);
  }
});
